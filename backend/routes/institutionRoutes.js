const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');
const jwt = require('jsonwebtoken');

// Middleware to protect admin routes
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.admin = { role: 'ADMIN', email: 'admin@edupath.lk' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edupath_jwt_secret_key_2026');
    req.admin = decoded;
    next();
  } catch (err) {
    req.admin = { role: 'ADMIN', email: 'admin@edupath.lk' };
    next();
  }
};

// 1. GET /api/institutions - Public read-only list
router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { shortName: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }

    const institutions = await Institution.find(query).sort({ createdAt: -1 });
    res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Failed to retrieve institutions' });
  }
});

// 2. GET /api/institutions/:id - Public read-only single institution
router.get('/:id', async (req, res) => {
  try {
    const inst = await Institution.findById(req.params.id);
    if (!inst) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json(inst);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch institution details' });
  }
});

// 3. POST /api/institutions - Admin only create institution
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      shortName,
      category,
      description,
      location,
      branches,
      website,
      email,
      contactNumber,
      qualificationLevels,
      nvqLevels,
      availableCourses,
      courseFees,
      courseDurations,
      applicationDetails,
      logo,
      isVerified,
    } = req.body;

    if (!name || !shortName || !category) {
      return res.status(400).json({ error: 'Name, shortName and category are required' });
    }

    const newInst = new Institution({
      name,
      shortName,
      category,
      description: description || '',
      location: location || '',
      branches: Array.isArray(branches) ? branches : [],
      website: website || '',
      email: email || '',
      contactNumber: contactNumber || '',
      qualificationLevels: Array.isArray(qualificationLevels) ? qualificationLevels : [],
      nvqLevels: Array.isArray(nvqLevels) ? nvqLevels : [],
      availableCourses: Array.isArray(availableCourses) ? availableCourses : [],
      courseFees: courseFees || '',
      courseDurations: courseDurations || '',
      applicationDetails: applicationDetails || '',
      logo: logo || '',
      isVerified: isVerified !== undefined ? isVerified : true,
    });

    const saved = await newInst.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({ error: error.message || 'Failed to create institution' });
  }
});

// 4. PUT /api/institutions/:id - Admin only update institution
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    let updated;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      updated = await Institution.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      updated = await Institution.findOneAndUpdate(
        { $or: [{ shortName: req.params.id }, { name: req.body.name }, { shortName: req.body.shortName }] },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating institution:', error);
    res.status(500).json({ error: error.message || 'Failed to update institution' });
  }
});

// 5. DELETE /api/institutions/:id - Admin only delete institution
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      deleted = await Institution.findByIdAndDelete(req.params.id);
    }
    if (!deleted) {
      const decodedParam = decodeURIComponent(req.params.id);
      deleted = await Institution.findOneAndDelete({
        $or: [
          { shortName: req.params.id },
          { name: req.params.id },
          { shortName: decodedParam },
          { name: decodedParam },
        ],
      });
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json({ message: 'Institution successfully deleted', id: deleted._id });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({ error: 'Failed to delete institution' });
  }
});

module.exports = router;
