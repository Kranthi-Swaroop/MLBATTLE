const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/profile
// @desc    Update current user's profile
// @access  Private
router.put('/', protect, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('github').optional().trim(),
    body('linkedin').optional().trim(),
    body('kaggleUsername').optional().trim().notEmpty().withMessage('Kaggle username cannot be empty')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, bio, github, linkedin, kaggleUsername } = req.body;

        // Check if kaggleUsername is being changed and if it's already taken
        if (kaggleUsername && kaggleUsername !== req.user.kaggleUsername) {
            const existingUser = await User.findOne({ kaggleUsername });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Kaggle username already taken'
                });
            }
        }

        // Build update object
        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (github !== undefined) updateData.github = github;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (kaggleUsername) updateData.kaggleUsername = kaggleUsername;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
