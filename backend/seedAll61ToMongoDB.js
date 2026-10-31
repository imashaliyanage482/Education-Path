const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

const Course = require('./models/Course');
const Institution = require('./models/Institution');
const AdminUser = require('./models/AdminUser');
const crypto = require('crypto');

const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

const sc = require('../scratch_compiled/data/sampleCourses.js');
const naita = require('../scratch_compiled/data/naitaData.js');

console.log('Sample courses count:', sc.SAMPLE_COURSES.length);
console.log('NAITA courses count:', naita.NAITA_VERIFIED_COURSES.length);
console.log('Total to seed:', sc.SAMPLE_COURSES.length + naita.NAITA_VERIFIED_COURSES.length);

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to Atlas successfully!');

  // Institutions
  const insts = await Institution.find({});
  const instMap = {};
  insts.forEach(i => {
    instMap[i.shortName] = i;
  });
  console.log('Institutions found in Atlas:', Object.keys(instMap));

  // Build 21 sample courses
  const sampleCoursesMapped = sc.SAMPLE_COURSES.map(c => {
    let shortName = 'VTA';
    if (c.institutionName.includes('UoVT') || c.id.startsWith('uovt')) shortName = 'UoVT';
    else if (c.institutionName.includes('SLIATE') || c.id.startsWith('sliate')) shortName = 'SLIATE';
    else if (c.institutionName.includes('DTET') || c.id.startsWith('dtet')) shortName = 'DTET';
    else if (c.institutionName.includes('NVTI') || c.id.startsWith('nvti')) shortName = 'NVTI';
    else if (c.institutionName.includes('CGTTI') || c.id.startsWith('cgtti')) shortName = 'CGTTI';
    else if (c.institutionName.includes('NYSC') || c.id.startsWith('nysc')) shortName = 'NYSC';
    else if (c.institutionName.includes('NAITA') || c.id.startsWith('naita')) shortName = 'NAITA';

    const inst = instMap[shortName];
    return {
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst ? inst._id : new mongoose.Types.ObjectId(),
      institutionName: inst ? inst.name : c.institutionName,
      institutionLogo: inst ? inst.logo : c.institutionLogo,
      qualificationType: c.qualificationType,
      studyField: c.studyField,
      duration: c.duration,
      studyMode: c.studyMode && c.studyMode.length > 0 ? c.studyMode : ['Full-time'],
      teachingLanguage: c.teachingLanguage && c.teachingLanguage.length > 0 ? c.teachingLanguage : ['English', 'Sinhala'],
      overview: c.overview,
      sinhalaOverview: c.sinhalaOverview || '',
      fees: {
        totalFeeLKR: c.fees && typeof c.fees.totalFeeLKR === 'number' ? c.fees.totalFeeLKR : 0,
        registrationFeeLKR: c.fees && c.fees.registrationFeeLKR ? c.fees.registrationFeeLKR : 0,
        installmentAvailable: c.fees ? Boolean(c.fees.installmentAvailable) : false,
        scholarshipAvailable: c.fees ? Boolean(c.fees.scholarshipAvailable) : false,
        scholarshipNote: c.fees && c.fees.scholarshipNote ? c.fees.scholarshipNote : '',
      },
      entryRequirements: c.entryRequirements || { olRequirement: { minimumPasses: 6 } },
      modules: c.modules || [],
      skillsGained: c.skillsGained || [],
      careerOpportunities: c.careerOpportunities || [],
      qualificationAwarded: c.qualificationAwarded || c.qualificationType,
      nvqLevel: c.nvqLevel || '',
      district: c.district || 'Islandwide',
      awardingBody: c.awardingBody || shortName,
      accreditation: c.accreditation || ['TVEC'],
      intakeMonths: c.intakeMonths || ['January'],
      applicationDeadline: c.applicationDeadline || 'Continuous',
      officialApplyLink: c.officialApplyLink || 'https://www.edupath.lk',
      officialWebsite: c.officialWebsite || 'https://www.edupath.lk',
      lastVerifiedDate: c.lastVerifiedDate || 'October 2026',
      isPopular: Boolean(c.isPopular),
      isFeatured: Boolean(c.isFeatured),
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    };
  });

  // Build 40 NAITA courses
  const naitaInst = instMap['NAITA'];
  const naitaCoursesMapped = naita.NAITA_VERIFIED_COURSES.map(n => {
    return {
      name: n.name,
      sinhalaName: n.sinhalaName || '',
      institutionId: naitaInst ? naitaInst._id : new mongoose.Types.ObjectId(),
      institutionName: naitaInst ? naitaInst.name : 'National Apprentice and Industrial Training Authority (NAITA)',
      institutionLogo: naitaInst ? naitaInst.logo : 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop&q=80',
      qualificationType: n.qualificationType === 'Apprenticeship' ? 'Certificate' : n.qualificationType,
      studyField: 'Engineering & Technology',
      duration: n.duration,
      studyMode: ['Full-time', 'Physical'],
      teachingLanguage: ['Sinhala', 'English'],
      overview: n.description,
      sinhalaOverview: n.description,
      fees: {
        totalFeeLKR: 0,
        registrationFeeLKR: n.courseFee && n.courseFee.includes('Rs') ? parseInt(n.courseFee.replace(/\D/g, ''), 10) || 0 : 0,
        installmentAvailable: false,
        scholarshipAvailable: true,
        scholarshipNote: 'State apprentice allowance / subsidy available.',
      },
      entryRequirements: {
        olRequirement: { details: n.entryRequirements },
        minimumAge: 16,
      },
      modules: n.modules ? n.modules.map(m => ({ yearOrSemester: m.title, subjects: m.subjects })) : [
        { yearOrSemester: 'Phase 1 - Dual Training', subjects: ['Workshop Practice', 'Industrial On-the-Job Placement (OJT)'] }
      ],
      skillsGained: n.features || ['Practical Workshop Competence', 'Enterprise Hands-on Skills'],
      careerOpportunities: ['Industrial Apprentice', 'Certified Craftsman', 'Technician'],
      qualificationAwarded: `${n.qualificationType} (${n.nvqLevel})`,
      nvqLevel: n.nvqLevel,
      district: n.district,
      awardingBody: 'NAITA / TVEC',
      accreditation: ['TVEC Accredited', n.nvqLevel],
      intakeMonths: ['January', 'July'],
      applicationDeadline: 'Continuous / Annual Gazette',
      officialApplyLink: n.officialSourceUrl,
      officialWebsite: 'https://naita.gov.lk',
      coverImage: n.coverImage || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80',
      lastVerifiedDate: n.verificationDate,
      isPopular: true,
      isFeatured: false,
    };
  });

  const all61Courses = [...sampleCoursesMapped, ...naitaCoursesMapped];
  console.log(`Prepared ${all61Courses.length} courses. Validating and inserting to Atlas...`);

  // Delete old courses and insert all 61 courses
  await Course.deleteMany({});
  const inserted = await Course.insertMany(all61Courses);
  console.log('✅ SUCCESSFULLY INSERTED COURSES INTO MONGODB ATLAS:', inserted.length);

  const finalCount = await Course.countDocuments();
  console.log('Total verified Course documents in Atlas:', finalCount);

  await mongoose.disconnect();
  console.log('Disconnected cleanly.');
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
