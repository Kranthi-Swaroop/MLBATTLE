const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    type: {
        type: String,
        enum: ['solo', 'team'],
        required: true
    },
    // For solo registration
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // For team registration
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    kaggleConfirmed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Validation: either user or team must be set based on type
registrationSchema.pre('save', function (next) {
    if (this.type === 'solo' && !this.user) {
        return next(new Error('User is required for solo registration'));
    }
    if (this.type === 'team' && !this.team) {
        return next(new Error('Team is required for team registration'));
    }
    next();
});

// Compound index to prevent duplicate registrations
registrationSchema.index(
    { competition: 1, user: 1 },
    { unique: true, partialFilterExpression: { type: 'solo' } }
);
registrationSchema.index(
    { competition: 1, team: 1 },
    { unique: true, partialFilterExpression: { type: 'team' } }
);

module.exports = mongoose.model('Registration', registrationSchema);
