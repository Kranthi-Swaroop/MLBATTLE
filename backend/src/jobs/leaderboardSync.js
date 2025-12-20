const cron = require('node-cron');
const { syncAllCompetitions } = require('../services/kaggleService');

let syncJob = null;

/**
 * Start the leaderboard sync cron job
 * Runs every 5 minutes
 */
const startLeaderboardSync = () => {
    // Cron expression: every 5 minutes
    // Format: minute hour day-of-month month day-of-week
    syncJob = cron.schedule('*/5 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Running scheduled leaderboard sync...`);

        try {
            const results = await syncAllCompetitions();
            console.log(`[${new Date().toISOString()}] Sync completed:`, {
                total: results.total,
                success: results.success,
                failed: results.failed
            });
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Sync job error:`, error.message);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata' // IST timezone
    });

    console.log('Leaderboard sync cron job started (every 5 minutes)');

    return syncJob;
};

/**
 * Stop the leaderboard sync cron job
 */
const stopLeaderboardSync = () => {
    if (syncJob) {
        syncJob.stop();
        console.log('Leaderboard sync cron job stopped');
    }
};

/**
 * Manually trigger sync (for testing or admin use)
 */
const triggerManualSync = async () => {
    console.log('Manual sync triggered...');
    return await syncAllCompetitions();
};

module.exports = {
    startLeaderboardSync,
    stopLeaderboardSync,
    triggerManualSync
};
