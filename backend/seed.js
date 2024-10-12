const mongoose = require('mongoose');
const Stock = require('./models/stock');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    // Sample stock data
    const stocks = [
        { symbol: 'AAPL', price: 150 },
        { symbol: 'GOOGL', price: 2800 },
        { symbol: 'AMZN', price: 3400 },
    ];

    // Insert data
    await Stock.insertMany(stocks);
    console.log('Database seeded!');
    process.exit();
};

seedData();
