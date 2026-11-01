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

// Normalize Vercel serverless url rewrite if /server.js is passed
app.use((req, res, next) => {
  if (req.url.startsWith('/server.js')) {
    req.url = req.url.replace('/server.js', '') || '/';
  }
  next();
});

// Root landing endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'EduPath API Server (Live on Vercel)',
    endpoints: {
      courses: '/api/courses',
      institutions: '/api/institutions',
      health: '/api/health',
    },
  });
});

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
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`EduPath API Server running on port ${PORT}`);
  });
}

module.exports = app;
