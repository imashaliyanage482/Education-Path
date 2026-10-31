const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

// Models
const Course = require('./models/Course');
const Institution = require('./models/Institution');
const CareerPath = require('./models/CareerPath');
const AdminUser = require('./models/AdminUser');

// Government Vocational & Technical Institution Categories (ONLY the specified ones)
const seedGovernmentInstitutions = [
  // 1. Vocational Universities
  {
    name: 'University of Vocational Technology',
    shortName: 'UoVT',
    category: 'Vocational Universities',
    isVerified: true,
  },

  // 2. Advanced Technological Institutes (SLIATE handles all ATIs)
  {
    name: 'Sri Lanka Institute of Advanced Technological Education',
    shortName: 'SLIATE',
    category: 'Advanced Technological Institutes',
    isVerified: true,
  },

  // 3. Technical Colleges
  {
    name: 'Department of Technical Education and Training',
    shortName: 'DTET',
    category: 'Technical Colleges',
    isVerified: true,
  },

  // 4. Vocational Training Centres
  {
    name: 'Vocational Training Authority of Sri Lanka',
    shortName: 'VTA',
    category: 'Vocational Training Centres',
    isVerified: true,
  },
  {
    name: 'National Vocational Training Institute',
    shortName: 'NVTI',
    category: 'Vocational Training Centres',
    isVerified: true,
  },

  // 5. Apprenticeship Institutes
  {
    name: 'National Apprentice and Industrial Training Authority',
    shortName: 'NAITA',
    category: 'Apprenticeship Institutes',
    isVerified: true,
  },

  // 6. Engineering Training Institutes
  {
    name: 'Institute of Engineering Technology',
    shortName: 'IET',
    category: 'Engineering Training Institutes',
    isVerified: true,
  },
  {
    name: 'Ceylon-German Technical Training Institute',
    shortName: 'CGTTI',
    category: 'Engineering Training Institutes',
    isVerified: true,
  },

  // 7. Youth Training Institutes
  {
    name: 'National Youth Services Council',
    shortName: 'NYSC',
    category: 'Youth Training Institutes',
    isVerified: true,
  },

  // 8. Maritime Training Institutes
  {
    name: 'Ocean University of Sri Lanka',
    shortName: 'OCU',
    category: 'Maritime Training Institutes',
    isVerified: true,
  },
];

// 8 Verified VTA Trade Categories to seed into `courses` collection
const seedVTACourses = (vtaId) => [
  {
    name: 'Automobile Mechanic & Diagnostic Technician',
    sinhalaName: 'මෝටර් රථ කාර්මික හා දෝෂ විනිශ්චය පාඨමාලාව',
    institutionId: vtaId,
    institutionName: 'Vocational Training Authority (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Engineering & Technology',
    duration: '1 Year (Full-time)',
    studyMode: ['Full-time', 'Physical'],
    teachingLanguage: ['Sinhala', 'English'],
    overview: 'Vocational training covering petrol/diesel engines, electronic fuel injection, transmission systems, and automotive electrical troubleshooting.',
    fees: { totalFeeLKR: 0, installmentAvailable: false, scholarshipAvailable: true },
    entryRequirements: { olRequirement: { minimumPasses: 6, details: 'G.C.E. O/L completed' } },
    skillsGained: ['Engine overhaul', 'Electronic diagnostic scanners', 'Brake and suspension tuning'],
    careerOpportunities: ['Automobile Technician', 'Service Advisor', 'Vehicle Inspector'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4)',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4 Standard'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Construction Site Supervisor & Civil Draughtsperson',
    sinhalaName: 'ගොඩනැගිලි ඉදිකිරීම් ක්ෂේත්‍ර අධීක්ෂක පාඨමාලාව',
    institutionId: vtaId,
    institutionName: 'Vocational Training Authority (VTA)',
    qualificationType: 'Diploma',
    studyField: 'Engineering & Technology',
    duration: '1 Year',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala', 'English'],
    overview: 'Training in civil architectural drawings, AutoCAD, surveying, quantity estimation, and construction site management.',
    fees: { totalFeeLKR: 0, installmentAvailable: false, scholarshipAvailable: true },
    entryRequirements: { olRequirement: { minimumPasses: 6, details: 'G.C.E. O/L passes with Maths' } },
    skillsGained: ['AutoCAD Drafting', 'Surveying Equipment', 'Bar Bending & Concreting Inspection'],
    careerOpportunities: ['Construction Site Supervisor', 'Assistant Quantity Surveyor', 'CAD Draughtsperson'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4/5)',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Industrial Electrician & Building Electrical Installation',
    sinhalaName: 'කාර්මික හා ගෘහස්ත විදුලි කාර්මික පාඨමාලාව',
    institutionId: vtaId,
    institutionName: 'Vocational Training Authority (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Engineering & Technology',
    duration: '1 Year',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala'],
    overview: 'Wiring of residential and commercial structures, 3-phase motor controls, circuit breakers, and industrial distribution boards.',
    fees: { totalFeeLKR: 0, installmentAvailable: false, scholarshipAvailable: false },
    entryRequirements: { olRequirement: { minimumPasses: 6 } },
    skillsGained: ['Single and 3-Phase Wiring', 'Electrical Safety Standards (IEE)', 'Motor Starters & Control'],
    careerOpportunities: ['Licensed Electrician', 'Maintenance Technician', 'Electrical Installer'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4)',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Food Processing & Quality Control Technician',
    sinhalaName: 'ආහාර සැකසුම් හා තත්ත්ව පාලන කාර්මික ශිල්පී',
    institutionId: vtaId,
    institutionName: 'Vocational Training Authority (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Science & Biotechnology',
    duration: '6 Months - 1 Year',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala'],
    overview: 'Commercial preservation techniques, bakery production, packaging, food hygiene standards, and GMP compliance.',
    fees: { totalFeeLKR: 0, installmentAvailable: false, scholarshipAvailable: false },
    entryRequirements: { olRequirement: { minimumPasses: 6 } },
    skillsGained: ['Food Microbiology Basics', 'Packaging Automation', 'HACCP Safety Verification'],
    careerOpportunities: ['Food Production Assistant', 'Quality Checker', 'Bakery Supervisor'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 3/4)',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 3/4'],
    isPopular: false,
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Healthcare & Nursing Assistant',
    sinhalaName: 'සෞඛ්‍ය හා රෝගී සත්කාරක සහකාර පාඨමාලාව',
    institutionId: vtaId,
    institutionName: 'Vocational Training Authority (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Medicine & Healthcare',
    duration: '1 Year (Includes Clinical Training)',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala', 'English'],
    overview: 'Patient vital monitoring, hospital hygiene, basic first aid, elderly care, and patient assistance under nursing supervision.',
    fees: { totalFeeLKR: 0, installmentAvailable: false, scholarshipAvailable: false },
    entryRequirements: { olRequirement: { minimumPasses: 6, science: 'Simple Pass' } },
    skillsGained: ['Vital Signs Assessment', 'Infection Control', 'Patient Care Protocol'],
    careerOpportunities: ['Healthcare Assistant', 'Caregiver', 'Clinical Support Staff'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 3/4)',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 3/4'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hotel Operations, Professional Cookery & F&B Service',
    sinhalaName: 'හෝටල් මෙහෙයුම්, ආහාර පිසීම සහ සත්කාරක සේවා',
    institutionId: vtaId,
    institutionName: 'Vocational Training Authority (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Hospitality & Tourism',
    duration: '1 Year (With Star-Class Hotel Internship)',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala', 'English'],
    overview: 'Culinary skills, food & beverage service, bar operations, front office procedures, and guest customer relations.',
    fees: { totalFeeLKR: 0, installmentAvailable: false, scholarshipAvailable: false },
    entryRequirements: { olRequirement: { minimumPasses: 6, english: 'Simple Pass' } },
    skillsGained: ['Commercial Culinary Methods', 'Beverage Service Standards', 'Front Office Software'],
    careerOpportunities: ['Commis Chef', 'F&B Steward', 'Guest Relations Officer'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4)',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Information Communication Technology (ICT) Technician',
    sinhalaName: 'තොරතුරු හා සන්නිවේදන තාක්ෂණ (ICT) කාර්මික ශිල්පී',
    institutionId: vtaId,
    institutionName: 'Vocational Training Authority (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Information Technology',
    duration: '1 Year (NVQ Level 4) / 18 Months (NVQ Level 5 Diploma)',
    studyMode: ['Full-time'],
    teachingLanguage: ['English', 'Sinhala'],
    overview: 'Computer hardware assembly, operating systems configuration, LAN networking, graphics design, and office productivity software.',
    fees: { totalFeeLKR: 0, installmentAvailable: false, scholarshipAvailable: false },
    entryRequirements: { olRequirement: { minimumPasses: 6, mathematics: 'Credit Pass' } },
    skillsGained: ['PC Hardware & Diagnostics', 'LAN Cable Crimping & Routing', 'Photoshop & Office Tools'],
    careerOpportunities: ['ICT Technician', 'Hardware Support Specialist', 'Network Assistant'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4/5)',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4 / 5'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Beautician & Hair Stylist',
    sinhalaName: 'රූපලාවණ්‍ය හා කොණ්ඩා මෝස්තර ශිල්පී',
    institutionId: vtaId,
    institutionName: 'Vocational Training Authority (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Hospitality & Tourism',
    duration: '6 Months - 1 Year',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala'],
    overview: 'Haircutting, styling, skincare, bridal makeup, nail art, and salon customer care techniques.',
    fees: { totalFeeLKR: 0, installmentAvailable: false, scholarshipAvailable: false },
    entryRequirements: { olRequirement: { minimumPasses: 6 } },
    skillsGained: ['Hair Styling & Treatment', 'Facial & Skincare Therapies', 'Bridal Dressing'],
    careerOpportunities: ['Beautician', 'Hair Stylist', 'Salon Owner'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 3/4)',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['NVQ Level 3/4 (Trade availability subject to official centre confirmation)'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Synchronizing clean government institutions in MongoDB Atlas...');
    await Institution.deleteMany({});
    const createdInstitutions = await Institution.insertMany(seedGovernmentInstitutions);
    console.log(`✅ Saved ${createdInstitutions.length} Government Institutions (Cleaned ATI duplicate, kept SLIATE).`);

    // Find VTA institution id
    const vta = createdInstitutions.find((i) => i.shortName === 'VTA');
    const vtaId = vta ? vta._id : new mongoose.Types.ObjectId();

    console.log('Seeding VTA Course categories into MongoDB Atlas `courses` collection...');
    await Course.deleteMany({});
    const createdCourses = await Course.insertMany(seedVTACourses(vtaId));
    console.log(`✅ Saved ${createdCourses.length} VTA Courses across all 8 Trade Categories into MongoDB Atlas!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
