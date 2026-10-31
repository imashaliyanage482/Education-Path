const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AdminUser = require('../models/AdminUser');

const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

// POST /api/auth/login - Protected Admin Login Only
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Look up Admin user in database
    const user = await AdminUser.findOne({ email: normalizedEmail });

    if (!user) {
      // Fallback check against environment or default seed credentials if database has not been seeded yet
      const fallbackEmail = (process.env.ADMIN_SEED_EMAIL || 'admin@.lk').toLowerCase();
      const fallbackPassword = process.env.ADMIN_SEED_PASSWORD || 'admin12';

      if (normalizedEmail === fallbackEmail && password === fallbackPassword) {
        const token = jwt.sign(
          { email: fallbackEmail, role: 'ADMIN' },
          process.env.JWT_SECRET || 'edupath_jwt_secret_key_2026',
          { expiresIn: '24h' }
        );

        return res.json({
          token,
          user: {
            id: 'admin-seeded-default',
            email: fallbackEmail,
            name: 'EduPath Chief Administrator',
            role: 'ADMIN',
          },
        });
      }

      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    // Verify account active status
    if (!user.isActive) {
      return res.status(403).json({ error: 'This administrator account is disabled' });
    }

    // Verify Role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access denied: Administrator privileges required' });
    }

    // Verify Password Hash
    let isValidPassword = false;
    if (user.salt) {
      const calculatedHash = hashPassword(password, user.salt);
      isValidPassword = crypto.timingSafeEqual(
        Buffer.from(calculatedHash, 'hex'),
        Buffer.from(user.passwordHash, 'hex')
      );
    } else {
      isValidPassword = user.passwordHash === password;
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save().catch(() => {});

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'edupath_jwt_secret_key_2026',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: 'Internal authentication service error' });
  }
});

// GET /api/auth/verify - Verify Admin Token
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edupath_jwt_secret_key_2026');
    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access denied: Admin role required' });
    }
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired administrator token' });
  }
});

module.exports = router;
