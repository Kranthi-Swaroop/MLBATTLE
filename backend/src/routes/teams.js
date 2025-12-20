const express = require('express');
const { body, validationResult } = require('express-validator');
const Team = require('../models/Team');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private
router.post('/', protect, [
    body('name').trim().notEmpty().withMessage('Team name is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name } = req.body;

        // Create team with current user as leader and first member
        const team = await Team.create({
            name,
            leader: req.user._id,
            members: [req.user._id]
        });

        // Add team to user's teams array
        await User.findByIdAndUpdate(req.user._id, {
            $push: { teams: team._id }
        });

        await team.populate(['leader', 'members']);

        res.status(201).json({
            success: true,
            data: team
        });
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating team'
        });
    }
});

// @route   GET /api/teams
// @desc    Get all teams for current user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const teams = await Team.find({
            members: req.user._id
        }).populate(['leader', 'members']);

        res.json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate(['leader', 'members']);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/teams/join
// @desc    Join team via invite code
// @access  Private
router.post('/join', protect, [
    body('inviteCode').trim().notEmpty().withMessage('Invite code is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { inviteCode } = req.body;

        const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        // Check if already a member
        if (team.isMember(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this team'
            });
        }

        // Check max members
        if (team.members.length >= team.maxMembers) {
            return res.status(400).json({
                success: false,
                message: 'Team is full'
            });
        }

        // Add user to team
        team.members.push(req.user._id);
        await team.save();

        // Add team to user's teams array
        await User.findByIdAndUpdate(req.user._id, {
            $push: { teams: team._id }
        });

        await team.populate(['leader', 'members']);

        res.json({
            success: true,
            message: 'Successfully joined team',
            data: team
        });
    } catch (error) {
        console.error('Join team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/teams/:id/leave
// @desc    Leave a team
// @access  Private
router.delete('/:id/leave', protect, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is a member
        if (!team.isMember(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        // If leader is leaving, transfer leadership or delete team
        if (team.isLeader(req.user._id)) {
            if (team.members.length === 1) {
                // Delete team if leader is only member
                await Team.findByIdAndDelete(req.params.id);
                await User.findByIdAndUpdate(req.user._id, {
                    $pull: { teams: team._id }
                });
                return res.json({
                    success: true,
                    message: 'Team deleted as you were the only member'
                });
            } else {
                // Transfer leadership to another member
                const newLeader = team.members.find(m => !m.equals(req.user._id));
                team.leader = newLeader;
            }
        }

        // Remove user from team
        team.members = team.members.filter(m => !m.equals(req.user._id));
        await team.save();

        // Remove team from user's teams array
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { teams: team._id }
        });

        res.json({
            success: true,
            message: 'Successfully left team'
        });
    } catch (error) {
        console.error('Leave team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/teams/:id
// @desc    Update team (leader only)
// @access  Private
router.put('/:id', protect, [
    body('name').optional().trim().notEmpty().withMessage('Team name cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is leader
        if (!team.isLeader(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Only team leader can update team'
            });
        }

        if (req.body.name) {
            team.name = req.body.name;
        }

        await team.save();
        await team.populate(['leader', 'members']);

        res.json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/teams/:id/members/:memberId
// @desc    Remove member from team (leader only)
// @access  Private
router.delete('/:id/members/:memberId', protect, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is leader
        if (!team.isLeader(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Only team leader can remove members'
            });
        }

        // Can't remove yourself (use leave instead)
        if (req.params.memberId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Use leave endpoint to leave team'
            });
        }

        // Remove member
        team.members = team.members.filter(m => m.toString() !== req.params.memberId);
        await team.save();

        // Remove team from user's teams array
        await User.findByIdAndUpdate(req.params.memberId, {
            $pull: { teams: team._id }
        });

        await team.populate(['leader', 'members']);

        res.json({
            success: true,
            message: 'Member removed',
            data: team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
