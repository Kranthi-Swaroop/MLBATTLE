const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [50, 'Team name cannot exceed 50 characters']
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteCode: {
        type: String,
        unique: true,
        default: () => uuidv4().substring(0, 8).toUpperCase()
    },
    maxMembers: {
        type: Number,
        default: 4
    }
}, {
    timestamps: true
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function () {
    return this.members.length;
});

// Ensure virtuals are included in JSON
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

// Method to check if user is a member
teamSchema.methods.isMember = function (userId) {
    return this.members.some(member => member.equals(userId));
};

// Method to check if user is the leader
teamSchema.methods.isLeader = function (userId) {
    return this.leader.equals(userId);
};

module.exports = mongoose.model('Team', teamSchema);
