import React, { useEffect, useState } from 'react'; 
import io from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';  
import 'react-toastify/dist/ReactToastify.css';  
import './stocks.css';  

const SOCKET_SERVER_URL = 'http://localhost:5000';  // Your backend URL

const SocketClient = () => {
    const [stocks, setStocks] = useState([]);  // State to hold stock data

    useEffect(() => {
        const socket = io(SOCKET_SERVER_URL);

        // Log when the socket is connected
        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        // Listen for stock updates
        socket.on('stockUpdated', (updatedStock) => {
            console.log('Stock updated: ', updatedStock);  // Log the updated stock
            setStocks(prevStocks => {
                return [...prevStocks, updatedStock];  // Update state with new stock data
            });
            toast(`Stock updated: ${updatedStock.symbol} - $${updatedStock.price}`); // Trigger notification
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        // Clean up the socket connection when the component is unmounted
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h1>Stock Dashboard</h1>
            <ul>
                {stocks.map((stock, index) => (
                    <li key={index}>
                        {stock.symbol}: ${stock.price.toFixed(2)} {/* Show price with 2 decimal points */}
                    </li>
                ))}
            </ul>
            <ToastContainer />
        </div>
    );
};

export default SocketClient;
