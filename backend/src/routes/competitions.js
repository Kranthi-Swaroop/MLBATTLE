const express = require('express');
const { body, validationResult } = require('express-validator');
const Competition = require('../models/Competition');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const { protect, adminOnly } = require('../middleware/auth');
const { syncCompetitionLeaderboard, fetchCompetitionDetails } = require('../services/kaggleSync');

const router = express.Router();

// @route   GET /api/competitions
// @desc    Get all competitions (optionally filter by event)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { eventId } = req.query;
        const query = eventId ? { event: eventId } : {};

        const competitions = await Competition.find(query)
            .populate('event', 'name')
            .select('-leaderboard')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: competitions.length,
            data: competitions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/competitions/:id
// @desc    Get competition by ID with leaderboard
// @access  Public
router.get('/:id', async (req, res) => {
    console.log('GET /api/competitions/:id called with:', req.params.id);
    try {
        // Validate ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid competition ID format'
            });
        }

        const competition = await Competition.findById(req.params.id)
            .populate('event', 'name startDate endDate')
            .populate('leaderboard.platformUser', 'name kaggleUsername')
            .lean();

        if (!competition) {
            return res.status(404).json({
                success: false,
                message: 'Competition not found'
            });
        }

        // Get registration count
        const registrationCount = await Registration.countDocuments({
            competition: competition._id
        });

        res.json({
            success: true,
            data: {
                ...competition,
                registrationCount
            }
        });
    } catch (error) {
        console.error('Get competition error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   POST /api/competitions/import
// @desc    Import competition from Kaggle URL
// @access  Private/Admin
router.post('/import', protect, adminOnly, [
    body('url').trim().notEmpty().withMessage('Kaggle URL is required'),
    body('eventId').optional().notEmpty().withMessage('Event ID cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { url, eventId } = req.body;

        // Extract slug from URL
        // Expected format: https://www.kaggle.com/competitions/[slug]
        // or just [slug]
        let slug = url;
        if (url.includes('kaggle.com/competitions/')) {
            slug = url.split('kaggle.com/competitions/')[1].split('/')[0];
        }

        console.log(`Importing competition: ${slug}`);

        // Fetch details from Kaggle
        const details = await fetchCompetitionDetails(slug);

        // Find or create event if not provided
        let targetEventId = eventId;
        if (!targetEventId) {
            // Try to find an active event named "Imported Competitions"
            let defaultEvent = await Event.findOne({ name: 'Imported Competitions' });

            if (!defaultEvent) {
                // Create it
                defaultEvent = await Event.create({
                    name: 'Imported Competitions',
                    description: 'Container for competitions imported via API',
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year out
                    isActive: true,
                    createdBy: req.user._id
                });
            }
            targetEventId = defaultEvent._id;
        }

        // Check availability
        let competition = await Competition.findOne({ kaggleSlug: details.kaggleSlug });

        if (competition) {
            // Update existing
            competition.title = details.title || competition.title;
            competition.description = details.description || competition.description;
            competition.kaggleUrl = details.url;
            competition.deadline = details.deadline;

            // If it belongs to a different event, we might move it? 
            // For now, keep existing event unless explicitly moved.
            if (eventId && competition.event.toString() !== eventId) {
                // Remove from old event
                await Event.findByIdAndUpdate(competition.event, {
                    $pull: { competitions: competition._id }
                });
                // Add to new
                competition.event = eventId;
                await Event.findByIdAndUpdate(eventId, {
                    $push: { competitions: competition._id }
                });
            }

            await competition.save();
        } else {
            // Create new
            competition = await Competition.create({
                kaggleSlug: details.kaggleSlug,
                title: details.title || slug, // Fallback if title parsing failed
                description: details.description,
                kaggleUrl: details.url,
                deadline: details.deadline,
                event: targetEventId
            });

            // Add to event
            await Event.findByIdAndUpdate(targetEventId, {
                $push: { competitions: competition._id }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Competition imported successfully',
            data: competition
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to import competition'
        });
    }
});

// @route   POST /api/competitions
// @desc    Add competition to an event
// @access  Private/Admin
router.post('/', protect, adminOnly, [
    body('kaggleSlug').trim().notEmpty().withMessage('Kaggle competition slug is required'),
    body('title').trim().notEmpty().withMessage('Competition title is required'),
    body('eventId').notEmpty().withMessage('Event ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { kaggleSlug, title, description, eventId } = req.body;

        // Verify event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if competition already exists in this event
        const existing = await Competition.findOne({
            kaggleSlug,
            event: eventId
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'This competition is already added to the event'
            });
        }

        // Create competition
        const competition = await Competition.create({
            kaggleSlug,
            title,
            description,
            event: eventId
        });

        // Add competition to event's competitions array
        event.competitions.push(competition._id);
        await event.save();

        res.status(201).json({
            success: true,
            data: competition
        });
    } catch (error) {
        console.error('Create competition error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating competition'
        });
    }
});

// @route   POST /api/competitions/:id/register
// @desc    Register for a competition (solo or team)
// @access  Private
router.post('/:id/register', protect, [
    body('type').isIn(['solo', 'team']).withMessage('Type must be solo or team'),
    body('teamId').optional().notEmpty().withMessage('Team ID cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { type, teamId } = req.body;

        // Verify competition exists
        const competition = await Competition.findById(req.params.id);
        if (!competition) {
            return res.status(404).json({
                success: false,
                message: 'Competition not found'
            });
        }

        let registrationData = {
            competition: competition._id,
            type,
            registeredBy: req.user._id
        };

        if (type === 'solo') {
            // Check if user already registered solo
            const existingSolo = await Registration.findOne({
                competition: competition._id,
                type: 'solo',
                user: req.user._id
            });

            if (existingSolo) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already registered for this competition'
                });
            }

            registrationData.user = req.user._id;
        } else {
            // Team registration
            if (!teamId) {
                return res.status(400).json({
                    success: false,
                    message: 'Team ID is required for team registration'
                });
            }

            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: 'Team not found'
                });
            }

            // Check if user is team leader
            if (!team.isLeader(req.user._id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Only team leader can register the team'
                });
            }

            // Check if team already registered
            const existingTeam = await Registration.findOne({
                competition: competition._id,
                type: 'team',
                team: teamId
            });

            if (existingTeam) {
                return res.status(400).json({
                    success: false,
                    message: 'Team is already registered for this competition'
                });
            }

            registrationData.team = teamId;
        }

        const registration = await Registration.create(registrationData);

        await registration.populate([
            { path: 'user', select: 'name kaggleUsername' },
            { path: 'team', select: 'name members' },
            { path: 'competition', select: 'title kaggleSlug kaggleUrl' }
        ]);

        res.status(201).json({
            success: true,
            message: `Successfully registered for competition. Please also register on Kaggle: ${competition.kaggleUrl}`,
            data: registration
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   GET /api/competitions/:id/registrations
// @desc    Get all registrations for a competition
// @access  Public
router.get('/:id/registrations', async (req, res) => {
    try {
        const registrations = await Registration.find({
            competition: req.params.id
        })
            .populate('user', 'name kaggleUsername')
            .populate({
                path: 'team',
                populate: { path: 'members', select: 'name kaggleUsername' }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/competitions/:id/sync
// @desc    Manually trigger leaderboard sync (admin only)
// @access  Private/Admin
router.post('/:id/sync', protect, adminOnly, async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);

        if (!competition) {
            return res.status(404).json({
                success: false,
                message: 'Competition not found'
            });
        }

        // Trigger sync
        const result = await syncCompetitionLeaderboard(competition);

        res.json({
            success: true,
            message: 'Leaderboard sync triggered',
            data: result
        });
    } catch (error) {
        console.error('Manual sync error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Sync failed'
        });
    }
});

// @route   DELETE /api/competitions/:id
// @desc    Delete a competition
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);

        if (!competition) {
            return res.status(404).json({
                success: false,
                message: 'Competition not found'
            });
        }

        // Remove from event
        await Event.findByIdAndUpdate(competition.event, {
            $pull: { competitions: competition._id }
        });

        // Delete registrations
        await Registration.deleteMany({ competition: competition._id });

        // Delete competition
        await Competition.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Competition deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
