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
    const users = await User.find({ kaggleUsername: { $in: kaggleUsernames } }).select('_id kaggleUsername');
    const userMap = new Map();
    users.forEach(user => userMap.set(user.kaggleUsername.toLowerCase(), user._id));
    return leaderboard.map(entry => ({
        ...entry,
        platformUser: userMap.get(entry.kaggleUsername.toLowerCase()) || null
    }));
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

const syncAllCompetitions = async () => {
    const competitions = await Competition.find().populate({ path: 'event', match: { isActive: true } });
    const activeCompetitions = competitions.filter(c => c.event !== null);
    const results = { total: activeCompetitions.length, success: 0, failed: 0, details: [] };

    for (const competition of activeCompetitions) {
        try {
            const result = await syncCompetitionLeaderboard(competition);
            results.success++;
            results.details.push(result);
        } catch (error) {
            results.failed++;
            results.details.push({ competition: competition.kaggleSlug, error: error.message });
        }
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
