import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database (does not crash process if Mongo is unreachable)
connectDB();

// Start Server on PORT
const server = app.listen(PORT, () => {
  console.log(`[Server] Blog Platform backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
});

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
});

export default server;
