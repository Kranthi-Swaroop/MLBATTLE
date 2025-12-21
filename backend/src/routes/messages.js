const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages
// @desc    Get recent messages (last 24 hours, max 100)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        
        // Return in chronological order for display
        res.json({
            success: true,
            data: messages.reverse()
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        if (content.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot exceed 1000 characters'
            });
        }

        const message = await Message.create({
            content: content.trim(),
            user: req.user._id,
            userName: req.user.name
        });

        const messageData = {
            _id: message._id,
            content: message.content,
            user: message.user,
            userName: message.userName,
            createdAt: message.createdAt
        };

        // Emit to all connected clients via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('newMessage', messageData);
        }

        res.status(201).json({
            success: true,
            data: messageData
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message (own message or admin)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only allow deletion by message owner or admin
        if (message.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        await message.deleteOne();

        // Emit deletion to all connected clients
        const io = req.app.get('io');
        if (io) {
            io.emit('deleteMessage', { messageId: req.params.id });
        }

        res.json({
            success: true,
            message: 'Message deleted'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
