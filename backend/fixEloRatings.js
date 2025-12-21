// Script to fix ELO ratings for affected users
// Run this after fixing the matching bug

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Competition = require('./src/models/Competition');

async function fixEloRatings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // 1. Reset ALL user ELO ratings to default (1000)
        console.log('=== RESETTING ALL ELO RATINGS ===');
        const usersToReset = await User.find({ role: 'user' });
        
        for (const user of usersToReset) {
            console.log(`Resetting ${user.name} (@${user.kaggleUsername}): ${user.elo} → 1000`);
            user.elo = 1000;
            user.competitionsParticipated = 0;
            await user.save();
        }

        // 2. Reset all competitions to not finalized
        console.log('\n=== RESETTING COMPETITION FINALIZATION ===');
        const competitions = await Competition.find({ isFinalized: true });
        
        for (const comp of competitions) {
            console.log(`Resetting finalization for: ${comp.title}`);
            comp.isFinalized = false;
            await comp.save();
        }

        console.log('\n✅ All ELO ratings reset to 1000');
        console.log('✅ All competitions reset to non-finalized');
        console.log('\n📋 Next steps:');
        console.log('1. Restart your backend server');
        console.log('2. Wait for the next sync cycle (every 5 minutes)');
        console.log('3. Or manually trigger sync via admin panel');
        console.log('4. When events end, ELO will be calculated correctly with the new matching logic');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('⚠️  WARNING: This will reset ALL user ELO ratings to 1000!');
console.log('⚠️  This will also reset all competition finalization flags.');
rl.question('\nType "RESET" to confirm: ', (answer) => {
    if (answer === 'RESET') {
        fixEloRatings();
    } else {
        console.log('Aborted.');
        process.exit(0);
    }
    rl.close();
});
