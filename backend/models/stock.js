const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    price: { type: Number, required: true },
    // You can add more fields as needed, e.g., company name, etc.
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
