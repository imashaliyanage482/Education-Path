const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Vocational Universities',
        'Advanced Technological Institutes',
        'Technical Colleges',
        'Vocational Training Centres',
        'Apprenticeship Institutes',
        'Engineering Training Institutes',
        'Youth Training Institutes',
        'Maritime Training Institutes',
      ],
      required: true,
    },
    // Fields prepared for future user-provided data:
    description: { type: String },
    location: { type: String },
    branches: [{ type: String }],
    website: { type: String },
    email: { type: String },
    contactNumber: { type: String },
    qualificationLevels: [{ type: String }],
    nvqLevels: [{ type: String }],
    availableCourses: [{ type: String }],
    courseFees: { type: String },
    courseDurations: { type: String },
    applicationDetails: { type: String },
    logo: { type: String },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Institution', InstitutionSchema);
