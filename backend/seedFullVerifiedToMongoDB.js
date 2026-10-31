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

// 8 Official Statutory Institutions
const STATUTORY_INSTITUTIONS = [
  {
    name: 'University of Vocational Technology',
    shortName: 'UoVT',
    category: 'Vocational Universities',
    description: 'Sri Lanka’s premier vocational university established by Act No. 31 of 2008, awarding NVQ Level 7 Bachelor of Technology (B.Tech) degrees.',
    location: 'Kandawala, Ratmalana, Sri Lanka',
    website: 'https://www.uovt.ac.lk/',
    email: 'info@uovt.ac.lk',
    contactNumber: '+94 11 2630700',
    logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'Sri Lanka Institute of Advanced Technological Education',
    shortName: 'SLIATE',
    category: 'Advanced Technological Institutes',
    description: 'Statutory body established by Act No. 29 of 1995 conducting Higher National Diploma (HND) programmes across 19 regional ATIs in Sri Lanka.',
    location: 'Janawathu Mawatha, Colombo 10, Sri Lanka',
    website: 'https://www.sliate.ac.lk/',
    email: 'info@sliate.ac.lk',
    contactNumber: '+94 11 2691572',
    logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'Department of Technical Education and Training',
    shortName: 'DTET',
    category: 'Technical Colleges',
    description: 'Pioneering technical education department established in 1893, administering 39 Technical Colleges and Colleges of Technology islandwide.',
    location: 'P.O. Box 557, Olcott Mawatha, Colombo 10, Sri Lanka',
    website: 'http://www.dtet.gov.lk/',
    email: 'info@dtet.gov.lk',
    contactNumber: '+94 11 2692224',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'Vocational Training Authority of Sri Lanka',
    shortName: 'VTA',
    category: 'Vocational Training Centres',
    description: 'Established under Act No. 12 of 1995 to cater to youth vocational training needs across 250+ rural and urban training centres islandwide.',
    location: '354/2, Nipunatha Piyasa, Elvitigala Mawatha, Colombo 05',
    website: 'https://www.vtasl.gov.lk/',
    email: 'info@vtasl.gov.lk',
    contactNumber: '+94 11 2581979',
    logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'National Vocational Training Institute',
    shortName: 'NVTI',
    category: 'Vocational Training Centres',
    description: 'Premier national-level vocational training institutes under VTA delivering high-demand Level 4-6 NVQ technician and craft training.',
    location: 'Islandwide (Narahenpita, Matara, Vantharumoolai, etc.)',
    website: 'https://www.vtasl.gov.lk/',
    email: 'nvti@vtasl.gov.lk',
    contactNumber: '+94 11 2581979',
    logo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'National Apprentice and Industrial Training Authority',
    shortName: 'NAITA',
    category: 'Apprenticeship Institutes',
    description: 'Established under Act No. 20 of 1990 (originally NAB 1971), pioneering enterprise-based dual technical apprenticeship and NVQ qualifications.',
    location: '971, Sri Jayawardenepura Mawatha, Welikada, Rajagiriya, Sri Lanka',
    website: 'https://naita.gov.lk/',
    email: 'info@naita.gov.lk',
    contactNumber: '+94 11 2863765',
    logo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'Ceylon-German Technical Training Institute',
    shortName: 'CGTTI',
    category: 'Engineering Training Institutes',
    description: 'Acclaimed premier German-Sri Lankan automotive and precision mechanical engineering academy founded in 1959.',
    location: '582, Galle Road, Mount Lavinia, Sri Lanka',
    website: 'https://www.cgtti.lk/',
    email: 'info@cgtti.lk',
    contactNumber: '+94 11 2605625',
    logo: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'National Youth Services Council',
    shortName: 'NYSC',
    category: 'Youth Training Institutes',
    description: 'Government statutory youth development council empowering youth through vocational, digital media, and technical education across Sri Lanka.',
    location: '65, Highlevel Road, Maharagama, Sri Lanka',
    website: 'https://www.nysc.lk/',
    email: 'info@nysc.lk',
    contactNumber: '+94 11 2850986',
    logo: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
];

// Helper to determine StudyField
function mapStudyField(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('it') || cat.includes('information') || cat.includes('software') || cat.includes('computer') || cat.includes('network')) return 'Information Technology';
  if (cat.includes('health') || cat.includes('nursing') || cat.includes('medical') || cat.includes('doctor')) return 'Medicine & Healthcare';
  if (cat.includes('account') || cat.includes('finance') || cat.includes('audit')) return 'Accounting & Finance';
  if (cat.includes('business') || cat.includes('management') || cat.includes('secretarial')) return 'Business & Management';
  if (cat.includes('media') || cat.includes('video') || cat.includes('design') || cat.includes('multimedia')) return 'Design & Multimedia';
  if (cat.includes('hotel') || cat.includes('tourism') || cat.includes('cookery') || cat.includes('hospitality')) return 'Hospitality & Tourism';
  if (cat.includes('teach') || cat.includes('education')) return 'Education & Teaching';
  return 'Engineering & Technology';
}

// Helper to determine QualificationType
function mapQualificationType(nvqLevel, name, qualType) {
  if (qualType) {
    if (qualType === 'Apprenticeship') return 'Certificate';
    if (['Certificate', 'Foundation', 'Diploma', 'Higher Diploma', 'Degree'].includes(qualType)) return qualType;
  }
  const n = (name || '').toLowerCase();
  const nvq = (nvqLevel || '').toLowerCase();
  if (n.includes('bachelor') || n.includes('b.tech') || n.includes('degree') || nvq.includes('level 7')) return 'Degree';
  if (n.includes('hnd') || n.includes('higher national diploma') || n.includes('higher diploma')) return 'Higher Diploma';
  if (n.includes('diploma') || nvq.includes('level 5') || nvq.includes('level 6')) return 'Diploma';
  return 'Certificate';
}

async function seedEverything() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  console.log('Connected to Atlas successfully.');

  // 1. Upsert Admin Account
  const adminEmail = 'admin@.lk';
  const adminPassword = 'admin12';
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(adminPassword, salt);
  let admin = await AdminUser.findOne({ email: adminEmail });
  if (admin) {
    admin.passwordHash = passwordHash;
    admin.salt = salt;
    admin.role = 'ADMIN';
    admin.isActive = true;
    await admin.save();
    console.log(`✅ Administrator verified: ${adminEmail}`);
  } else {
    admin = new AdminUser({
      name: 'EduPath Chief Administrator',
      email: adminEmail,
      passwordHash,
      salt,
      role: 'ADMIN',
      isActive: true,
    });
    await admin.save();
    console.log(`✅ Administrator created: ${adminEmail}`);
  }

  // 2. Synchronize 8 Institutions
  console.log('Synchronizing 8 Statutory Institutions...');
  await Institution.deleteMany({});
  const insertedInsts = await Institution.insertMany(STATUTORY_INSTITUTIONS);
  const instMap = {};
  insertedInsts.forEach((i) => {
    instMap[i.shortName] = i;
    console.log(` - [${i.shortName}] ${i.name}`);
  });

  // 3. Load all compiled verified data
  const vta = require('../scratch_all_compiled/data/vtaData.js');
  const uovt = require('../scratch_all_compiled/data/uovtData.js');
  const sliate = require('../scratch_all_compiled/data/sliateData.js');
  const dtet = require('../scratch_all_compiled/data/dtetData.js');
  const nvti = require('../scratch_all_compiled/data/nvtiData.js');
  const cgtti = require('../scratch_all_compiled/data/cgttiData.js');
  const nysc = require('../scratch_all_compiled/data/nyscData.js');
  const naita = require('../scratch_all_compiled/data/naitaData.js');

  const allUnifiedCourses = [];

  // VTA
  (vta.VTA_VERIFIED_COURSES || []).forEach((c) => {
    const inst = instMap['VTA'];
    allUnifiedCourses.push({
      id: c.id,
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst._id,
      institutionName: inst.name,
      institutionLogo: inst.logo,
      qualificationType: mapQualificationType(c.nvqLevel, c.name, c.qualificationType),
      studyField: mapStudyField(c.category),
      duration: c.duration || '6 Months - 1 Year',
      studyMode: ['Full-time', 'Physical'],
      teachingLanguage: ['Sinhala', 'English'],
      overview: c.description || `${c.name} offered by VTA.`,
      sinhalaOverview: c.description || '',
      fees: { totalFeeLKR: c.isFree ? 0 : 25000, installmentAvailable: false, scholarshipAvailable: true },
      entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L passed' } },
      modules: [{ yearOrSemester: 'Phase 1', subjects: c.features || ['Theory & Workshop Practical Training'] }],
      skillsGained: c.features || ['Industry Standard Hands-on Competence'],
      careerOpportunities: ['Certified Technician', 'Craftsman', 'Specialist'],
      qualificationAwarded: `National Vocational Qualification (${c.nvqLevel})`,
      nvqLevel: c.nvqLevel,
      district: c.district || 'Islandwide (250+ Centres)',
      awardingBody: 'Vocational Training Authority / TVEC',
      accreditation: ['TVEC Accredited', c.nvqLevel],
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      isPopular: true,
    });
  });

  // UoVT
  (uovt.UOVT_VERIFIED_PROGRAMMES || []).forEach((c) => {
    const inst = instMap['UoVT'];
    allUnifiedCourses.push({
      id: c.id,
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst._id,
      institutionName: inst.name,
      institutionLogo: inst.logo,
      qualificationType: 'Degree',
      studyField: mapStudyField(c.subjectCategory),
      duration: c.duration || '3 - 4 Years',
      studyMode: ['Full-time', 'Part-time'],
      teachingLanguage: ['English'],
      overview: c.description || `${c.name} offered by UoVT.`,
      sinhalaOverview: c.description || '',
      fees: { totalFeeLKR: 0, registrationFeeLKR: 5000, scholarshipAvailable: true, scholarshipNote: 'Government subsidized free university education' },
      entryRequirements: { olRequirement: { details: 'G.C.E. O/L with 6 passes' }, alRequirement: { details: '3 passes in G.C.E. A/L or NVQ Level 5/6 Diploma' } },
      modules: [{ yearOrSemester: 'Undergraduate Curriculum', subjects: ['Foundation & Engineering Practice', 'Advanced Technologies', 'Final Year Industry Project'] }],
      skillsGained: ['Advanced Technical Competence', 'Engineering Design', 'Research & Innovation'],
      careerOpportunities: ['Professional Engineer', 'Technologist', 'Project Lead'],
      qualificationAwarded: 'Bachelor of Technology (NVQ Level 7)',
      nvqLevel: 'NVQ Level 7',
      district: 'Kandawala, Ratmalana',
      awardingBody: 'University of Vocational Technology',
      accreditation: ['UGC Recognized', 'TVEC Accredited', 'NVQ Level 7'],
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
      isPopular: true,
      isFeatured: true,
    });
  });

  // SLIATE
  (sliate.SLIATE_VERIFIED_PROGRAMMES || []).forEach((c) => {
    const inst = instMap['SLIATE'];
    allUnifiedCourses.push({
      id: c.id,
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst._id,
      institutionName: inst.name,
      institutionLogo: inst.logo,
      qualificationType: 'Higher Diploma',
      studyField: mapStudyField(c.category),
      duration: c.duration || '2.5 - 3 Years',
      studyMode: ['Full-time', 'Part-time'],
      teachingLanguage: ['English'],
      overview: c.description || `${c.name} offered by SLIATE.`,
      sinhalaOverview: c.description || '',
      fees: { totalFeeLKR: 0, registrationFeeLKR: 3000, scholarshipAvailable: true },
      entryRequirements: { olRequirement: { details: 'Passed G.C.E. O/L with Credit passes in Mathematics & English' }, alRequirement: { details: 'Passed G.C.E. A/L in relevant stream' } },
      modules: [{ yearOrSemester: 'Curriculum Framework', subjects: ['Core Diploma Modules', 'Professional Internship (6 Months)'] }],
      skillsGained: ['Technical & Professional Competence', 'Industry-Ready Practical Knowledge'],
      careerOpportunities: ['Associate Engineer', 'Accountant', 'IT Executive', 'Assistant Manager'],
      qualificationAwarded: 'Higher National Diploma (HND)',
      nvqLevel: 'NVQ Level 6',
      district: 'Islandwide (19 Regional ATIs)',
      awardingBody: 'SLIATE / Ministry of Higher Education',
      accreditation: ['Ministry Recognized', 'TVEC Aligned (NVQ 6)'],
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      isPopular: true,
      isFeatured: true,
    });
  });

  // DTET
  (dtet.DTET_VERIFIED_COURSES || []).forEach((c) => {
    const inst = instMap['DTET'];
    allUnifiedCourses.push({
      id: c.id,
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst._id,
      institutionName: inst.name,
      institutionLogo: inst.logo,
      qualificationType: mapQualificationType(c.nvqLevel, c.name),
      studyField: mapStudyField(c.category),
      duration: c.duration || '1 - 3 Years',
      studyMode: ['Full-time'],
      teachingLanguage: ['Sinhala', 'English'],
      overview: c.description || `${c.name} offered by DTET.`,
      sinhalaOverview: c.description || '',
      fees: { totalFeeLKR: 0, scholarshipAvailable: true },
      entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L passed with Mathematics and Science' } },
      modules: [{ yearOrSemester: 'NCT / NVQ Modules', subjects: ['Engineering Science', 'Technical Drawing', 'Workshop Labs'] }],
      skillsGained: ['Engineering Draughtsmanship', 'Site Supervision', 'Technical Verification'],
      careerOpportunities: ['Site Supervisor', 'Technical Officer', 'Engineering Assistant'],
      qualificationAwarded: c.qualificationAwarded || `National Certificate in Technology (${c.nvqLevel})`,
      nvqLevel: c.nvqLevel,
      district: 'Islandwide (39 Colleges of Technology)',
      awardingBody: 'Department of Technical Education and Training',
      accreditation: ['Government Certified', c.nvqLevel],
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
      isPopular: true,
    });
  });

  // NVTI
  (nvti.NVTI_VERIFIED_COURSES || []).forEach((c) => {
    const inst = instMap['NVTI'];
    allUnifiedCourses.push({
      id: c.id,
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst._id,
      institutionName: inst.name,
      institutionLogo: inst.logo,
      qualificationType: mapQualificationType(c.nvqLevel, c.name),
      studyField: mapStudyField(c.category),
      duration: c.duration || '1 - 2 Years',
      studyMode: ['Full-time', 'Physical'],
      teachingLanguage: ['Sinhala', 'English'],
      overview: c.description || `${c.name} offered by NVTI.`,
      sinhalaOverview: c.description || '',
      fees: { totalFeeLKR: 0, scholarshipAvailable: true },
      entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L passed' } },
      modules: [{ yearOrSemester: 'Technical Training', subjects: ['Industrial Practice', 'Automation & PLC Systems'] }],
      skillsGained: ['PLC Programming', 'Industrial Electrician Competence', 'Motor Control'],
      careerOpportunities: ['Automation Technician', 'Industrial Electrician', 'Maintenance Officer'],
      qualificationAwarded: `National Vocational Qualification (${c.nvqLevel})`,
      nvqLevel: c.nvqLevel,
      district: 'Islandwide NVTIs',
      awardingBody: 'NVTI / VTA / TVEC',
      accreditation: ['TVEC Accredited', c.nvqLevel],
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      isPopular: true,
    });
  });

  // CGTTI
  (cgtti.CGTTI_VERIFIED_COURSES || []).forEach((c) => {
    const inst = instMap['CGTTI'];
    allUnifiedCourses.push({
      id: c.id,
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst._id,
      institutionName: inst.name,
      institutionLogo: inst.logo,
      qualificationType: mapQualificationType(c.nvqLevel, c.name),
      studyField: 'Engineering & Technology',
      duration: c.duration || '3.5 Years',
      studyMode: ['Full-time'],
      teachingLanguage: ['English', 'Sinhala'],
      overview: c.description || `${c.name} offered by German Tech (CGTTI).`,
      sinhalaOverview: c.description || '',
      fees: { totalFeeLKR: 0, registrationFeeLKR: 10000, scholarshipAvailable: true, scholarshipNote: 'Full government subsidized German technical training' },
      entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L with 6 passes including Credit in Mathematics & Science, Competitive Entrance Exam' } },
      modules: [{ yearOrSemester: 'German Tech Dual Apprenticeship', subjects: ['Precision Tool Practice', 'Automotive Systems', '1-Year Industrial In-Plant Training'] }],
      skillsGained: ['Precision Engineering', 'Engine Diagnostics', 'Electronic Fuel Injection', 'Hydraulics'],
      careerOpportunities: ['Automobile Engineer', 'Quality Inspector', 'Senior Diagnostic Specialist'],
      qualificationAwarded: `CGTTI Special Craftsman Diploma (${c.nvqLevel})`,
      nvqLevel: c.nvqLevel,
      district: 'Mount Lavinia, Colombo',
      awardingBody: 'Ceylon-German Technical Training Institute',
      accreditation: ['German Tech Certified', 'TVEC Accredited', c.nvqLevel],
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
      isPopular: true,
      isFeatured: true,
    });
  });

  // NYSC
  (nysc.NYSC_VERIFIED_COURSES || []).forEach((c) => {
    const inst = instMap['NYSC'];
    allUnifiedCourses.push({
      id: c.id,
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst._id,
      institutionName: inst.name,
      institutionLogo: inst.logo,
      qualificationType: mapQualificationType(c.nvqLevel, c.name),
      studyField: mapStudyField(c.category),
      duration: c.duration || '6 Months - 1 Year',
      studyMode: ['Full-time', 'Physical'],
      teachingLanguage: ['Sinhala', 'English'],
      overview: c.description || `${c.name} offered by NYSC.`,
      sinhalaOverview: c.description || '',
      fees: { totalFeeLKR: 0, scholarshipAvailable: true },
      entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L completed' } },
      modules: [{ yearOrSemester: 'Youth Skills Training', subjects: ['Digital Media Practice', 'Studio Production', 'Hands-on Lab'] }],
      skillsGained: ['Video Editing', 'ICT Skills', 'Creative Production'],
      careerOpportunities: ['Video Editor', 'ICT Technician', 'Content Creator'],
      qualificationAwarded: `National Vocational Qualification (${c.nvqLevel})`,
      nvqLevel: c.nvqLevel,
      district: 'Maharagama & Islandwide Youth Centres',
      awardingBody: 'National Youth Services Council / TVEC',
      accreditation: ['TVEC Accredited', c.nvqLevel],
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
      isPopular: true,
    });
  });

  // NAITA
  (naita.NAITA_VERIFIED_COURSES || []).forEach((c) => {
    const inst = instMap['NAITA'];
    allUnifiedCourses.push({
      id: c.id,
      name: c.name,
      sinhalaName: c.sinhalaName || '',
      institutionId: inst._id,
      institutionName: inst.name,
      institutionLogo: inst.logo,
      qualificationType: c.qualificationType === 'Apprenticeship' ? 'Certificate' : c.qualificationType,
      studyField: 'Engineering & Technology',
      duration: c.duration || '1 - 3 Years',
      studyMode: ['Full-time', 'Physical'],
      teachingLanguage: ['Sinhala', 'English'],
      overview: c.description || `${c.name} enterprise-based training under NAITA.`,
      sinhalaOverview: c.description || '',
      fees: { totalFeeLKR: 0, registrationFeeLKR: c.courseFee && c.courseFee.includes('Rs') ? parseInt(c.courseFee.replace(/\D/g, ''), 10) || 0 : 0, scholarshipAvailable: true, scholarshipNote: 'State apprentice allowance provided' },
      entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L completed' } },
      modules: c.modules ? c.modules.map((m) => ({ yearOrSemester: m.title, subjects: m.subjects })) : [{ yearOrSemester: 'Dual Apprenticeship', subjects: ['Workshop Practice', 'Enterprise On-the-Job Placement (OJT)'] }],
      skillsGained: c.features || ['Practical Enterprise Hands-on Skills'],
      careerOpportunities: ['Certified Craftsman', 'Industrial Technician', 'Apprentice Graduate'],
      qualificationAwarded: `National Vocational Qualification (${c.nvqLevel})`,
      nvqLevel: c.nvqLevel,
      district: c.district || 'Islandwide (25 District Offices)',
      awardingBody: 'NAITA / TVEC',
      accreditation: ['TVEC Accredited', c.nvqLevel],
      coverImage: c.coverImage || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80',
      isPopular: true,
    });
  });

  console.log(`\nPrepared total of ${allUnifiedCourses.length} verified courses across all 8 institutions!`);
  console.log('Inserting into MongoDB Atlas...');
  await Course.deleteMany({});
  const insertedCourses = await Course.insertMany(allUnifiedCourses);
  console.log(`✅ Successfully seeded ${insertedCourses.length} courses into MongoDB Atlas!`);

  const totalInDb = await Course.countDocuments();
  console.log(`Total Verified Courses live in Atlas: ${totalInDb}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seedEverything().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
