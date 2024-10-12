const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3001', // Your frontend URL
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

// Stock model (example)
const Stock = require('./models/Stock'); // Adjust the path according to your structure

// API route example for stocks
app.get('/api/stocks', async (req, res) => {
    try {
        const stocks = await Stock.find(); // Fetch stocks from DB
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // List of stock symbols to update
    const stockSymbols = ['AAPL', 'GOOGL', 'AMZN', 'TSLA', 'MANGO']; // Example stocks

    // Emit and update stock prices every 5 seconds
    const stockUpdates = async () => {
        stockSymbols.forEach(async (symbol) => {
            // Generate a random price for each stock
            const updatedStock = { symbol, price: Math.random() * 200 };

            // Emit updated stock data to all connected clients
            io.emit('stockUpdated', updatedStock);
            console.log(`Emitted stock update: ${updatedStock.symbol} - $${updatedStock.price}`);

            try {
                // Find the stock in the database and update its price
                const stock = await Stock.findOneAndUpdate(
                    { symbol: updatedStock.symbol },
                    { price: updatedStock.price },
                    { new: true, upsert: true } // Creates a new stock if it doesn't exist
                );
                console.log(`Updated stock in database: ${stock.symbol} - $${stock.price}`);
            } catch (err) {
                console.error('Error updating stock in database:', err);
            }
        });
    };

    // Call the stockUpdates function every 5 seconds
    const interval = setInterval(stockUpdates, 5000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(interval); // Clear interval when client disconnects
    });
});


// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
