// Script to create an admin user and test data
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Competition = require('./models/Competition');

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Make the first user an admin
        const user = await User.findOneAndUpdate(
            { email: 'admin@mlbattle.com' },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`Made ${user.email} an admin`);
        }

        // Create an event
        let event = await Event.findOne({ name: 'Neural Night 2024' });

        if (!event) {
            event = await Event.create({
                name: 'Neural Night 2024',
                description: 'An exciting ML competition night featuring classic Kaggle challenges. Compete, learn, and win prizes!',
                startDate: new Date('2024-12-01'),
                endDate: new Date('2025-01-31'),
                createdBy: user._id,
                isActive: true
            });
            console.log('Created event: Neural Night 2024');
        }

        // Add competitions
        const competitions = [
            {
                kaggleSlug: 'titanic',
                title: 'Titanic - Machine Learning from Disaster',
                description: 'Predict survival on the Titanic. A classic beginner competition.'
            },
            {
                kaggleSlug: 'house-prices-advanced-regression-techniques',
                title: 'House Prices - Advanced Regression',
                description: 'Predict sales prices and practice feature engineering.'
            },
            {
                kaggleSlug: 'digit-recognizer',
                title: 'Digit Recognizer',
                description: 'Learn computer vision fundamentals with the MNIST data.'
            }
        ];

        for (const comp of competitions) {
            const exists = await Competition.findOne({
                kaggleSlug: comp.kaggleSlug,
                event: event._id
            });

            if (!exists) {
                const competition = await Competition.create({
                    ...comp,
                    event: event._id
                });

                // Add to event
                event.competitions.push(competition._id);
                console.log(`Created competition: ${comp.title}`);
            }
        }

        await event.save();
        console.log('\\nTest data created successfully!');
        console.log(`Event ID: ${event._id}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedData();
