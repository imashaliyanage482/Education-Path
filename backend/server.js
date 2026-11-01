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
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

  if (acceptsHtml) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>EduPath - Production Cloud API Server</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%);
            color: #F8FAFC;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .card {
            background: rgba(30, 41, 59, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            padding: 36px 32px;
            max-width: 540px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            text-align: center;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #064E3B;
            color: #34D399;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 20px;
            border: 1px solid #059669;
          }
          .dot {
            width: 8px;
            height: 8px;
            background: #34D399;
            border-radius: 50%;
            box-shadow: 0 0 8px #34D399;
          }
          h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; color: #FFFFFF; }
          p { color: #94A3B8; font-size: 14.5px; line-height: 1.6; margin-bottom: 24px; }
          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
          }
          .stat-box {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 14px;
          }
          .stat-num { font-size: 22px; font-weight: 800; color: #818CF8; }
          .stat-label { font-size: 12px; color: #94A3B8; margin-top: 2px; }
          .links {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .btn {
            display: block;
            text-decoration: none;
            background: #4F46E5;
            color: #FFFFFF;
            font-weight: 700;
            padding: 12px;
            border-radius: 10px;
            font-size: 14px;
            transition: background 0.2s;
          }
          .btn:hover { background: #4338CA; }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: #E2E8F0;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge"><span class="dot"></span> LIVE ON VERCEL</div>
          <h1>EduPath API Server</h1>
          <p>The centralized backend powering Sri Lanka's Vocational & Higher Education Explorer app with real-time MongoDB Atlas synchronization.</p>
          <div class="stats">
            <div class="stat-box">
              <div class="stat-num">134</div>
              <div class="stat-label">Verified Courses</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">8</div>
              <div class="stat-label">Gov Institutes</div>
            </div>
          </div>
          <div class="links">
            <a href="/api/courses" class="btn">View All Courses (JSON)</a>
            <a href="/api/institutions" class="btn btn-secondary">View Institutions (JSON)</a>
            <a href="/api/health" class="btn btn-secondary">Server Health Check</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

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
