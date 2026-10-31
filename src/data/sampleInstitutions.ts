import { Institution, GovernmentInstitutionCategory } from '../types';

export interface InstitutionCategoryGroup {
  category: GovernmentInstitutionCategory;
  categoryNumber: number;
  institutions: Institution[];
}

export const GOVERNMENT_VOCATIONAL_INSTITUTIONS: Institution[] = [
  // 1. Vocational Universities
  {
    id: 'gov-inst-1',
    name: 'University of Vocational Technology',
    shortName: 'UoVT',
    category: 'Vocational Universities',
    isVerified: true,
  },

  // 2. Advanced Technological Institutes
  {
    id: 'gov-inst-3',
    name: 'Sri Lanka Institute of Advanced Technological Education',
    shortName: 'SLIATE',
    category: 'Advanced Technological Institutes',
    isVerified: true,
  },

  // 3. Technical Colleges
  {
    id: 'gov-inst-4',
    name: 'Department of Technical Education and Training',
    shortName: 'DTET',
    category: 'Technical Colleges',
    isVerified: true,
  },

  // 4. Vocational Training Centres
  {
    id: 'gov-inst-5',
    name: 'Vocational Training Authority',
    shortName: 'VTA',
    category: 'Vocational Training Centres',
    isVerified: true,
  },
  {
    id: 'gov-inst-6',
    name: 'National Vocational Training Institute',
    shortName: 'NVTI',
    category: 'Vocational Training Centres',
    isVerified: true,
  },

  // 5. Apprenticeship Institutes
  {
    id: 'gov-inst-7',
    name: 'National Apprentice and Industrial Training Authority',
    shortName: 'NAITA',
    category: 'Apprenticeship Institutes',
    isVerified: true,
  },

  // 6. Engineering Training Institutes
  {
    id: 'gov-inst-9',
    name: 'Ceylon-German Technical Training Institute',
    shortName: 'CGTTI',
    category: 'Engineering Training Institutes',
    isVerified: true,
  },

  // 7. Youth Training Institutes
  {
    id: 'gov-inst-10',
    name: 'National Youth Services Council',
    shortName: 'NYSC',
    category: 'Youth Training Institutes',
    isVerified: true,
  },
];

export const INSTITUTION_CATEGORIES: { category: GovernmentInstitutionCategory; number: number }[] = [
  { number: 1, category: 'Vocational Universities' },
  { number: 2, category: 'Advanced Technological Institutes' },
  { number: 3, category: 'Technical Colleges' },
  { number: 4, category: 'Vocational Training Centres' },
  { number: 5, category: 'Apprenticeship Institutes' },
  { number: 6, category: 'Engineering Training Institutes' },
  { number: 7, category: 'Youth Training Institutes' },
];

export const SAMPLE_INSTITUTIONS: Institution[] = GOVERNMENT_VOCATIONAL_INSTITUTIONS;
