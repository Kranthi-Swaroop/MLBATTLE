// Script to update admin password
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function updateAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find admin user by name
        const user = await User.findOne({ name: 'bkranthiswaroop' });
        
        if (!user) {
            console.log('User "bkranthiswaroop" not found');
            process.exit(1);
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('K@1s3r', salt);

        // Update password directly in database
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        console.log(`✅ Password updated successfully for user: ${user.name} (${user.email})`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error updating password:', error);
        process.exit(1);
    }
}

updateAdminPassword();
