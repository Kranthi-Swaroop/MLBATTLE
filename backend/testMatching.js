// Test script to verify the new user matching logic
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testMatching() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Get all users
        const users = await User.find({}).select('_id kaggleUsername kaggleDisplayName name');
        console.log('=== PLATFORM USERS ===');
        users.forEach(u => {
            console.log(`  - ${u.name}: @${u.kaggleUsername} (Display: "${u.kaggleDisplayName || 'NOT SET'}")`);
        });

        // Build matching maps (same logic as in kaggleSync.js)
        const displayNameMap = new Map();
        const exactUsernameMap = new Map();
        const normalizedDisplayNameMap = new Map();
        const normalizedUsernameMap = new Map();
        
        users.forEach(user => {
            // Primary: kaggleDisplayName
            if (user.kaggleDisplayName) {
                displayNameMap.set(user.kaggleDisplayName.toLowerCase(), user);
                const normalizedDisplay = user.kaggleDisplayName.toLowerCase().replace(/[\s_-]/g, '');
                normalizedDisplayNameMap.set(normalizedDisplay, user);
            }
            
            // Secondary: kaggleUsername
            const username = user.kaggleUsername || '';
            exactUsernameMap.set(username.toLowerCase(), user);
            const normalizedUsername = username.toLowerCase().replace(/[\s_-]/g, '');
            normalizedUsernameMap.set(normalizedUsername, user);
        });

        // Test cases - these are sample names from Kaggle leaderboard
        const testCases = [
            'luqiqiqiqi',       // Exact match
            'Rima Lin',         // Should match display name
            'rima lin',         // Should match display name (case-insensitive)
            'rimalin',          // Exact username match
            'jecho123',         // Exact match
            'B Kranthi Swaroop', // Should match if display name set
            'bkranthiswaroop',   // Username match
            'Unknown User',      // No match
        ];

        console.log('\n=== MATCHING TESTS ===');
        testCases.forEach(testName => {
            const nameLower = testName.toLowerCase();
            const nameNormalized = nameLower.replace(/[\s_-]/g, '');
            
            let matched = displayNameMap.get(nameLower);
            let matchType = 'displayName-exact';
            
            if (!matched) {
                matched = exactUsernameMap.get(nameLower);
                matchType = 'username-exact';
            }
            
            if (!matched) {
                matched = normalizedDisplayNameMap.get(nameNormalized);
                matchType = 'displayName-normalized';
            }
            
            if (!matched) {
                matched = normalizedUsernameMap.get(nameNormalized);
                matchType = 'username-normalized';
            }
            
            if (matched) {
                console.log(`✅ "${testName}" → @${matched.kaggleUsername} (${matched.name}) [${matchType}]`);
            } else {
                console.log(`❌ "${testName}" → NO MATCH`);
            }
        });

        console.log('\n=== DISPLAY NAME MAP ===');
        console.log('(Users with kaggleDisplayName set - PRIMARY matching)');
        displayNameMap.forEach((user, key) => {
            console.log(`  "${key}" → @${user.kaggleUsername} (${user.name})`);
        });

        console.log('\n=== NORMALIZED USERNAME MAP ===');
        console.log('(Fallback matching)');
        normalizedUsernameMap.forEach((user, key) => {
            console.log(`  "${key}" → @${user.kaggleUsername}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testMatching();
