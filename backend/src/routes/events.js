const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Competition = require('../models/Competition');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { active } = req.query;
        const query = {};

        if (active === 'true') {
            query.isActive = true;
        }

        const events = await Event.find(query)
            .populate('createdBy', 'name')
            .populate('competitions')
            .sort({ startDate: -1 });

        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get event by ID with competitions
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate({
                path: 'competitions',
                select: 'title kaggleSlug kaggleUrl lastSyncedAt syncStatus'
            });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private/Admin
router.post('/', protect, adminOnly, [
    body('name').trim().notEmpty().withMessage('Event name is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, description, startDate, endDate } = req.body;

        // Validate dates
        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        const event = await Event.create({
            name,
            description,
            startDate,
            endDate,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating event'
        });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private/Admin
router.put('/:id', protect, adminOnly, [
    body('name').optional().trim().notEmpty().withMessage('Event name cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const { name, description, startDate, endDate, isActive } = req.body;

        if (name) event.name = name;
        if (description !== undefined) event.description = description;
        if (startDate) event.startDate = startDate;
        if (endDate) event.endDate = endDate;
        if (typeof isActive === 'boolean') event.isActive = isActive;

        // Validate dates if both are being set
        if (new Date(event.endDate) <= new Date(event.startDate)) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        await event.save();

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Delete associated competitions
        await Competition.deleteMany({ event: event._id });

        await Event.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Event and associated competitions deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
