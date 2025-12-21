// Diagnostic script to check ELO rating issue
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Competition = require('./src/models/Competition');
const Event = require('./src/models/Event');

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // 1. Check all users and their ELO ratings
        console.log('=== USER ELO RATINGS ===');
        const users = await User.find().select('name email kaggleUsername elo createdAt').sort({ elo: -1 });
        users.forEach(user => {
            console.log(`${user.name} (@${user.kaggleUsername}): ${user.elo} ELO`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Created: ${user.createdAt.toISOString()}`);
            console.log('');
        });

        // 2. Check all competitions and their leaderboards
        console.log('\n=== COMPETITION LEADERBOARDS ===');
        const competitions = await Competition.find()
            .populate('event', 'name')
            .populate('leaderboard.platformUser', 'name kaggleUsername email')
            .sort({ lastSyncedAt: -1 });

        for (const comp of competitions) {
            console.log(`\nCompetition: ${comp.title}`);
            console.log(`Event: ${comp.event?.name || 'N/A'}`);
            console.log(`Kaggle Slug: ${comp.kaggleSlug}`);
            console.log(`Finalized: ${comp.isFinalized ? 'YES' : 'NO'}`);
            console.log(`Last Synced: ${comp.lastSyncedAt ? comp.lastSyncedAt.toISOString() : 'Never'}`);
            console.log(`Leaderboard entries: ${comp.leaderboard.length}`);
            
            if (comp.leaderboard.length > 0) {
                console.log('\nLeaderboard:');
                comp.leaderboard.slice(0, 10).forEach(entry => {
                    if (entry.platformUser) {
                        console.log(`  Rank ${entry.rank}: ${entry.kaggleUsername} → ${entry.platformUser.name} (@${entry.platformUser.kaggleUsername})`);
                        console.log(`    Platform User ID: ${entry.platformUser._id}`);
                        console.log(`    Score: ${entry.score}, Normalized: ${entry.normalizedScore}`);
                    } else {
                        console.log(`  Rank ${entry.rank}: ${entry.kaggleUsername} (No platform user matched)`);
                    }
                });
            }
            console.log('---');
        }

        // 3. Check for potential mismatches
        console.log('\n=== POTENTIAL ISSUES ===');
        const allKaggleUsernames = new Set();
        const platformKaggleUsernames = users.map(u => u.kaggleUsername.toLowerCase());
        
        competitions.forEach(comp => {
            comp.leaderboard.forEach(entry => {
                allKaggleUsernames.add(entry.kaggleUsername.toLowerCase());
                
                // Check if Kaggle username in leaderboard doesn't match platform user's Kaggle username
                if (entry.platformUser && entry.kaggleUsername.toLowerCase() !== entry.platformUser.kaggleUsername.toLowerCase()) {
                    console.log(`⚠️  MISMATCH in ${comp.title}:`);
                    console.log(`   Leaderboard shows: ${entry.kaggleUsername}`);
                    console.log(`   But linked to user: ${entry.platformUser.name} (@${entry.platformUser.kaggleUsername})`);
                    console.log('');
                }
            });
        });

        // Check for Kaggle usernames in leaderboards that don't have accounts
        const unmatchedUsernames = Array.from(allKaggleUsernames).filter(
            username => !platformKaggleUsernames.includes(username)
        );
        
        if (unmatchedUsernames.length > 0) {
            console.log(`\n📋 Kaggle usernames in leaderboards without platform accounts:`);
            unmatchedUsernames.forEach(username => {
                console.log(`   - ${username}`);
            });
        }

        // 4. Check events
        console.log('\n=== EVENTS ===');
        const events = await Event.find().populate('competitions', 'title isFinalized');
        events.forEach(event => {
            console.log(`\nEvent: ${event.name}`);
            console.log(`Start: ${event.startDate.toISOString()}`);
            console.log(`End: ${event.endDate.toISOString()}`);
            console.log(`Active: ${event.isActive}`);
            console.log(`Competitions: ${event.competitions.length}`);
            event.competitions.forEach(comp => {
                console.log(`  - ${comp.title} (Finalized: ${comp.isFinalized})`);
            });
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

diagnose();
