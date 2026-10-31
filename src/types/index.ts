export type StudyMode = 'Full-time' | 'Part-time' | 'Online' | 'Hybrid' | 'Physical';

export type QualificationLevel =
  | 'O/L'
  | 'A/L'
  | 'Certificate'
  | 'Foundation'
  | 'Diploma'
  | 'Higher Diploma'
  | 'HND'
  | 'Degree'
  | 'Top-up Degree'
  | 'Postgraduate Diploma'
  | 'Master\'s'
  | 'PhD'
  | 'Professional Qualification'
  | 'Short Course';

export type StudyField =
  | 'Information Technology'
  | 'Medicine & Healthcare'
  | 'Business & Management'
  | 'Engineering & Technology'
  | 'Law & Legal Studies'
  | 'Accounting & Finance'
  | 'Design & Multimedia'
  | 'Science & Biotechnology'
  | 'Education & Teaching'
  | 'Hospitality & Tourism';

export interface EntryRequirement {
  olRequirement?: {
    english?: string;
    mathematics?: string;
    science?: string;
    minimumPasses?: number;
    details?: string;
  };
  alRequirement?: {
    stream?: 'Maths' | 'Science' | 'Commerce' | 'Arts' | 'Technology' | 'Any';
    minimumPasses?: number;
    details?: string;
  };
  previousQualifications?: string[];
  minimumAge?: number;
  workExperienceYears?: number;
  otherNotes?: string;
}

export interface CourseFee {
  totalFeeLKR: number;
  totalFeeUSD?: number;
  registrationFeeLKR?: number;
  installmentAvailable: boolean;
  installmentDetails?: string;
  scholarshipAvailable: boolean;
  scholarshipNote?: string;
}

export type GovernmentInstitutionCategory =
  | 'Vocational Universities'
  | 'Advanced Technological Institutes'
  | 'Technical Colleges'
  | 'Vocational Training Centres'
  | 'Apprenticeship Institutes'
  | 'Engineering Training Institutes'
  | 'Youth Training Institutes';

// VTA Specific Types
export type VTACategoryName =
  | 'Automobile Repair and Maintenance'
  | 'Building and Construction'
  | 'Electrical, Electronic and Telecommunication'
  | 'Food Technology'
  | 'Health and Social Work'
  | 'Hotel and Tourism'
  | 'Information Communication and Multimedia Technology'
  | 'Salon / Hair and Beauty';

export type VTANVQLevel =
  | 'All Levels'
  | 'NVQ Level 3'
  | 'NVQ Level 4'
  | 'NVQ Level 5'
  | 'NVQ Level 6'
  | 'NVQ Level 7';

export interface VTACategory {
  id: string;
  name: VTACategoryName;
  nameSi?: string;
  description: string;
  iconName: string;
  imageUrl: string;
  isProjectSpecific?: boolean;
}

export type VTAQualificationType =
  | 'Certificate'
  | 'Diploma'
  | 'HND'
  | 'Degree'
  | 'Apprenticeship'
  | 'Other Training';

export interface VTALevelDetail {
  level: string;
  duration: string;
  qualificationType: string;
  entryRequirements: string;
  modules?: string[];
}

export interface VTACourse {
  id: string;
  code?: string;
  name: string;
  sinhalaName?: string;
  category: VTACategoryName;
  institutionName?: string;
  qualificationType?: VTAQualificationType;
  nvqLevel: string;
  supportedLevels?: string[];
  levelDetails?: Record<string, VTALevelDetail>;
  duration?: string;
  trainingCentre?: string;
  district?: string;
  availableDistricts?: string[];
  studyMode?: 'Full-time' | 'Part-time' | 'Weekend' | 'Apprenticeship' | 'Dual Training';
  coverImage?: string;
  description?: string;
  entryRequirements?: string;
  courseFee?: string;
  isFree?: boolean;
  features?: string[];
  officialSourceUrl?: string;
  lastVerifiedAt?: string;
}

// NAITA Specific Types
export type NAITAQualificationFilter =
  | 'All Qualifications'
  | 'Apprenticeship'
  | 'Certificate'
  | 'Diploma'
  | 'HND'
  | 'Degree'
  | 'Other Training';

export type NAITANVQFilter =
  | 'All Levels'
  | 'NVQ Level 3'
  | 'NVQ Level 4'
  | 'NVQ Level 5'
  | 'NVQ Level 6'
  | 'NVQ Level 7'
  | 'Non-NVQ';

export type NAITAProviderFilter =
  | 'All Providers'
  | 'Direct NAITA (District Network)'
  | 'AETI (Automobile Institute)'
  | 'IETI (Industrial Institute)';

export interface NAITACourse {
  id: string;
  code?: string;
  name: string;
  sinhalaName?: string;
  category: string;
  categorySinhala?: string;
  qualificationType: 'Apprenticeship' | 'Certificate' | 'Diploma' | 'Other Training';
  nvqLevel: 'NVQ Level 3' | 'NVQ Level 4' | 'NVQ Level 5' | 'NVQ Level 6' | 'NVQ Level 3 & 4' | 'Non-NVQ';
  duration: string;
  nvq3Duration?: string;
  nvq4Duration?: string;
  providerType: 'Direct NAITA (District Network)' | 'AETI (Automobile Institute)' | 'IETI (Industrial Institute)';
  trainingCentre: string;
  district: string;
  availableDistricts?: string[];
  studyMode: 'Enterprise-Based (Apprenticeship)' | 'Institutional + OJT' | 'Full-time' | 'Part-time';
  coverImage?: string;
  description: string;
  entryRequirements: string;
  courseFee: string;
  registrationFee?: string;
  features: string[];
  modules?: { title: string; subjects: string[] }[];
  officialSourceUrl: string;
  verificationDate: string;
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  category: GovernmentInstitutionCategory;
  // Prepared fields ready for future data inputs:
  description?: string;
  location?: string;
  branches?: string[];
  website?: string;
  email?: string;
  contactNumber?: string;
  qualificationLevels?: string[];
  nvqLevels?: string[];
  availableCourses?: string[];
  courseFees?: string;
  courseDurations?: string;
  applicationDetails?: string;
  isVerified: boolean;
  logo?: string;
  city?: string;
  country?: string;
}

export interface CourseModule {
  yearOrSemester: string;
  subjects: string[];
}

export interface Course {
  id: string;
  name: string;
  sinhalaName?: string;
  institutionId: string;
  institutionName: string;
  institutionLogo?: string;
  qualificationType: QualificationLevel;
  studyField: StudyField;
  duration: string;
  studyMode: StudyMode[];
  teachingLanguage: ('English' | 'Sinhala' | 'Bilingual')[];
  overview: string;
  sinhalaOverview?: string;
  fees: CourseFee;
  entryRequirements: EntryRequirement;
  modules: CourseModule[];
  skillsGained: string[];
  careerOpportunities: string[];
  qualificationAwarded: string;
  nvqLevel?: string;
  district?: string;
  awardingBody: string;
  accreditation: string[];
  intakeMonths: string[];
  applicationDeadline: string;
  officialApplyLink: string;
  officialWebsite: string;
  lastVerifiedDate: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  coverImage: string;
  rating?: number;
}

export type EligibilityStatus =
  | 'Eligible'
  | 'More Information Needed'
  | 'Additional Qualifications Required'
  | 'Future Pathway';

export interface EligibilityEvaluation {
  status: EligibilityStatus;
  statusSinhala: string;
  matchScore: number; // 0 to 100
  summary: string;
  summarySinhala: string;
  metRequirements: string[];
  missingRequirements: string[];
  recommendedSteps: string[];
  disclaimer: string;
}

export interface CareerMilestone {
  stepNumber: number;
  title: string;
  titleSinhala: string;
  qualificationLevel: QualificationLevel;
  durationApprox: string;
  description: string;
  descriptionSinhala: string;
  alternativeRoute?: string;
  sampleCourses: string[];
}

export interface CareerPathway {
  id: string;
  careerTitle: string;
  careerTitleSinhala: string;
  field: StudyField;
  overview: string;
  overviewSinhala: string;
  estimatedTotalYears: string;
  startingQualification: string;
  finalDesignation: string;
  averageStartingSalaryLKR?: string;
  milestones: CareerMilestone[];
  alternativePathsSummary?: string;
  sampleJobTitles: string[];
}

export interface UserQualificationInput {
  hasOL: boolean;
  olMathsGrade?: string;
  olEnglishGrade?: string;
  olPassCount?: number;
  hasAL: boolean;
  alStream?: string;
  alPassCount?: number;
  higherQualifications: QualificationLevel[];
  workExperienceYears: number;
  interests: StudyField[];
  targetCareerOrGoal?: string;
  preferredMode?: StudyMode;
  budgetMaxLKR?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  suggestedCourses?: Course[];
  suggestedPathways?: CareerPathway[];
  quickActions?: {
    label: string;
    actionType: 'find_courses' | 'check_qualifications' | 'explore_pathways' | 'compare_courses' | 'custom_prompt';
    payload?: string;
  }[];
}

export type LanguageCode = 'en' | 'si';

// =========================================================================
// UoVT / UNIVOTEC Specific Types
// =========================================================================

export type UoVTFaculty =
  | 'Faculty of Information Technology'
  | 'Faculty of Engineering Technology'
  | 'Faculty of Industrial Technology'
  | 'Faculty of Education';

export type UoVTSubjectCategory =
  | 'Information Technology'
  | 'Engineering Technology'
  | 'Construction & Civil Technology'
  | 'Industrial & Management Technology'
  | 'Food Technology & Agriculture'
  | 'Hotel, Tourism & Event Management'
  | 'Media, Creative & Film Technology'
  | 'Education & Pedagogy';

export type UoVTQualificationType =
  | 'Bachelor\'s Degree'
  | 'Honours Degree'
  | 'Higher National Diploma (HND)'
  | 'Diploma'
  | 'Entry Pathway';

export type UoVTNVQLevel =
  | 'All Levels'
  | 'NVQ Level 5'
  | 'NVQ Level 6'
  | 'NVQ Level 7 / Degree'
  | 'NVQ Level 4 (Entry Requirement)'
  | 'NVQ Level 3 (Entry Requirement)'
  | 'NVQ Level 1 - 2 (Foundation)';

export type UoVTDeliveryLocation =
  | 'Main Campus (Ratmalana)'
  | 'University College of Batangala'
  | 'University College of Kuliyapitiya'
  | 'University College of Matara'
  | 'University College of Ratmalana'
  | 'University College of Jaffna'
  | 'University College of Anuradhapura';

export interface UoVTLevelDetail {
  level: string;
  qualificationAwarded: string;
  duration: string;
  awardingBody: string;
  deliveryLocation: string;
  entryRequirements: string;
  modules?: string[];
  courseFee?: string;
  isFree?: boolean;
}

export interface UoVTProgramme {
  id: string;
  code?: string;
  name: string;
  sinhalaName?: string;
  subjectCategory: UoVTSubjectCategory;
  faculty: UoVTFaculty;
  qualificationAwarded: string;
  qualificationType: UoVTQualificationType;
  nvqLevel: string; // e.g., 'NVQ Level 7', 'NVQ Level 5 & 6', 'NVQ Level 7 / Degree'
  degreeType?: 'General Degree (3 Years)' | 'Honours Degree (4 Years)' | 'HND / Diploma';
  supportedLevels?: string[]; // e.g. ['NVQ Level 5', 'NVQ Level 6', 'NVQ Level 7 / Degree']
  levelDetails?: Record<string, UoVTLevelDetail>;
  duration: string;
  academicDuration?: string;
  industrialTrainingDuration?: string;
  studyMode: 'Weekday (Full-time)' | 'Weekend (Part-time)' | 'Both Weekday & Weekend';
  campus: 'Main Campus (Ratmalana)' | 'Affiliated University Colleges' | 'Both Main & University Colleges';
  universityColleges?: string[];
  courseFee: string;
  registrationFee?: string;
  isFree: boolean;
  entryRequirements: string;
  acceptedPriorQualifications: string[];
  description: string;
  features?: string[];
  curriculum?: string[];
  careerOpportunities?: string[];
  coverImage?: string;
  officialSourceUrl: string;
  applicationUrl: string;
  lastVerifiedAt: string;
}

export interface UoVTSubjectCategoryData {
  id: string;
  name: UoVTSubjectCategory;
  nameSi?: string;
  description: string;
  iconName: string;
  imageUrl: string;
  faculty: UoVTFaculty;
}

export interface UniversityCollegeProfile {
  id: string;
  name: string;
  shortName: string;
  nameSi: string;
  location: string;
  district: string;
  province: string;
  establishedAct: string;
  programmesCount: number;
  availableProgrammes: string[];
  qualificationLevels: string[];
  websiteUrl: string;
  description: string;
}

// =========================================================================
// SLIATE Specific Types
// =========================================================================
export type SLIATECategoryName =
  | 'Information Technology'
  | 'Engineering & Technology'
  | 'Accountancy & Finance'
  | 'Business & Management'
  | 'Agriculture & Food Technology'
  | 'Tourism & Hospitality'
  | 'Languages & English Studies';

export interface SLIATEProgramme {
  id: string;
  code: string;
  name: string;
  sinhalaName?: string;
  category: SLIATECategoryName;
  qualificationAwarded: string;
  qualificationType: 'Higher National Diploma (HND)';
  nvqLevel?: string;
  duration: string;
  academicDuration?: string;
  industrialTrainingDuration?: string;
  studyMode: 'Full-time' | 'Part-time' | 'Both Full-time & Part-time';
  availableATIs: string[];
  courseFee: string;
  isFree: boolean;
  registrationFee?: string;
  entryRequirements: string;
  selectionProcedure?: string;
  description: string;
  curriculum?: string[];
  careerOpportunities?: string[];
  coverImage?: string;
  officialSourceUrl: string;
  applicationUrl: string;
  lastVerifiedAt: string;
}

export interface SLIATEATI {
  id: string;
  name: string;
  code: string;
  type: 'ATI' | 'ATI Section';
  location: string;
  district: string;
  province: string;
  address: string;
  telephone: string;
  email: string;
  directorName?: string;
  offeredProgrammes: string[];
  officialUrl?: string;
}

// =========================================================================
// DTET Specific Types
// =========================================================================
export type DTETCategoryName =
  | 'Information & Communication Technology'
  | 'Civil & Construction Technology'
  | 'Electrical & Electronic Technology'
  | 'Mechanical & Automobile Technology'
  | 'Business & Secretarial Studies'
  | 'Hospitality, Food & Tourism'
  | 'Textile, Apparel & Cosmetology'
  | 'English & General Studies';

export interface DTETCourse {
  id: string;
  code: string;
  name: string;
  sinhalaName?: string;
  category: DTETCategoryName;
  qualificationType: 'National Diploma' | 'National Certificate' | 'Certificate';
  nvqLevel: string;
  duration: string;
  studyMode: 'Full-time (Day)' | 'Part-time (Weekend)' | 'Part-time (Evening)' | 'Both Full-time & Part-time';
  trainingColleges: string[];
  courseFee: string;
  isFree: boolean;
  entryRequirements: string;
  description: string;
  curriculum?: string[];
  careerOpportunities?: string[];
  coverImage?: string;
  officialSourceUrl: string;
  applicationUrl: string;
  lastVerifiedAt: string;
}

export interface DTETCollege {
  id: string;
  name: string;
  sinhalaName?: string;
  type: 'College of Technology' | 'Technical College';
  district: string;
  province: string;
  address: string;
  telephone: string;
  principalName?: string;
  availableCourses: string[];
}

// =========================================================================
// NVTI Specific Types
// =========================================================================
export type NVTICategoryName =
  | 'Automobile & Heavy Equipment'
  | 'Electrical, Electronic & Telecommunication'
  | 'Information & Communication Technology'
  | 'Civil & Construction Technology'
  | 'Hotel & Tourism / Hospitality'
  | 'Hair & Beauty Care'
  | 'Mechanical & Manufacturing';

export interface NVTICourse {
  id: string;
  code: string;
  name: string;
  sinhalaName?: string;
  category: NVTICategoryName;
  qualificationType: 'National NVQ Certificate' | 'National NVQ Diploma' | 'Certificate';
  nvqLevel: string;
  duration: string;
  studyMode: 'Full-time (Residential / Day)' | 'Full-time' | 'Part-time (Weekend)' | 'Both Full-time & Part-time';
  trainingCenters: string[];
  courseFee: string;
  isFree: boolean;
  entryRequirements: string;
  description: string;
  curriculum?: string[];
  careerOpportunities?: string[];
  coverImage?: string;
  officialSourceUrl: string;
  applicationUrl: string;
  lastVerifiedAt: string;
}

export interface NVTICenter {
  id: string;
  name: string;
  sinhalaName?: string;
  code: string;
  district: string;
  province: string;
  address: string;
  telephone: string;
  email: string;
  specialization: string;
  availableCourses: string[];
}

// =========================================================================
// CGTTI Specific Types
// =========================================================================
export type CGTTICategoryName =
  | 'Automobile & Motor Vehicle Technology'
  | 'Mechanical & Millwright Engineering'
  | 'Electrical, Electronic & Mechatronics'
  | 'Refrigeration & Air Conditioning'
  | 'Metal Fabrication & Machining'
  | 'Part-time & Industry Specialization';

export interface CGTTICourse {
  id: string;
  code: string;
  name: string;
  sinhalaName?: string;
  category: CGTTICategoryName;
  qualificationType: 'German Tech Diploma' | 'Special Full-Time Certificate' | 'Part-time Certificate';
  nvqLevel: string;
  duration: string;
  studyMode: 'Full-time (Dual Apprenticeship)' | 'Full-time' | 'Part-time (Weekend)' | 'Part-time (Evening)';
  branches: string[];
  courseFee: string;
  isFree: boolean;
  stipend?: string;
  entryRequirements: string;
  admissionProcedure: string;
  description: string;
  curriculum?: string[];
  careerOpportunities?: string[];
  coverImage?: string;
  officialSourceUrl: string;
  applicationUrl: string;
  lastVerifiedAt: string;
}

export interface CGTTIBranch {
  id: string;
  name: string;
  sinhalaName?: string;
  district: string;
  province: string;
  address: string;
  telephone: string;
  email: string;
  established: string;
  facilities: string[];
}

// =========================================================================
// NYSC Specific Types
// =========================================================================
export type NYSCCategoryName =
  | 'Information & Communication Technology'
  | 'Automobile & Small Engine Mechanics'
  | 'Electrical, Electronics & RAC'
  | 'Culinary Arts & Food Technology'
  | 'Beauty Care & Cosmetology'
  | 'Fashion Design & Garment Technology'
  | 'Youth Leadership, Business & Languages';

export interface NYSCCourse {
  id: string;
  code: string;
  name: string;
  sinhalaName?: string;
  category: NYSCCategoryName;
  qualificationType: 'National NVQ Certificate' | 'National Youth Diploma' | 'Certificate';
  nvqLevel: string;
  duration: string;
  studyMode: 'Full-time (Day)' | 'Part-time (Weekend)' | 'Both Full-time & Part-time';
  trainingCenters: string[];
  courseFee: string;
  isFree: boolean;
  ageLimit: string;
  entryRequirements: string;
  description: string;
  curriculum?: string[];
  careerOpportunities?: string[];
  coverImage?: string;
  officialSourceUrl: string;
  applicationUrl: string;
  lastVerifiedAt: string;
}

export interface NYSCCenter {
  id: string;
  name: string;
  sinhalaName?: string;
  district: string;
  province: string;
  address: string;
  telephone: string;
  email: string;
  centerType: 'National Youth Centre' | 'District Youth Training Centre' | 'Youth Training Centre';
  availableCourses: string[];
}


