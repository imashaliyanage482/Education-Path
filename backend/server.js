const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'EduPath API Server',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`EduPath API Server running on port ${PORT}`);
});
