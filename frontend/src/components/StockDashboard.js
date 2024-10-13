import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './style.css';

const StockDashboard = () => {
  const [stocks, setStocks] = useState([]);
  
  // Initialize the Socket.IO client
  useEffect(() => {
    const socket = io('http://localhost:5000'); // Ensure this matches your backend server address
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    // Listen for stock updates from the server
    socket.on('stockUpdated', (updatedStock) => {
      console.log('Stock update received:', updatedStock);
      setStocks((prevStocks) =>
        prevStocks.map((stock) =>
          stock.symbol === updatedStock.symbol ? updatedStock : stock
        )
      );
    });

    // Fetch stock data from backend API
    const fetchStocks = async () => {
      const response = await axios.get('http://localhost:5000/api/stocks');
      setStocks(response.data);
    };

    fetchStocks();

    // Cleanup socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className='dashboard-container'>  
      <h2>Live Stock Prices</h2>
      <ul className='stock-list'>
        {stocks.map((stock) => (
          <li key={stock.symbol} className = "stock-item">
            <span className='stock-symbol'>{stock.symbol}</span>
            {stock.symbol}: ${stock.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockDashboard;
