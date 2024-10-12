const express = require('express');
const adminAuth = require('./middleware/adminAuth'); // Make sure you use this middleware for admin routes
const router = express.Router(); // Initialize the router properly
const Stock = require('../models/Stock'); // Adjust the path as necessary

const stockRoutes = (io) => {
    // GET all stocks
    router.get('/', async (req, res) => {
        try {
            const stocks = await Stock.find();
            res.json(stocks);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // GET a stock by symbol
    router.get('/:symbol', async (req, res) => {
        try {
            const stock = await Stock.findOne({ symbol: req.params.symbol });
            if (!stock) return res.status(404).json({ message: 'Stock not found' });
            res.json(stock);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // POST a new stock (use adminAuth middleware to restrict access)
    router.post('/', adminAuth, async (req, res) => {
        try {
            const newStock = new Stock(req.body);
            await newStock.save();
            // Emit new stock event
            io.emit('new-stock', newStock);
            res.status(201).json(newStock);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

    // PUT update a stock by symbol (use adminAuth middleware to restrict access)
    router.put('/:symbol', adminAuth, async (req, res) => {
        try {
            const stock = await Stock.findOneAndUpdate(
                { symbol: req.params.symbol },
                req.body,
                { new: true, runValidators: true }
            );
            if (!stock) return res.status(404).json({ message: 'Stock not found' });
            // Emit updated stock event
            io.emit('update-stock', stock);
            res.json(stock);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

    // DELETE a stock by symbol (use adminAuth middleware to restrict access)
    router.delete('/:symbol', adminAuth, async (req, res) => {
        try {
            const stock = await Stock.findOneAndDelete({ symbol: req.params.symbol });
            if (!stock) return res.status(404).json({ message: 'Stock not found' });
            // Emit deleted stock event
            io.emit('delete-stock', stock);
            res.json({ message: 'Stock deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};

module.exports = stockRoutes;
