// Migration script to help existing users set kaggleDisplayName
// This copies kaggleUsername to kaggleDisplayName for users who don't have it set

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function migrateDisplayNames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find users without kaggleDisplayName
        const usersWithoutDisplayName = await User.find({
            $or: [
                { kaggleDisplayName: { $exists: false } },
                { kaggleDisplayName: null },
                { kaggleDisplayName: '' }
            ]
        });

        console.log(`Found ${usersWithoutDisplayName.length} users without kaggleDisplayName\n`);

        for (const user of usersWithoutDisplayName) {
            console.log(`User: ${user.name} (@${user.kaggleUsername})`);
            console.log(`  → Setting kaggleDisplayName to: "${user.kaggleUsername}"`);
            
            user.kaggleDisplayName = user.kaggleUsername;
            await user.save();
        }

        console.log('\n✅ Migration complete!');
        console.log('\n⚠️  Note: Users should update their kaggleDisplayName to match');
        console.log('   what appears on Kaggle leaderboards for accurate ELO matching.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

migrateDisplayNames();
