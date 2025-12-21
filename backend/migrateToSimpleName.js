require('dotenv').config();
const mongoose = require('mongoose');

async function migrateUsers() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // List current indexes
    const indexes = await db.collection('users').indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Drop the kaggleUsername unique index if it exists
    try {
        await db.collection('users').dropIndex('kaggleUsername_1');
        console.log('Dropped kaggleUsername_1 index');
    } catch (e) {
        console.log('Index kaggleUsername_1 not found or already dropped');
    }
    
    // Update users: set name to kaggleDisplayName where available, else kaggleUsername
    const users = await db.collection('users').find({}).toArray();
    console.log('\nMigrating', users.length, 'users...');
    
    for (const user of users) {
        const newName = user.kaggleDisplayName || user.kaggleUsername || user.name;
        console.log('User:', user.email, '| Old name:', user.name, '| New name:', newName);
        
        await db.collection('users').updateOne(
            { _id: user._id },
            { 
                $set: { name: newName },
                $unset: { kaggleUsername: '', kaggleDisplayName: '' }
            }
        );
    }
    
    // Ensure name has unique index
    try {
        await db.collection('users').createIndex({ name: 1 }, { unique: true });
        console.log('\nCreated unique index on name');
    } catch (e) {
        console.log('Name index already exists or error:', e.message);
    }
    
    // Show final state
    const finalUsers = await db.collection('users').find({}).toArray();
    console.log('\n=== FINAL USER STATE ===');
    for (const user of finalUsers) {
        console.log('Name:', user.name, '| Email:', user.email, '| ELO:', user.elo);
    }
    
    process.exit(0);
}

migrateUsers();
