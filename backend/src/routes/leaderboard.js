const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   GET /api/leaderboard
 * @desc    Get global leaderboard (users ranked by Elo)
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // Find users with role 'user', sorted by Elo descending
        const users = await User.find({ role: 'user' })
            .sort({ elo: -1 })
            .limit(100)
            .select('name kaggleUsername elo eventsAttended problemsSolved bio github linkedin');

        res.json({
            success: true,
            data: users
        });
    } catch (err) {
        console.error('Leaderboard error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
