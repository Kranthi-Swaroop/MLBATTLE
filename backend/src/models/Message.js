const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // TTL index - messages auto-delete after 24 hours (86400 seconds)
        expires: 86400
    }
});

// Create index for efficient querying by creation time
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
