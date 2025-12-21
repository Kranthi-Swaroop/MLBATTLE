const { spawn } = require('child_process');
const Competition = require('../models/Competition');
const User = require('../models/User');

const calculateNormalizedScore = (value, config) => {
    try {
        const { higherIsBetter, metricMinValue, metricMaxValue, pointsForPerfectScore } = config;
        const val = parseFloat(value) || 0;
        const min = parseFloat(metricMinValue) || 0;
        const max = parseFloat(metricMaxValue) || 1;
        const psPoints = parseFloat(pointsForPerfectScore) || 100;

        if (max === min) return 0;

        let normalized;
        if (higherIsBetter) {
            normalized = ((val - min) / (max - min)) * psPoints;
        } else {
            normalized = ((max - val) / (max - min)) * psPoints;
        }

        // Clamp between 0 and pointsForPerfectScore
        return Math.max(0, Math.min(psPoints, normalized));
    } catch (error) {
        console.error('Error calculating normalized score:', error);
        return 0;
    }
};

const parseLeaderboardCSV = (csvData, competition) => {
    const lines = csvData.trim().split('\n');
    const csvLines = lines.filter(line => line.includes(',') && !line.startsWith('Next Page Token'));
    if (csvLines.length < 2) return [];

    const headers = csvLines[0].split(',').map(h => h.trim().toLowerCase());

    const entries = [];
    for (let i = 1; i < csvLines.length; i++) {
        const values = parseCSVLine(csvLines[i]);
        if (values.length >= 2) {
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });

            const rawScore = parseFloat(entry.score || entry.publicscore || 0);
            const normalizedScore = calculateNormalizedScore(rawScore, competition);

            entries.push({
                rank: parseInt(entry.rank || entry['#'] || i, 10),
                kaggleUsername: entry.teamname || entry.team || entry.username || '',
                teamName: entry.teamname || entry.team || '',
                score: rawScore,        // Raw Kaggle score for display
                normalizedScore: normalizedScore, // 0-100 score for internal ranking
                entries: parseInt(entry.entries || entry.submissions || 0, 10),
                lastSubmission: entry.lastsubmission ? new Date(entry.lastsubmission) : null
            });
        }
    }
    return entries;
};

const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else current += char;
    }
    result.push(current.trim());
    return result;
};

const fetchKaggleLeaderboard = (competitionSlug) => {
    return new Promise((resolve, reject) => {
        const args = [
            'competitions',
            'leaderboard',
            competitionSlug.trim(),
            '-s',
            '--csv',
            '--page-size',
            '200'
        ];

        const env = {};
        Object.keys(process.env).forEach(key => {
            env[key] = (process.env[key] || '').trim();
        });

        // CRITICAL: Force UTF-8 encoding for Python-based Kaggle CLI
        env.PYTHONIOENCODING = 'utf-8';
        env.LANG = 'en_US.UTF-8';

        console.log(`[KaggleSync] Spawning: kaggle ${args.join(' ')}`);

        const child = spawn('kaggle', args, { env });
        let stdout = '';
        let stderr = '';

        child.stdout.on('data', data => stdout += data.toString('utf8'));
        child.stderr.on('data', data => stderr += data.toString('utf8'));

        child.on('close', code => {
            // Some CLI tools exit with code 1 but still provide valid output (like encoding warnings)
            // If we have CSV-like output, we might want to proceed.
            if (code !== 0 && !stdout.includes(',')) {
                console.error(`Kaggle CLI failed for ${competitionSlug}:`, stderr);
                reject(new Error(stderr || `Kaggle CLI failed with code ${code}`));
                return;
            }
            resolve(stdout);
        });

        child.on('error', err => {
            reject(err);
        });
    });
};

const fetchCompetitionDetails = (slug) => {
    return new Promise((resolve, reject) => {
        const args = [
            'competitions',
            'list',
            '--search',
            slug.trim(),
            '--csv'
        ];

        const env = {};
        Object.keys(process.env).forEach(key => {
            env[key] = (process.env[key] || '').trim();
        });
        env.PYTHONIOENCODING = 'utf-8';

        const child = spawn('kaggle', args, { env });
        let stdout = '';
        let stderr = '';

        child.stdout.on('data', data => stdout += data.toString('utf8'));
        child.stderr.on('data', data => stderr += data.toString('utf8'));

        child.on('close', code => {
            if (code !== 0 && !stdout.includes(',')) {
                reject(new Error(stderr || `Kaggle CLI failed with code ${code}`));
                return;
            }

            const lines = stdout.trim().split('\n');
            if (lines.length < 2) {
                reject(new Error('Competition not found'));
                return;
            }

            const values = parseCSVLine(lines[1]);
            const ref = values[0];
            const refSlug = ref.split('/').pop();

            resolve({
                kaggleSlug: refSlug,
                url: ref,
                deadline: new Date(values[1]),
                platform: 'kaggle',
                title: refSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                description: `Imported from Kaggle (${values[2]})`
            });
        });
    });
};

const matchPlatformUsers = async (leaderboard) => {
    const kaggleUsernames = leaderboard.map(entry => entry.kaggleUsername).filter(Boolean);
    
    // Get all users - name field is used as Kaggle display name
    const users = await User.find({}).select('_id name');
    
    // Build lookup maps for matching (user's name = their Kaggle display name)
    const exactNameMap = new Map(); // 1. Exact match on name (case-insensitive)
    const normalizedNameMap = new Map(); // 2. Normalized name match (fallback)
    
    users.forEach(user => {
        const name = user.name || '';
        exactNameMap.set(name.toLowerCase(), user);
        const normalizedName = name.toLowerCase().replace(/[\s_-]/g, '');
        normalizedNameMap.set(normalizedName, user);
    });
    
    console.log(`[KaggleSync] Attempting to match ${kaggleUsernames.length} leaderboard entries against ${users.length} platform users`);
    
    return leaderboard.map(entry => {
        const leaderboardName = entry.kaggleUsername || '';
        const leaderboardNameLower = leaderboardName.toLowerCase();
        const leaderboardNameNormalized = leaderboardNameLower.replace(/[\s_-]/g, '');
        
        // Try matching strategies:
        // 1. Exact match on name (user's name should be their Kaggle display name)
        // 2. Normalized match on name (fallback for minor differences)
        
        let matchedUser = exactNameMap.get(leaderboardNameLower);
        let matchType = 'name-exact';
        
        if (!matchedUser) {
            matchedUser = normalizedNameMap.get(leaderboardNameNormalized);
            matchType = 'name-normalized';
        }
        
        if (matchedUser) {
            console.log(`[KaggleSync] Matched (${matchType}): "${leaderboardName}" → ${matchedUser.name}`);
            return {
                ...entry,
                platformUser: matchedUser._id
            };
        }
        
        return {
            ...entry,
            platformUser: null
        };
    });
};

const syncCompetitionLeaderboard = async (competition) => {
    try {
        competition.syncStatus = 'syncing';
        await competition.save();

        const csvData = await fetchKaggleLeaderboard(competition.kaggleSlug);
        const leaderboard = parseLeaderboardCSV(csvData, competition);

        if (leaderboard.length === 0) throw new Error('No leaderboard data received');

        const matchedLeaderboard = await matchPlatformUsers(leaderboard);
        competition.leaderboard = matchedLeaderboard;
        competition.lastSyncedAt = new Date();
        competition.syncStatus = 'success';
        competition.syncError = null;
        await competition.save();

        return {
            competition: competition.kaggleSlug,
            entriesCount: matchedLeaderboard.length,
            matchedUsers: matchedLeaderboard.filter(e => e.platformUser).length,
            syncedAt: competition.lastSyncedAt
        };
    } catch (error) {
        competition.syncStatus = 'error';
        competition.syncError = error.message;
        await competition.save();
        throw error;
    }
};

const Event = require('../models/Event');
const EloService = require('./eloService');

const syncAllCompetitions = async () => {
    // Find competitions where event is active OR competition is NOT finalized
    const competitions = await Competition.find({ isFinalized: false })
        .populate('event');

    // Filter out competitions with no event or where event is unexpectedly null
    const targetCompetitions = competitions.filter(c => c.event !== null);

    const results = { total: targetCompetitions.length, success: 0, failed: 0, details: [] };
    const now = new Date();

    for (const competition of targetCompetitions) {
        try {
            const event = competition.event;
            const isEventEnded = now > new Date(event.endDate);

            // 1. Perform Sync
            const syncResult = await syncCompetitionLeaderboard(competition);

            // 2. If event has ended, finalize it
            if (isEventEnded && !competition.isFinalized) {
                console.log(`[KaggleSync] Event ended for ${competition.title}. Finalizing...`);

                // IMPORTANT: Reload competition to get fresh leaderboard data after sync
                const freshCompetition = await Competition.findById(competition._id);
                
                // Process ratings with fresh data
                await EloService.processCompetitionRatings(freshCompetition);

                // Mark competition as finalized
                competition.isFinalized = true;
                await competition.save();

                // Check if all competitions in this event are finalized
                const eventWithComps = await Event.findById(event._id).populate('competitions');
                const allFinalized = eventWithComps.competitions.every(c => c.isFinalized);

                if (allFinalized) {
                    event.isActive = false;
                    await event.save();
                    console.log(`[KaggleSync] All competitions finalized. Event ${event.name} set to inactive.`);
                }
            }

            results.success++;
            results.details.push({
                competition: competition.kaggleSlug,
                status: competition.isFinalized ? 'finalized' : 'synced',
                ...syncResult
            });
        } catch (error) {
            results.failed++;
            results.details.push({ competition: competition.kaggleSlug, error: error.message });
        }
        // Wait 2 seconds between Kaggle CLI calls to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return results;
};

module.exports = {
    fetchKaggleLeaderboard,
    fetchCompetitionDetails,
    parseLeaderboardCSV,
    syncCompetitionLeaderboard,
    syncAllCompetitions
};
