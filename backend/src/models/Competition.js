const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
    rank: Number,
    kaggleUsername: String,
    teamName: String,
    score: Number, // raw kaggle score
    normalizedScore: Number, // 0-100 normalized score
    entries: Number,
    lastSubmission: Date,
    // Link to platform user if kaggleUsername matches
    platformUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { _id: false });

const competitionSchema = new mongoose.Schema({
    kaggleSlug: {
        type: String,
        required: [true, 'Kaggle competition slug is required'],
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Competition title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    kaggleUrl: {
        type: String,
        trim: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    leaderboard: [leaderboardEntrySchema],
    lastSyncedAt: {
        type: Date
    },
    syncStatus: {
        type: String,
        enum: ['pending', 'syncing', 'success', 'error'],
        default: 'pending'
    },
    syncError: {
        type: String
    },
    // Scoring configuration
    higherIsBetter: {
        type: Boolean,
        default: true
    },
    metricMinValue: {
        type: Number,
        default: 0.0
    },
    metricMaxValue: {
        type: Number,
        default: 1.0
    },
    pointsForPerfectScore: {
        type: Number,
        default: 100.0
    },
    ratingWeight: {
        type: Number,
        default: 1.0
    }
}, {
    timestamps: true
});

// Generate Kaggle URL from slug
competitionSchema.pre('save', function (next) {
    if (this.kaggleSlug && !this.kaggleUrl) {
        this.kaggleUrl = `https://www.kaggle.com/competitions/${this.kaggleSlug}`;
    }
    next();
});

module.exports = mongoose.model('Competition', competitionSchema);
