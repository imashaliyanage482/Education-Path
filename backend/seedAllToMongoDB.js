const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

// Models
const Course = require('./models/Course');
const Institution = require('./models/Institution');
const AdminUser = require('./models/AdminUser');

// SHA-512 password hasher
const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

// 8 Statutory Government TVET Institutions (Strictly verified)
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
    description: 'Pioneering technical education department managing 39 Technical Colleges and Colleges of Technology across all 9 provinces in Sri Lanka.',
    location: 'P.O. Box 557, Olcott Mawatha, Colombo 10',
    website: 'http://www.dtet.gov.lk/',
    email: 'info@dtet.gov.lk',
    contactNumber: '+94 11 2686197',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'Vocational Training Authority of Sri Lanka',
    shortName: 'VTA',
    category: 'Vocational Training Centres',
    description: 'National vocational authority established in 1995 operating over 200 island-wide vocational training centres delivering NVQ Level 3 to 5 courses.',
    location: '354/2, Elvitigala Mawatha, Colombo 05',
    website: 'https://www.vtasl.gov.lk/',
    email: 'info@vtasl.gov.lk',
    contactNumber: '+94 11 2581906',
    logo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'National Vocational Training Institute',
    shortName: 'NVTI',
    category: 'Vocational Training Centres',
    description: 'Apex regional vocational training institutes delivering hands-on NVQ Level 3, 4, and 5 technical and industrial craft qualifications.',
    location: 'Regional Campuses: Narahenpita, Orugodawatta, Vantharumoolai, Matara',
    website: 'https://course.vta.lk/',
    email: 'nvti@vtasl.gov.lk',
    contactNumber: '+94 11 2581907',
    logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'National Apprentice and Industrial Training Authority',
    shortName: 'NAITA',
    category: 'Apprenticeship Institutes',
    description: 'Statutory authority conducting enterprise-based dual apprenticeship training across 150+ craft trades with government apprentice allowances.',
    location: '971, Sri Jayawardenepura Mawatha, Welikada, Rajagiriya',
    website: 'https://naita.gov.lk/',
    email: 'dg@naita.gov.lk',
    contactNumber: '+94 11 2863680',
    logo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    name: 'Ceylon-German Technical Training Institute',
    shortName: 'CGTTI',
    category: 'Engineering Training Institutes',
    description: 'Established in 1959 with German Federal Republic assistance, acclaimed as Sri Lanka’s premier automotive and precision engineering academy.',
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
    description: 'Government statutory youth development organization empowering youth through accredited technical, digital, and vocational training.',
    location: '65, Highlevel Road, Maharagama, Sri Lanka',
    website: 'https://www.nysc.lk/',
    email: 'info@nysc.lk',
    contactNumber: '+94 11 2850986',
    logo: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
];

// Master Course Generator linked dynamically to created Institution ObjectIds
const generateCourses = (instMap) => [
  // --- UoVT (NVQ Level 7 Degrees) ---
  {
    name: 'Bachelor of Technology in Software Technology',
    sinhalaName: 'මෘදුකාංග තාක්ෂණවේදී උපාධිය (B.Tech Software Technology)',
    institutionId: instMap['UoVT'],
    institutionName: 'University of Vocational Technology (UoVT)',
    qualificationType: 'Degree',
    studyField: 'Information Technology',
    duration: '3 Years (Full-time) / 4 Years (Part-time)',
    studyMode: ['Full-time', 'Part-time'],
    teachingLanguage: ['English'],
    overview: 'Full 4-year degree pathway designed for NVQ Level 5/6 holders and A/L Technology/Maths students focusing on enterprise software architecture, full-stack development, cloud systems, and AI.',
    fees: { totalFeeLKR: 0, registrationFeeLKR: 5000, scholarshipAvailable: true, scholarshipNote: 'Government subsidized free state university education' },
    entryRequirements: { olRequirement: { minimumPasses: 6 }, alRequirement: { stream: 'Technology / Physical Science', minimumPasses: 3, details: '3 passes in A/L or NVQ Level 5/6 Diploma in IT / Software' }, minimumAge: 18 },
    modules: [{ yearOrSemester: 'Year 1 & 2', subjects: ['Data Structures & Algorithms', 'Database Engineering', 'OOP in Java/C#', 'Web Systems Architecture'] }],
    skillsGained: ['Full-Stack Web & Mobile Engineering', 'Cloud DevOps', 'Database Optimization', 'Software QA Testing'],
    careerOpportunities: ['Software Engineer', 'Full-stack Developer', 'Systems Analyst', 'Cloud Engineer'],
    qualificationAwarded: 'Bachelor of Technology (NVQ Level 7)',
    nvqLevel: 'NVQ Level 7',
    awardingBody: 'University of Vocational Technology',
    accreditation: ['UGC Recognized', 'TVEC Accredited', 'NVQ Level 7'],
    isPopular: true,
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bachelor of Technology in Network Technology',
    sinhalaName: 'ජාල තාක්ෂණවේදී උපාධිය (B.Tech Network Technology)',
    institutionId: instMap['UoVT'],
    institutionName: 'University of Vocational Technology (UoVT)',
    qualificationType: 'Degree',
    studyField: 'Information Technology',
    duration: '3 Years (Full-time)',
    studyMode: ['Full-time'],
    teachingLanguage: ['English'],
    overview: 'Comprehensive NVQ Level 7 degree covering computer networking, cyber security, optical telecommunication, server infrastructure, and network virtualization.',
    fees: { totalFeeLKR: 0, registrationFeeLKR: 5000, scholarshipAvailable: true },
    entryRequirements: { alRequirement: { stream: 'Technology / Maths', minimumPasses: 3 }, previousQualifications: ['NVQ Level 5 Diploma in Network Administration'] },
    modules: [{ yearOrSemester: 'Year 1', subjects: ['Routing Protocols', 'Enterprise Switching', 'Linux Systems Administration', 'Information Security'] }],
    skillsGained: ['Cisco Routing & Switching', 'Firewall Configuration', 'Cloud Infrastructure', 'Cybersecurity Defense'],
    careerOpportunities: ['Network Engineer', 'Cyber Security Specialist', 'Systems Administrator'],
    qualificationAwarded: 'Bachelor of Technology (NVQ Level 7)',
    nvqLevel: 'NVQ Level 7',
    awardingBody: 'University of Vocational Technology',
    accreditation: ['UGC Recognized', 'TVEC Accredited'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bachelor of Technology in Mechatronics Technology',
    sinhalaName: 'මෙක්ට්‍රොනික්ස් තාක්ෂණවේදී උපාධිය',
    institutionId: instMap['UoVT'],
    institutionName: 'University of Vocational Technology (UoVT)',
    qualificationType: 'Degree',
    studyField: 'Engineering & Technology',
    duration: '3 Years (Full-time)',
    studyMode: ['Full-time'],
    teachingLanguage: ['English'],
    overview: 'Multidisciplinary engineering degree integrating mechanical systems, industrial electronics, robotics, PLC programming, and automated manufacturing systems.',
    fees: { totalFeeLKR: 0, registrationFeeLKR: 5000, scholarshipAvailable: true },
    entryRequirements: { alRequirement: { stream: 'Engineering Technology / Maths', minimumPasses: 3 } },
    skillsGained: ['PLC Programming & SCADA', 'Robotics Kinematics', 'Microcontroller Automation', 'CAD/CAM Modeling'],
    careerOpportunities: ['Mechatronics Engineer', 'Automation Specialist', 'Robotics Integrator'],
    qualificationAwarded: 'B.Tech in Mechatronics (NVQ Level 7)',
    nvqLevel: 'NVQ Level 7',
    awardingBody: 'University of Vocational Technology',
    accreditation: ['UGC Recognized', 'TVEC Accredited', 'NVQ Level 7'],
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  },

  // --- SLIATE (HND Programmes) ---
  {
    name: 'Higher National Diploma in Information Technology (HNDIT)',
    sinhalaName: 'තොරතුරු තාක්ෂණ උසස් ජාතික ඩිප්ලෝමාව (HNDIT)',
    institutionId: instMap['SLIATE'],
    institutionName: 'Sri Lanka Institute of Advanced Technological Education (SLIATE)',
    qualificationType: 'Higher Diploma',
    studyField: 'Information Technology',
    duration: '2.5 Years (Full-time including 6-Month In-Plant Training)',
    studyMode: ['Full-time', 'Part-time'],
    teachingLanguage: ['English'],
    overview: 'Nationwide recognised Higher National Diploma offering practical computing, software development, data science, networking, and a mandatory 6-month industrial internship.',
    fees: { totalFeeLKR: 0, registrationFeeLKR: 3000, scholarshipAvailable: true, scholarshipNote: 'Free government TVET education' },
    entryRequirements: { olRequirement: { minimumPasses: 6, english: 'Credit Pass', mathematics: 'Credit Pass' }, alRequirement: { stream: 'Any Stream', minimumPasses: 3 } },
    skillsGained: ['Software Development (C#, Java)', 'Web Design & React', 'SQL Database Design', 'Enterprise Internship Experience'],
    careerOpportunities: ['Associate Software Engineer', 'IT Executive', 'Web Developer', 'Database Administrator'],
    qualificationAwarded: 'Higher National Diploma in Information Technology',
    nvqLevel: 'NVQ Level 6 Equivalent',
    awardingBody: 'SLIATE / Ministry of Education',
    accreditation: ['TVEC Accredited', 'SLQF Level 4/5'],
    isPopular: true,
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Higher National Diploma in Accountancy (HNDA)',
    sinhalaName: 'ගණකාධිකරණ උසස් ජාතික ඩිප්ලෝමාව (HNDA)',
    institutionId: instMap['SLIATE'],
    institutionName: 'Sri Lanka Institute of Advanced Technological Education (SLIATE)',
    qualificationType: 'Higher Diploma',
    studyField: 'Accounting & Finance',
    duration: '4 Years (Full-time with 2-Year Practical Audit Training)',
    studyMode: ['Full-time', 'Part-time'],
    teachingLanguage: ['English'],
    overview: 'Premier national accounting qualification deemed equivalent to a B.Com degree by government circulars. Grants substantial exemptions in CA Sri Lanka, CIMA, and ACCA.',
    fees: { totalFeeLKR: 0, registrationFeeLKR: 3000, scholarshipAvailable: true },
    entryRequirements: { alRequirement: { stream: 'Commerce', minimumPasses: 3, details: 'Accountancy, Business Studies, Economics' } },
    skillsGained: ['Financial Accounting Standards (LKAS/IFRS)', 'Auditing & Assurance', 'Corporate Taxation', 'Cost & Management Accounting'],
    careerOpportunities: ['Accountant', 'Audit Supervisor', 'Financial Analyst', 'Tax Consultant'],
    qualificationAwarded: 'Higher National Diploma in Accountancy',
    nvqLevel: 'NVQ Level 6 Equivalent',
    awardingBody: 'SLIATE',
    accreditation: ['Public Service Commission Recognized (B.Com Equivalent)'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Higher National Diploma in English (HNDE)',
    sinhalaName: 'ඉංග්‍රීසි භාෂා උසස් ජාතික ඩිප්ලෝමාව (HNDE)',
    institutionId: instMap['SLIATE'],
    institutionName: 'Sri Lanka Institute of Advanced Technological Education (SLIATE)',
    qualificationType: 'Higher Diploma',
    studyField: 'Education & Teaching',
    duration: '2.5 Years (Full-time)',
    studyMode: ['Full-time'],
    teachingLanguage: ['English'],
    overview: 'Specialized diploma in English language teaching (ELT), linguistics, literature, and corporate communications.',
    fees: { totalFeeLKR: 0, registrationFeeLKR: 3000, scholarshipAvailable: true },
    entryRequirements: { olRequirement: { english: 'Credit or Distinction' }, alRequirement: { minimumPasses: 3 } },
    skillsGained: ['TESL / TEFL Methodology', 'Advanced Grammar & Linguistics', 'Corporate Presentation', 'Classroom Pedagogy'],
    careerOpportunities: ['English Teacher (State/International Schools)', 'Content Writer', 'Corporate Communications Executive'],
    qualificationAwarded: 'Higher National Diploma in English',
    awardingBody: 'SLIATE',
    accreditation: ['Ministry of Education Recognized'],
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
  },

  // --- DTET (Technical Colleges) ---
  {
    name: 'National Certificate in Technology (NCT) - Civil Engineering',
    sinhalaName: 'සිවිල් ඉංජිනේරු ජාතික තාක්ෂණ සහතිකය (NCT Civil)',
    institutionId: instMap['DTET'],
    institutionName: 'Department of Technical Education and Training (DTET)',
    qualificationType: 'Diploma',
    studyField: 'Engineering & Technology',
    duration: '3 Years (Part-time / Weekend)',
    studyMode: ['Part-time'],
    teachingLanguage: ['Sinhala', 'English'],
    overview: 'Renowned technical college programme training site supervisors, quantity surveyors, and technical officers in building construction and infrastructure.',
    fees: { totalFeeLKR: 18000, installmentAvailable: true },
    entryRequirements: { olRequirement: { minimumPasses: 6, mathematics: 'Credit Pass', science: 'Credit Pass' } },
    skillsGained: ['Surveying & Leveling', 'Reinforced Concrete Detailing', 'AutoCAD Drafting', 'Construction Estimation'],
    careerOpportunities: ['Civil Technical Officer (TO)', 'Site Supervisor', 'Assistant Quantity Surveyor'],
    qualificationAwarded: 'National Certificate in Technology (Civil)',
    nvqLevel: 'NVQ Level 5 Equivalent',
    awardingBody: 'Department of Technical Education and Training',
    accreditation: ['Government Technical Officer Cadre Eligible'],
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=800&auto=format&fit=crop&q=80',
  },

  // --- VTA (Vocational Training Authority) ---
  {
    name: 'Automobile Mechanic & Diagnostic Technician',
    sinhalaName: 'මෝටර් රථ කාර්මික හා දෝෂ විනිශ්චය පාඨමාලාව',
    institutionId: instMap['VTA'],
    institutionName: 'Vocational Training Authority of Sri Lanka (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Engineering & Technology',
    duration: '1 Year (Full-time)',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala'],
    overview: 'Complete automotive diagnosis and repair training including petrol and diesel engines, braking systems, OBD-II computerized scanning, and hybrid vehicle foundations.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true, scholarshipNote: 'Free government training with apprentice allowance' },
    entryRequirements: { olRequirement: { minimumPasses: 6 } },
    skillsGained: ['Engine Overhaul & Tuning', 'Computerized Diagnostic Scanner Usage', 'Transmission Maintenance', 'Auto Electrical Wiring'],
    careerOpportunities: ['Automobile Mechanic', 'Diagnostic Technician', 'Service Advisor'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4)',
    nvqLevel: 'NVQ Level 4',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    isPopular: true,
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Information Communication Technology (ICT) Technician',
    sinhalaName: 'තොරතුරු හා සන්නිවේදන තාක්ෂණ (ICT) කාර්මික ශිල්පී',
    institutionId: instMap['VTA'],
    institutionName: 'Vocational Training Authority of Sri Lanka (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Information Technology',
    duration: '1 Year (NVQ Level 4)',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala', 'English'],
    overview: 'Computer hardware assembly, operating systems configuration, LAN networking, graphics design, and office productivity software.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true },
    entryRequirements: { olRequirement: { minimumPasses: 6 } },
    skillsGained: ['PC Hardware & Diagnostics', 'LAN Cable Crimping & Routing', 'Photoshop & Office Tools'],
    careerOpportunities: ['ICT Technician', 'Hardware Support Specialist', 'Network Assistant'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4)',
    nvqLevel: 'NVQ Level 4',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Beautician & Hair Stylist',
    sinhalaName: 'රූපලාවණ්‍ය හා කොණ්ඩා මෝස්තර ශිල්පී',
    institutionId: instMap['VTA'],
    institutionName: 'Vocational Training Authority of Sri Lanka (VTA)',
    qualificationType: 'Certificate',
    studyField: 'Hospitality & Tourism',
    duration: '6 Months - 1 Year',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala'],
    overview: 'Haircutting, styling, skincare, bridal makeup, nail art, and salon customer care techniques.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true },
    entryRequirements: { olRequirement: { minimumPasses: 6 } },
    skillsGained: ['Hair Styling & Treatment', 'Facial & Skincare Therapies', 'Bridal Dressing'],
    careerOpportunities: ['Beautician', 'Hair Stylist', 'Salon Owner'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 3/4)',
    nvqLevel: 'NVQ Level 4',
    awardingBody: 'Vocational Training Authority / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
  },

  // --- NVTI (National Vocational Training Institutes) ---
  {
    name: 'Refrigeration and Air Conditioning Technician',
    sinhalaName: 'ශීතකරණ සහ වායුසමීකරණ කාර්මික ශිල්පී',
    institutionId: instMap['NVTI'],
    institutionName: 'National Vocational Training Institute (NVTI)',
    qualificationType: 'Certificate',
    studyField: 'Engineering & Technology',
    duration: '1 Year (Full-time)',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala'],
    overview: 'Comprehensive hands-on training in domestic and commercial refrigeration, inverter split-type air conditioners, refrigerant gas charging, leak detection, and electrical circuit diagnostics.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true },
    entryRequirements: { olRequirement: { minimumPasses: 6 } },
    skillsGained: ['Copper Pipe Brazing & Flaring', 'Gas Charging & Vacuuming', 'PCB Diagnostics', 'Inverter AC Installation'],
    careerOpportunities: ['HVAC Technician', 'AC Maintenance Specialist', 'Overseas Technical Contractor'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4)',
    nvqLevel: 'NVQ Level 4',
    awardingBody: 'NVTI / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
  },

  // --- NAITA (Apprenticeship Authority) ---
  {
    name: 'Automobile Mechanic (Dual Enterprise Apprenticeship)',
    sinhalaName: 'මෝටර් රථ යාන්ත්‍රික (NAITA ද්විත්ව ආධුනිකත්ව පුහුණුව)',
    institutionId: instMap['NAITA'],
    institutionName: 'National Apprentice and Industrial Training Authority (NAITA)',
    qualificationType: 'Certificate',
    studyField: 'Engineering & Technology',
    duration: '18 Months (Workplace Industrial Placement)',
    studyMode: ['Full-time', 'Physical'],
    teachingLanguage: ['Sinhala'],
    overview: 'Dual training model combining central basic workshop training with structured long-term industrial apprenticeship in authorized motor vehicle dealerships and workshops.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true, scholarshipNote: 'Government monthly apprentice allowance paid throughout training' },
    entryRequirements: { olRequirement: { minimumPasses: 6 }, minimumAge: 16 },
    skillsGained: ['Industrial Workshop Practice', 'Heavy & Light Vehicle Powertrain', 'Diagnostic Troubleshooting'],
    careerOpportunities: ['Automobile Technician', 'Fleet Maintenance Supervisor', 'Certified Craftsman'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4)',
    nvqLevel: 'NVQ Level 4',
    awardingBody: 'NAITA / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Welder & Fabrication Craftsman',
    sinhalaName: 'පෑස්සුම්කරු (SMAW, MIG, TIG Welding)',
    institutionId: instMap['NAITA'],
    institutionName: 'National Apprentice and Industrial Training Authority (NAITA)',
    qualificationType: 'Certificate',
    studyField: 'Engineering & Technology',
    duration: '9 Months (6-Month Workshop + 3-Month Industrial Apprenticeship)',
    studyMode: ['Full-time', 'Physical'],
    teachingLanguage: ['Sinhala'],
    overview: 'Advanced industrial welding covering Shielded Metal Arc Welding (SMAW), Gas Metal Arc (MIG), and Gas Tungsten Arc (TIG) welding to international structural codes.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true },
    entryRequirements: { olRequirement: { minimumPasses: 6 }, minimumAge: 16 },
    skillsGained: ['SMAW, MIG & TIG Welding', 'Pipe & Plate Welding 6G Position', 'Blueprint Reading'],
    careerOpportunities: ['Certified Welder', 'Fabrication Specialist', 'Marine & Offshore Welder'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 3 & 4)',
    nvqLevel: 'NVQ Level 4',
    awardingBody: 'NAITA / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  },

  // --- CGTTI (German Tech) ---
  {
    name: 'Automobile Engineering (Full-time German Apprenticeship)',
    sinhalaName: 'මෝටර් රථ ඉංජිනේරු විද්‍යාව (ජර්මන් ටෙක් පූර්ණකාලීන පාඨමාලාව)',
    institutionId: instMap['CGTTI'],
    institutionName: 'Ceylon-German Technical Training Institute (CGTTI)',
    qualificationType: 'Diploma',
    studyField: 'Engineering & Technology',
    duration: '3.5 Years (Full-time including Dual Industrial Apprenticeship)',
    studyMode: ['Full-time'],
    teachingLanguage: ['English', 'Sinhala'],
    overview: 'South Asia’s most respected automotive engineering diploma modelled on the German dual vocational training system. Covers precision mechanical engineering, advanced engine management, and automated transmissions.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true, scholarshipNote: 'Free government scholarship training' },
    entryRequirements: { olRequirement: { minimumPasses: 6, mathematics: 'Credit Pass', science: 'Credit Pass', english: 'Pass' }, details: 'Selection via competitive National Entrance Examination & Interview' },
    skillsGained: ['Precision Bench Fitting & Machining', 'Fuel Injection Calibration', 'Microprocessor Engine Control (ECU)', 'Chassis & Hydraulic Brake Engineering'],
    careerOpportunities: ['Automotive Engineer', 'Service Manager', 'Diagnostic Specialist', 'Senior Overseas Technical Officer'],
    qualificationAwarded: 'Special Engineering Apprenticeship Diploma (German Tech Certified)',
    nvqLevel: 'NVQ Level 5 Equivalent',
    awardingBody: 'CGTTI / TVEC',
    accreditation: ['German Chamber of Commerce / TVEC Accredited'],
    isPopular: true,
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
  },

  // --- NYSC (National Youth Services Council) ---
  {
    name: 'Computer Graphic Design & Digital Media Production',
    sinhalaName: 'පරිගණක ග්‍රැෆික් නිර්මාණකරණය සහ ඩිජිටල් මාධ්‍ය නිෂ්පාදනය',
    institutionId: instMap['NYSC'],
    institutionName: 'National Youth Services Council (NYSC)',
    qualificationType: 'Certificate',
    studyField: 'Design & Multimedia',
    duration: '1 Year (Full-time)',
    studyMode: ['Full-time'],
    teachingLanguage: ['Sinhala', 'English'],
    overview: 'Professional creative training in graphic design, digital illustration, brand identity creation, photo retouching, UI styling, and video post-production.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true },
    entryRequirements: { olRequirement: { minimumPasses: 6 } },
    skillsGained: ['Adobe Photoshop & Illustrator', 'Typography & Visual Layout', 'Video Editing & Motion Graphics', 'Print Production Standards'],
    careerOpportunities: ['Graphic Designer', 'UI Visual Artist', 'Digital Content Creator', 'Freelance Creative Designer'],
    qualificationAwarded: 'National Vocational Qualification (NVQ Level 4)',
    nvqLevel: 'NVQ Level 4',
    awardingBody: 'NYSC / TVEC',
    accreditation: ['TVEC Accredited', 'NVQ Level 4'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
  },

  // --- Academic & Professional Benchmark Qualifications ---
  {
    name: 'Bachelor of Medicine and Bachelor of Surgery (MBBS)',
    sinhalaName: 'වෛද්‍යවේදී සහ ශල්‍යවෛද්‍යවේදී උපාධිය (MBBS)',
    institutionId: instMap['UoVT'],
    institutionName: 'Faculty of Medicine, University of Colombo / State Medical Faculties',
    qualificationType: 'Degree',
    studyField: 'Medicine & Healthcare',
    duration: '5 Years + 1 Year Internship',
    studyMode: ['Full-time'],
    teachingLanguage: ['English'],
    overview: 'The primary qualification required to practice medicine in Sri Lanka, offering clinical rotations in medicine, surgery, obstetrics & gynecology, and pediatrics.',
    fees: { totalFeeLKR: 0, scholarshipAvailable: true, scholarshipNote: 'Free state university education based on G.C.E. A/L Z-Score' },
    entryRequirements: { alRequirement: { stream: 'Biological Science', minimumPasses: 3, details: 'Competitive Z-score in Biology, Chemistry, Physics' } },
    skillsGained: ['Clinical Diagnosis & Patient Examination', 'Surgical Assisting', 'Pharmacotherapy', 'Emergency Trauma Care'],
    careerOpportunities: ['Medical Doctor', 'Surgeon', 'Clinical Specialist', 'Hospital Medical Officer'],
    qualificationAwarded: 'MBBS Degree (SLQF Level 10)',
    nvqLevel: 'Degree Level',
    awardingBody: 'State Universities / Sri Lanka Medical Council (SLMC)',
    accreditation: ['SLMC Recognized', 'UGC Recognized'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chartered Accountant Qualification (ACA)',
    sinhalaName: 'වරලත් ගණකාධිකාරී වෘත්තීය සුදුසුකම (CA Sri Lanka)',
    institutionId: instMap['SLIATE'],
    institutionName: 'The Institute of Chartered Accountants of Sri Lanka (CA Sri Lanka)',
    qualificationType: 'Professional Qualification',
    studyField: 'Accounting & Finance',
    duration: '3 - 4 Years (With 3-Year Mandatory Practical Audit Training)',
    studyMode: ['Hybrid', 'Part-time'],
    teachingLanguage: ['English'],
    overview: 'Premier professional accounting qualification in Sri Lanka recognized across the Commonwealth and global accounting bodies with reciprocity through ICAEW and CPA Australia.',
    fees: { totalFeeLKR: 180000, installmentAvailable: true },
    entryRequirements: { alRequirement: { minimumPasses: 3, details: '3 passes in G.C.E. A/L or AAT/HNDA completion' } },
    skillsGained: ['International Financial Reporting (IFRS)', 'Forensic Auditing', 'Corporate Governance', 'Strategic Financial Management'],
    careerOpportunities: ['Chief Financial Officer (CFO)', 'Audit Partner', 'Senior Finance Manager', 'Management Consultant'],
    qualificationAwarded: 'Associate Chartered Accountant (ACA)',
    awardingBody: 'CA Sri Lanka',
    accreditation: ['Act of Parliament No. 23 of 1959', 'IFAC Member'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bachelor of Laws (LL.B)',
    sinhalaName: 'නීතිවේදී උපාධිය (LL.B)',
    institutionId: instMap['UoVT'],
    institutionName: 'Faculty of Law, University of Colombo / Open University of Sri Lanka',
    qualificationType: 'Degree',
    studyField: 'Law & Legal Studies',
    duration: '3 - 4 Years',
    studyMode: ['Full-time', 'Hybrid'],
    teachingLanguage: ['English', 'Bilingual'],
    overview: 'Comprehensive legal education covering constitutional law, Roman-Dutch law, criminal law, commercial jurisprudence, human rights, and advocacy.',
    fees: { totalFeeLKR: 0, registrationFeeLKR: 5000, scholarshipAvailable: true },
    entryRequirements: { alRequirement: { stream: 'Any Stream with high Z-score or OUSL Selection Test' } },
    skillsGained: ['Legal Research & Drafting', 'Courtroom Advocacy', 'Contract Negotiation', 'Constitutional Analysis'],
    careerOpportunities: ['Attorney-at-Law (Supreme Court of Sri Lanka)', 'Legal Officer', 'Corporate Counsel', 'State Counsel'],
    qualificationAwarded: 'Bachelor of Laws (LL.B)',
    awardingBody: 'University of Colombo / Sri Lanka Law College',
    accreditation: ['UGC Recognized', 'Council of Legal Education'],
    isPopular: true,
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
  },
];

async function seedMasterData() {
  try {
    console.log('========================================================');
    console.log('🌱 STARTING MASTER MONGODB ATLAS DATABASE SYNCHRONIZATION');
    console.log('========================================================');

    await connectDB();

    // 1. Seed or Update Admin Account
    console.log('\n[1/3] Upserting Primary Administrator Account...');
    const adminEmail = (process.env.ADMIN_SEED_EMAIL || 'admin@.lk').toLowerCase();
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin12';
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(adminPassword, salt);

    let admin = await AdminUser.findOne({ email: adminEmail });
    if (admin) {
      admin.name = 'EduPath Chief Administrator';
      admin.passwordHash = passwordHash;
      admin.salt = salt;
      admin.role = 'ADMIN';
      admin.isActive = true;
      await admin.save();
      console.log(`✅ Administrator account updated: ${adminEmail} (Role: ADMIN)`);
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
      console.log(`✅ New Administrator account created: ${adminEmail} (Role: ADMIN)`);
    }

    // 2. Seed 8 Statutory Government Institutions
    console.log('\n[2/3] Synchronizing 8 Statutory Government Institutions...');
    // Delete any old or non-statutory institutions (e.g. IET, OCU)
    await Institution.deleteMany({});
    const insertedInstitutions = await Institution.insertMany(STATUTORY_INSTITUTIONS);
    console.log(`✅ Saved ${insertedInstitutions.length} Statutory Government Institutions to MongoDB Atlas:`);

    const instMap = {};
    insertedInstitutions.forEach((inst) => {
      instMap[inst.shortName] = inst._id;
      console.log(`   - [${inst.shortName}] ${inst.name} (${inst.category})`);
    });

    // 3. Seed Verified Courses for All 8 Institutions
    console.log('\n[3/3] Synchronizing Verified Courses for All Institutions...');
    await Course.deleteMany({});
    const coursesToInsert = generateCourses(instMap);
    const insertedCourses = await Course.insertMany(coursesToInsert);
    console.log(`✅ Successfully seeded ${insertedCourses.length} verified courses into MongoDB Atlas!`);

    console.log('\n========================================================');
    console.log('🎉 MONGODB ATLAS SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`📊 Summary:`);
    console.log(`   - Admin: ${adminEmail}`);
    console.log(`   - Institutions: ${insertedInstitutions.length}`);
    console.log(`   - Courses: ${insertedCourses.length}`);
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedMasterData();
