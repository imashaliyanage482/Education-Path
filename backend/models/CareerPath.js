const mongoose = require('mongoose');

const CareerPathSchema = new mongoose.Schema(
  {
    careerTitle: { type: String, required: true },
    careerTitleSinhala: { type: String },
    field: { type: String, required: true },
    overview: { type: String, required: true },
    overviewSinhala: { type: String },
    estimatedTotalYears: { type: String, required: true },
    startingQualification: { type: String, required: true },
    finalDesignation: { type: String, required: true },
    averageStartingSalaryLKR: { type: String },
    sampleJobTitles: [String],
    alternativePathsSummary: { type: String },
    milestones: [
      {
        stepNumber: Number,
        title: String,
        titleSinhala: String,
        qualificationLevel: String,
        durationApprox: String,
        description: String,
        descriptionSinhala: String,
        alternativeRoute: String,
        sampleCourses: [String],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerPath', CareerPathSchema);
