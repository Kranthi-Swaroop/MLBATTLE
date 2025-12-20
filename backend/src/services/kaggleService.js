const { exec } = require('child_process');
const Competition = require('../models/Competition');
const User = require('../models/User');

/**
 * Parse CSV output from Kaggle CLI leaderboard command
 * @param {string} csvData - Raw CSV output
 * @returns {Array} Parsed leaderboard entries
 */
const parseLeaderboardCSV = (csvData) => {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return [];

    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const entries = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 2) {
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });

            entries.push({
                rank: parseInt(entry.rank || entry['#'] || i, 10),
                kaggleUsername: entry.teamname || entry.team || entry.username || '',
                teamName: entry.teamname || entry.team || '',
                score: parseFloat(entry.score || entry.publicscore || 0),
                entries: parseInt(entry.entries || entry.submissions || 0, 10),
                lastSubmission: entry.lastsubmission ? new Date(entry.lastsubmission) : null
            });
        }
    }

    return entries;
};

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line
 * @returns {Array} Parsed values
 */
const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
};

/**
 * Execute Kaggle CLI command to fetch leaderboard
 * @param {string} competitionSlug - Kaggle competition slug
 * @returns {Promise<string>} CSV output
 */
const fetchKaggleLeaderboard = (competitionSlug) => {
    return new Promise((resolve, reject) => {
        const command = `kaggle competitions leaderboard ${competitionSlug} --csv`;

        exec(command, {
            maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large leaderboards
            timeout: 60000 // 60 second timeout
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Kaggle CLI error for ${competitionSlug}:`, stderr);
                reject(new Error(`Kaggle CLI failed: ${stderr || error.message}`));
                return;
            }
            resolve(stdout);
        });
    });
};

/**
 * Match Kaggle usernames to platform users
 * @param {Array} leaderboard - Leaderboard entries
 * @returns {Promise<Array>} Leaderboard with matched platform users
 */
const matchPlatformUsers = async (leaderboard) => {
    // Get all Kaggle usernames from leaderboard
    const kaggleUsernames = leaderboard
        .map(entry => entry.kaggleUsername)
        .filter(Boolean);

    // Find matching platform users
    const users = await User.find({
        kaggleUsername: { $in: kaggleUsernames }
    }).select('_id kaggleUsername');

    // Create a map for quick lookup
    const userMap = new Map();
    users.forEach(user => {
        userMap.set(user.kaggleUsername.toLowerCase(), user._id);
    });

    // Match users to leaderboard entries
    return leaderboard.map(entry => ({
        ...entry,
        platformUser: userMap.get(entry.kaggleUsername.toLowerCase()) || null
    }));
};

/**
 * Sync leaderboard for a single competition
 * @param {Object} competition - Competition document
 * @returns {Promise<Object>} Sync result
 */
const syncCompetitionLeaderboard = async (competition) => {
    try {
        competition.syncStatus = 'syncing';
        await competition.save();

        console.log(`Syncing leaderboard for: ${competition.kaggleSlug}`);

        // Fetch leaderboard from Kaggle CLI
        const csvData = await fetchKaggleLeaderboard(competition.kaggleSlug);

        // Parse CSV
        const leaderboard = parseLeaderboardCSV(csvData);

        if (leaderboard.length === 0) {
            throw new Error('No leaderboard data received');
        }

        // Match platform users
        const matchedLeaderboard = await matchPlatformUsers(leaderboard);

        // Update competition
        competition.leaderboard = matchedLeaderboard;
        competition.lastSyncedAt = new Date();
        competition.syncStatus = 'success';
        competition.syncError = null;
        await competition.save();

        console.log(`Synced ${matchedLeaderboard.length} entries for ${competition.kaggleSlug}`);

        return {
            competition: competition.kaggleSlug,
            entriesCount: matchedLeaderboard.length,
            matchedUsers: matchedLeaderboard.filter(e => e.platformUser).length,
            syncedAt: competition.lastSyncedAt
        };
    } catch (error) {
        console.error(`Sync failed for ${competition.kaggleSlug}:`, error.message);

        competition.syncStatus = 'error';
        competition.syncError = error.message;
        await competition.save();

        throw error;
    }
};

/**
 * Sync all active competitions
 * @returns {Promise<Object>} Sync results
 */
const syncAllCompetitions = async () => {
    console.log('Starting leaderboard sync for all competitions...');

    // Get all competitions from active events
    const competitions = await Competition.find()
        .populate({
            path: 'event',
            match: { isActive: true }
        });

    // Filter to only competitions in active events
    const activeCompetitions = competitions.filter(c => c.event !== null);

    const results = {
        total: activeCompetitions.length,
        success: 0,
        failed: 0,
        details: []
    };

    for (const competition of activeCompetitions) {
        try {
            const result = await syncCompetitionLeaderboard(competition);
            results.success++;
            results.details.push(result);
        } catch (error) {
            results.failed++;
            results.details.push({
                competition: competition.kaggleSlug,
                error: error.message
            });
        }

        // Add small delay between syncs to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`Sync complete: ${results.success}/${results.total} successful`);
    return results;
};

module.exports = {
    fetchKaggleLeaderboard,
    parseLeaderboardCSV,
    syncCompetitionLeaderboard,
    syncAllCompetitions
};
