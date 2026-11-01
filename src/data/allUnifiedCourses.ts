import { Course, QualificationLevel, StudyField } from '../types';
import { VTA_VERIFIED_COURSES } from './vtaData';
import { UOVT_VERIFIED_PROGRAMMES } from './uovtData';
import { SLIATE_VERIFIED_PROGRAMMES } from './sliateData';
import { DTET_VERIFIED_COURSES } from './dtetData';
import { NVTI_VERIFIED_COURSES } from './nvtiData';
import { CGTTI_VERIFIED_COURSES } from './cgttiData';
import { NYSC_VERIFIED_COURSES } from './nyscData';
import { NAITA_VERIFIED_COURSES } from './naitaData';

function mapStudyField(category?: string): StudyField {
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

function mapQualificationType(nvqLevel?: string, name?: string, qualType?: string): QualificationLevel {
  if (qualType) {
    if (qualType === 'Apprenticeship') return 'Certificate';
    if (['Certificate', 'Foundation', 'Diploma', 'Higher Diploma', 'Degree'].includes(qualType)) {
      return qualType as QualificationLevel;
    }
  }
  const n = (name || '').toLowerCase();
  const nvq = (nvqLevel || '').toLowerCase();
  if (n.includes('bachelor') || n.includes('b.tech') || n.includes('degree') || nvq.includes('level 7')) return 'Degree';
  if (n.includes('hnd') || n.includes('higher national diploma') || n.includes('higher diploma')) return 'Higher Diploma';
  if (n.includes('diploma') || nvq.includes('level 5') || nvq.includes('level 6')) return 'Diploma';
  return 'Certificate';
}

export const cleanImageUrl = (rawUrl?: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!url) return '';

  // Extract real direct image URL if user pasted a Google Search Redirect link
  if (url.includes('google.') && (url.includes('imgurl=') || url.includes('url='))) {
    try {
      const match = url.match(/[?&](?:imgurl|url)=([^&]+)/i);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
          url = decoded;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return url;
};

// 1. VTA Courses
const vtaCourses: Course[] = VTA_VERIFIED_COURSES.map((c) => ({
  id: c.id,
  name: c.name,
  sinhalaName: c.sinhalaName,
  institutionId: 'gov-inst-3',
  institutionName: 'Vocational Training Authority of Sri Lanka (VTA)',
  institutionLogo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80',
  qualificationType: mapQualificationType(c.nvqLevel, c.name),
  studyField: mapStudyField(c.category),
  duration: c.duration || '6 Months - 1 Year',
  studyMode: ['Full-time', 'Physical'],
  teachingLanguage: ['Sinhala', 'English'],
  overview: c.description || `${c.name} offered by VTA.`,
  sinhalaOverview: c.description,
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
  intakeMonths: ['January', 'July'],
  applicationDeadline: 'Continuous',
  officialApplyLink: 'https://www.vtasl.gov.lk',
  officialWebsite: 'https://www.vtasl.gov.lk',
  lastVerifiedDate: 'November 2026',
  coverImage: c.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  isPopular: true,
}));

// 2. UoVT Courses
const uovtCourses: Course[] = UOVT_VERIFIED_PROGRAMMES.map((c) => ({
  id: c.id,
  name: c.name,
  sinhalaName: c.sinhalaName,
  institutionId: 'gov-inst-1',
  institutionName: 'University of Vocational Technology (UoVT)',
  institutionLogo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80',
  qualificationType: 'Degree',
  studyField: mapStudyField(c.subjectCategory),
  duration: c.duration || '3 - 4 Years',
  studyMode: ['Full-time', 'Part-time'],
  teachingLanguage: ['English'],
  overview: c.description || `${c.name} offered by UoVT.`,
  sinhalaOverview: c.description,
  fees: { totalFeeLKR: 0, registrationFeeLKR: 5000, installmentAvailable: false, scholarshipAvailable: true, scholarshipNote: 'Government subsidized free university education' },
  entryRequirements: { olRequirement: { details: 'G.C.E. O/L with 6 passes' }, alRequirement: { details: '3 passes in G.C.E. A/L or NVQ Level 5/6 Diploma' } },
  modules: [{ yearOrSemester: 'Undergraduate Curriculum', subjects: ['Foundation & Engineering Practice', 'Advanced Technologies', 'Final Year Industry Project'] }],
  skillsGained: ['Advanced Technical Competence', 'Engineering Design', 'Research & Innovation'],
  careerOpportunities: ['Professional Engineer', 'Technologist', 'Project Lead'],
  qualificationAwarded: 'Bachelor of Technology (NVQ Level 7)',
  nvqLevel: 'NVQ Level 7',
  district: 'Kandawala, Ratmalana',
  awardingBody: 'University of Vocational Technology',
  accreditation: ['UGC Recognized', 'TVEC Accredited', 'NVQ Level 7'],
  intakeMonths: ['February', 'October'],
  applicationDeadline: 'Annual Gazette Call',
  officialApplyLink: 'https://uovt.ac.lk',
  officialWebsite: 'https://uovt.ac.lk',
  lastVerifiedDate: 'November 2026',
  coverImage: c.coverImage || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
  isPopular: true,
  isFeatured: true,
}));

// 3. SLIATE Courses
const sliateCourses: Course[] = SLIATE_VERIFIED_PROGRAMMES.map((c: any) => ({
  id: c.id,
  name: c.name,
  sinhalaName: c.sinhalaName,
  institutionId: 'gov-inst-2',
  institutionName: 'Sri Lanka Institute of Advanced Technological Education (SLIATE)',
  institutionLogo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
  qualificationType: 'Higher Diploma',
  studyField: mapStudyField(c.category),
  duration: c.duration || '2.5 - 3.5 Years',
  studyMode: ['Full-time', 'Part-time'],
  teachingLanguage: ['English'],
  overview: c.description || `${c.name} (SLIATE Higher National Diploma).`,
  sinhalaOverview: c.description,
  fees: { totalFeeLKR: 0, registrationFeeLKR: 3000, installmentAvailable: false, scholarshipAvailable: true, scholarshipNote: 'Free government higher diploma with Mahapola eligibility' },
  entryRequirements: { olRequirement: { details: 'G.C.E. O/L with credit passes in English & Maths' }, alRequirement: { details: c.entryRequirements || 'G.C.E. A/L passes in relevant stream' } },
  modules: [{ yearOrSemester: 'Academic & In-Plant Training', subjects: ['Core Curriculum', 'Industry Practical Placement', 'Comprehensive Project'] }],
  skillsGained: ['Applied Professional Knowledge', 'Industry Computing', 'Technical Leadership'],
  careerOpportunities: ['Assistant Engineer', 'IT Executive', 'Accountant', 'Project Specialist'],
  qualificationAwarded: `Higher National Diploma (${c.code || 'HND'})`,
  nvqLevel: 'NVQ Level 6',
  district: 'Islandwide (19 ATIs)',
  awardingBody: 'SLIATE (Ministry of Higher Education)',
  accreditation: ['Ministry of Education Approved', 'TVEC NVQ Level 6 Equivalent'],
  intakeMonths: ['January'],
  applicationDeadline: 'Annual Gazette',
  officialApplyLink: 'https://sliate.ac.lk',
  officialWebsite: 'https://sliate.ac.lk',
  lastVerifiedDate: 'November 2026',
  coverImage: c.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
  isPopular: true,
  isFeatured: true,
}));

// 4. DTET Courses
const dtetCourses: Course[] = DTET_VERIFIED_COURSES.map((c) => ({
  id: c.id,
  name: c.name,
  sinhalaName: c.sinhalaName,
  institutionId: 'gov-inst-4',
  institutionName: 'Department of Technical Education and Training (DTET)',
  institutionLogo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&auto=format&fit=crop&q=80',
  qualificationType: mapQualificationType(c.nvqLevel, c.name),
  studyField: mapStudyField(c.category),
  duration: c.duration || '1 - 2 Years',
  studyMode: ['Full-time', 'Physical'],
  teachingLanguage: ['Sinhala', 'English'],
  overview: c.description || `${c.name} offered by DTET Technical Colleges.`,
  sinhalaOverview: c.description,
  fees: { totalFeeLKR: 0, registrationFeeLKR: 1500, installmentAvailable: false, scholarshipAvailable: true, scholarshipNote: 'Tuition-free technical education under DTET' },
  entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L with passes in Maths & Science' } },
  modules: [{ yearOrSemester: 'Year 1 & 2', subjects: ['Engineering Theory', 'Machine Shop Practice', 'Technical Drawing'] }],
  skillsGained: ['Precision Engineering', 'Industrial Machine Operation', 'Electrical/Mechanical Troubleshooting'],
  careerOpportunities: ['Junior Technical Officer (JTO)', 'Technical Supervisor', 'Engineering Assistant'],
  qualificationAwarded: `National Certificate / Diploma (${c.nvqLevel})`,
  nvqLevel: c.nvqLevel,
  district: 'Islandwide (39 Technical Colleges)',
  awardingBody: 'Department of Technical Education & Training / TVEC',
  accreditation: ['DTET Government Gazette Approved', 'TVEC Accredited', c.nvqLevel],
  intakeMonths: ['January'],
  applicationDeadline: 'Annual Gazette',
  officialApplyLink: 'http://www.dtet.gov.lk',
  officialWebsite: 'http://www.dtet.gov.lk',
  lastVerifiedDate: 'November 2026',
  coverImage: c.coverImage || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  isPopular: true,
}));

// 5. NVTI Courses
const nvtiCourses: Course[] = NVTI_VERIFIED_COURSES.map((c: any) => ({
  id: c.id,
  name: c.name,
  sinhalaName: c.sinhalaName,
  institutionId: 'gov-inst-5',
  institutionName: 'National Vocational Training Institutes (NVTI)',
  institutionLogo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80',
  qualificationType: mapQualificationType(c.nvqLevel, c.name),
  studyField: mapStudyField(c.category),
  duration: c.duration || '1 - 2 Years',
  studyMode: ['Full-time', 'Physical'],
  teachingLanguage: ['Sinhala', 'English'],
  overview: c.description || `${c.name} offered by NVTI.`,
  sinhalaOverview: c.description,
  fees: { totalFeeLKR: 0, registrationFeeLKR: 2000, installmentAvailable: false, scholarshipAvailable: true, scholarshipNote: 'Government subsidized vocational training' },
  entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L completed' } },
  modules: [{ yearOrSemester: 'Technical Course', subjects: ['Classroom Modules', 'Practical Lab Competency', 'Industrial Attachment'] }],
  skillsGained: ['Technical Craftsmanship', 'Safety Standards', 'Operational Maintenance'],
  careerOpportunities: ['Certified Technician', 'Industrial Operator', 'Service Specialist'],
  qualificationAwarded: `National Vocational Qualification (${c.nvqLevel})`,
  nvqLevel: c.nvqLevel,
  district: c.district || 'Islandwide NVTI Campuses',
  awardingBody: 'NVTI / VTA / TVEC',
  accreditation: ['TVEC Accredited', c.nvqLevel],
  intakeMonths: ['January', 'July'],
  applicationDeadline: 'Continuous',
  officialApplyLink: 'https://www.vtasl.gov.lk',
  officialWebsite: 'https://www.vtasl.gov.lk',
  lastVerifiedDate: 'November 2026',
  coverImage: c.coverImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
  isPopular: true,
}));

// 6. CGTTI (German Tech) Courses
const cgttiCourses: Course[] = CGTTI_VERIFIED_COURSES.map((c) => ({
  id: c.id,
  name: c.name,
  sinhalaName: c.sinhalaName,
  institutionId: 'gov-inst-6',
  institutionName: 'Ceylon-German Technical Training Institute (CGTTI - German Tech)',
  institutionLogo: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&auto=format&fit=crop&q=80',
  qualificationType: mapQualificationType(c.nvqLevel, c.name),
  studyField: 'Engineering & Technology',
  duration: c.duration || '3.5 Years',
  studyMode: ['Full-time', 'Physical'],
  teachingLanguage: ['English', 'Sinhala'],
  overview: c.description || `${c.name} offered by German Tech (CGTTI).`,
  sinhalaOverview: c.description,
  fees: { totalFeeLKR: 0, registrationFeeLKR: 10000, installmentAvailable: false, scholarshipAvailable: true, scholarshipNote: 'Full government subsidized German technical training' },
  entryRequirements: { olRequirement: { details: c.entryRequirements || 'G.C.E. O/L with 6 passes including Credit in Mathematics & Science, Competitive Entrance Exam' } },
  modules: [{ yearOrSemester: 'German Tech Dual Apprenticeship', subjects: ['Precision Tool Practice', 'Automotive Systems', '1-Year Industrial In-Plant Training'] }],
  skillsGained: ['Precision Engineering', 'Engine Diagnostics', 'Electronic Fuel Injection', 'Hydraulics'],
  careerOpportunities: ['Automobile Engineer', 'Quality Inspector', 'Senior Diagnostic Specialist'],
  qualificationAwarded: `CGTTI Special Craftsman Diploma (${c.nvqLevel})`,
  nvqLevel: c.nvqLevel,
  district: 'Mount Lavinia, Colombo',
  awardingBody: 'Ceylon-German Technical Training Institute',
  accreditation: ['German Tech Certified', 'TVEC Accredited', c.nvqLevel],
  intakeMonths: ['January'],
  applicationDeadline: 'Competitive Entrance Exam Gazette',
  officialApplyLink: 'https://www.cgtti.lk',
  officialWebsite: 'https://www.cgtti.lk',
  lastVerifiedDate: 'November 2026',
  coverImage: c.coverImage || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
  isPopular: true,
  isFeatured: true,
}));

// 7. NYSC Courses
const nyscCourses: Course[] = NYSC_VERIFIED_COURSES.map((c: any) => ({
  id: c.id,
  name: c.name,
  sinhalaName: c.sinhalaName,
  institutionId: 'gov-inst-8',
  institutionName: 'National Youth Services Council (NYSC)',
  institutionLogo: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=150&auto=format&fit=crop&q=80',
  qualificationType: mapQualificationType(c.nvqLevel, c.name),
  studyField: mapStudyField(c.category),
  duration: c.duration || '6 Months - 1 Year',
  studyMode: ['Full-time', 'Physical'],
  teachingLanguage: ['Sinhala', 'English'],
  overview: c.description || `${c.name} youth development program under NYSC.`,
  sinhalaOverview: c.description,
  fees: { totalFeeLKR: 0, registrationFeeLKR: 1000, installmentAvailable: false, scholarshipAvailable: true, scholarshipNote: 'Subsidized youth empowerment training' },
  entryRequirements: { olRequirement: { details: c.entryRequirements || 'Age 15 - 29 years, G.C.E. O/L' } },
  modules: [{ yearOrSemester: 'Youth Training Phase', subjects: ['Practical Skills Training', 'Soft Skills & Leadership', 'Industry Exposure'] }],
  skillsGained: ['Creative & Digital Skills', 'Leadership Competency', 'Youth Employability'],
  careerOpportunities: ['Digital Designer', 'Media Assistant', 'Youth Enterprise Leader'],
  qualificationAwarded: `NYSC National Vocational Certificate (${c.nvqLevel})`,
  nvqLevel: c.nvqLevel,
  district: c.district || 'Maharagama & Islandwide NYSC Centres',
  awardingBody: 'National Youth Services Council',
  accreditation: ['Ministry of Youth Affairs', 'TVEC Accredited', c.nvqLevel],
  intakeMonths: ['January', 'July'],
  applicationDeadline: 'Continuous',
  officialApplyLink: 'https://www.nysc.lk',
  officialWebsite: 'https://www.nysc.lk',
  lastVerifiedDate: 'November 2026',
  coverImage: c.coverImage || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
  isPopular: true,
}));

// 8. NAITA Courses
const naitaCourses: Course[] = NAITA_VERIFIED_COURSES.map((n) => ({
  id: n.id,
  name: n.name,
  sinhalaName: n.sinhalaName,
  institutionId: 'gov-inst-7',
  institutionName: 'National Apprentice and Industrial Training Authority (NAITA)',
  institutionLogo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop&q=80',
  qualificationType: n.qualificationType === 'Apprenticeship' ? 'Certificate' : (n.qualificationType as any),
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
    scholarshipNote: 'State apprentice allowance provided',
  },
  entryRequirements: { olRequirement: { details: n.entryRequirements || 'G.C.E. O/L completed' } },
  modules: n.modules ? n.modules.map((m) => ({ yearOrSemester: m.title, subjects: m.subjects })) : [{ yearOrSemester: 'Dual Apprenticeship', subjects: ['Workshop Practice', 'Industrial OJT'] }],
  skillsGained: n.features || ['Practical Enterprise Hands-on Skills'],
  careerOpportunities: ['Certified Craftsman', 'Industrial Technician', 'Apprentice Graduate'],
  qualificationAwarded: `National Vocational Qualification (${n.nvqLevel})`,
  nvqLevel: n.nvqLevel,
  district: n.district || 'Islandwide (25 District Offices)',
  awardingBody: 'NAITA / TVEC',
  accreditation: ['TVEC Accredited', n.nvqLevel],
  intakeMonths: ['January', 'July'],
  applicationDeadline: 'Continuous / Annual Gazette',
  officialApplyLink: n.officialSourceUrl,
  officialWebsite: 'https://naita.gov.lk',
  lastVerifiedDate: n.verificationDate || 'November 2026',
  coverImage: n.coverImage || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80',
  isPopular: true,
}));

// All 134 verified courses across all 8 government institutions unified into a single master collection
export const ALL_VERIFIED_UNIFIED_COURSES: Course[] = [
  ...vtaCourses,
  ...uovtCourses,
  ...sliateCourses,
  ...dtetCourses,
  ...nvtiCourses,
  ...cgttiCourses,
  ...nyscCourses,
  ...naitaCourses,
];
