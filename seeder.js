const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: './config/config.env'});

// Load models
const Bootcamp = require('./models/Bootcamp');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Read json files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

// Import to DB
const importData = async () => {
    try {
       await Bootcamp.create(bootcamps);
       
       console.log('Data Imported...');
       process.exit();
    } catch (error) {
        console.error(error);
    }
}

// Delete Data
const deleteData = async () => {
    try {
       await Bootcamp.deleteMany();
       
       console.log('Data Destroyed...');
       process.exit();
    } catch (error) {
        console.error(error);
    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}