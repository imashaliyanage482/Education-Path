const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Institution = require('../models/Institution');
const jwt = require('jsonwebtoken');

// Middleware: Authenticate Admin JWT Token
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Administrator authentication token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edupath_jwt_secret_key_2026');
    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired administrator token' });
  }
};

// 1. GET /api/courses - List all courses from MongoDB Atlas with dynamic filters
router.get('/', async (req, res) => {
  try {
    const { q, field, level, mode, maxFee, nvqLevel, institutionId } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { sinhalaName: { $regex: q, $options: 'i' } },
        { institutionName: { $regex: q, $options: 'i' } },
        { studyField: { $regex: q, $options: 'i' } },
        { skillsGained: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    if (field && field !== 'All') {
      query.studyField = field;
    }

    if (level && level !== 'All') {
      query.qualificationType = level;
    }

    if (nvqLevel && nvqLevel !== 'All') {
      const nvqRegex = new RegExp(nvqLevel, 'i');
      query.$or = [
        { nvqLevel: nvqRegex },
        { qualificationAwarded: nvqRegex },
        { accreditation: { $in: [nvqRegex] } },
      ];
    }

    if (institutionId && institutionId !== 'All') {
      // match either string or ObjectId
      query.$or = [
        { institutionId: institutionId },
        { institutionName: { $regex: institutionId, $options: 'i' } },
      ];
    }

    if (mode && mode !== 'All') {
      query.studyMode = mode;
    }

    if (maxFee) {
      query['fees.totalFeeLKR'] = { $lte: Number(maxFee) };
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses from MongoDB Atlas:', error);
    res.status(500).json({ error: 'Failed to retrieve courses from database' });
  }
});

// 2. GET /api/courses/:id - Single course details
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found in database' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// 3. POST /api/courses - Add a new course directly into MongoDB Atlas from Admin Panel
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      sinhalaName,
      institutionName,
      institutionLogo,
      qualificationType,
      studyField,
      duration,
      studyMode,
      teachingLanguage,
      overview,
      sinhalaOverview,
      totalFeeLKR,
      registrationFeeLKR,
      installmentAvailable,
      installmentDetails,
      scholarshipAvailable,
      scholarshipNote,
      olRequirements,
      alStream,
      alPasses,
      alRequirementsDetails,
      skillsGained,
      careerOpportunities,
      qualificationAwarded,
      nvqLevel,
      district,
      accreditation,
      officialApplyLink,
      officialWebsite,
      coverImage,
    } = req.body;

    if (!name || !institutionName || !qualificationType || !studyField) {
      return res.status(400).json({
        error: 'Required fields missing: Name, Institution, Qualification Level, and Study Field are required.',
      });
    }

    let resolvedInstId = null;
    let resolvedInstLogo = institutionLogo;
    if (req.body.institutionId && mongoose.Types.ObjectId.isValid(req.body.institutionId)) {
      resolvedInstId = new mongoose.Types.ObjectId(req.body.institutionId);
    } else {
      const cleanInstName = (institutionName || '').trim();
      const matchedInst = await Institution.findOne({
        $or: [
          { shortName: { $regex: cleanInstName, $options: 'i' } },
          { name: { $regex: cleanInstName, $options: 'i' } },
        ],
      });
      if (matchedInst) {
        resolvedInstId = matchedInst._id;
        if (!resolvedInstLogo) resolvedInstLogo = matchedInst.logo;
      } else {
        const anyInst = await Institution.findOne();
        resolvedInstId = anyInst ? anyInst._id : new mongoose.Types.ObjectId();
      }
    }

    const newCourse = new Course({
      name,
      sinhalaName: sinhalaName || '',
      institutionId: resolvedInstId,
      institutionName,
      institutionLogo: resolvedInstLogo || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150',
      qualificationType,
      studyField,
      duration: duration || '3-4 Years',
      studyMode: studyMode || ['Full-time'],
      teachingLanguage: teachingLanguage || ['English'],
      overview: overview || 'Course overview pending update.',
      sinhalaOverview: sinhalaOverview || '',
      nvqLevel: nvqLevel || '',
      district: district || 'All Island',
      fees: {
        totalFeeLKR: req.body.fees?.totalFeeLKR !== undefined ? Number(req.body.fees.totalFeeLKR) : (Number(totalFeeLKR) || 0),
        registrationFeeLKR: Number(registrationFeeLKR) || 0,
        installmentAvailable: !!installmentAvailable,
        installmentDetails: installmentDetails || '',
        scholarshipAvailable: req.body.fees?.scholarshipAvailable !== undefined ? !!req.body.fees.scholarshipAvailable : !!scholarshipAvailable,
        scholarshipNote: scholarshipNote || '',
      },
      entryRequirements: {
        olRequirement: {
          english: 'Credit (C)',
          mathematics: 'Credit (C)',
          minimumPasses: 6,
          details: olRequirements || 'G.C.E. O/L with 6 passes including English and Mathematics.',
        },
        alRequirement: {
          stream: alStream || 'Any',
          minimumPasses: Number(alPasses) || 2,
          details: alRequirementsDetails || 'G.C.E. A/L in relevant stream.',
        },
      },
      modules: req.body.modules || [
        { yearOrSemester: 'Year 1', subjects: ['Core Fundamentals', 'Practical Lab', 'Academic Communication'] },
      ],
      skillsGained: Array.isArray(skillsGained)
        ? skillsGained
        : typeof skillsGained === 'string'
        ? skillsGained.split(',').map((s) => s.trim())
        : ['Core Competencies', 'Industry Practices'],
      careerOpportunities: Array.isArray(careerOpportunities)
        ? careerOpportunities
        : typeof careerOpportunities === 'string'
        ? careerOpportunities.split(',').map((s) => s.trim())
        : ['Entry-level Professional', 'Executive'],
      qualificationAwarded: qualificationAwarded || name,
      awardingBody: institutionName,
      accreditation: Array.isArray(accreditation) ? accreditation : ['UGC Recognized'],
      officialApplyLink: officialApplyLink || 'https://www.edupath.lk',
      officialWebsite: officialWebsite || 'https://www.edupath.lk',
      lastVerifiedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isPopular: true,
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    });

    const savedCourse = await newCourse.save();
    console.log(`Course created successfully in MongoDB Atlas: ${savedCourse.name} (ID: ${savedCourse._id})`);
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error saving course to MongoDB Atlas:', error);
    res.status(500).json({ error: 'Failed to create course in database', details: error.message });
  }
});

// 4. PUT /api/courses/:id - Update an existing course in MongoDB Atlas
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.institutionId && !mongoose.Types.ObjectId.isValid(updateData.institutionId)) {
      delete updateData.institutionId;
    }
    const updated = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Course not found to update' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course in MongoDB Atlas', details: error.message });
  }
});

// 5. DELETE /api/courses/:id - Delete a course from MongoDB Atlas
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Course not found to delete' });
    }
    res.json({ message: 'Course successfully deleted from MongoDB Atlas', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course from MongoDB Atlas' });
  }
});

module.exports = router;
