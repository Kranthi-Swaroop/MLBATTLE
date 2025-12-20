require('dotenv').config();
const mongoose = require('mongoose');

// Register models
require('./src/models/User');
require('./src/models/Team');
require('./src/models/Event');
require('./src/models/Competition');
require('./src/models/Registration');

const { syncAllCompetitions } = require('./src/services/kaggleService');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to DB');
        await syncAllCompetitions();
        console.log('Sync Complete');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
