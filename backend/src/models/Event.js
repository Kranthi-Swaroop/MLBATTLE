const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
        maxlength: [100, 'Event name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    competitions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for competition count
eventSchema.virtual('competitionCount').get(function () {
    return this.competitions.length;
});

// Virtual to check if event is ongoing
eventSchema.virtual('isOngoing').get(function () {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
