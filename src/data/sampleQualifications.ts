import { QualificationLevel } from '../types';

export interface QualificationInfo {
  level: QualificationLevel;
  name: string;
  sinhalaName: string;
  nvqLevelApprox?: string;
  typicalDuration: string;
  description: string;
  descriptionSinhala: string;
  iconName: string;
}

export const SAMPLE_QUALIFICATIONS: QualificationInfo[] = [
  {
    level: 'O/L',
    name: 'G.C.E. Ordinary Level (O/L)',
    sinhalaName: 'අ.පො.ස. සාමාන්‍ය පෙළ (O/L)',
    nvqLevelApprox: 'Level 2/3',
    typicalDuration: 'Completed in Grade 11',
    description: 'The national secondary benchmark in Sri Lanka. 6 passes with Mathematics and English opens foundation, certificate, and vocational pathways.',
    descriptionSinhala: 'ශ්‍රී ලංකාවේ මූලික පාසල් සහතිකයයි. ගණිතය සහ ඉංග්‍රීසි ඇතුළුව විෂයන් 6ක් සමත්වීම පදනම් පාඨමාලා සහ වෘත්තීය පුහුණුව සඳහා දොරටු විවර කරයි.',
    iconName: 'school-outline',
  },
  {
    level: 'A/L',
    name: 'G.C.E. Advanced Level (A/L)',
    sinhalaName: 'අ.පො.ස. උසස් පෙළ (A/L)',
    nvqLevelApprox: 'Level 4 Equivalent',
    typicalDuration: '2 Years (Grades 12-13)',
    description: 'Prerequisite for direct state university entrance (Maths, Bio, Commerce, Arts, or Tech streams) and direct entry to degree programmes.',
    descriptionSinhala: 'රජයේ විශ්වවිද්‍යාල හෝ සෘජු උපාධි පාඨමාලා සඳහා සුදුසුකම් සපයන ප්‍රධාන විභාගයයි.',
    iconName: 'ribbon-outline',
  },
  {
    level: 'Foundation',
    name: 'University Foundation Certificate',
    sinhalaName: 'විශ්වවිද්‍යාල පදනම් සහතිකය',
    nvqLevelApprox: 'Pre-Degree Level 3/4',
    typicalDuration: '8 - 12 Months',
    description: 'Designed as a fast-track alternative to A/Ls for O/L holders, leading directly into year 1 of bachelor degrees in IT, Business, and Engineering.',
    descriptionSinhala: 'සාමාන්‍ය පෙළින් පසු උසස් පෙළ වෙනුවට සෘජුවම උපාධියේ පළමු වසරට ඇතුළත් විය හැකි පදනම් පාඨමාලාවකි.',
    iconName: 'book-outline',
  },
  {
    level: 'Diploma',
    name: 'Diploma (Academic & Vocational)',
    sinhalaName: 'ඩිප්ලෝමා සහතිකය',
    nvqLevelApprox: 'NVQ Level 5',
    typicalDuration: '1 Year',
    description: 'Hands-on practical training with academic concepts, qualifying holders for supervisory roles or advanced academic entry.',
    descriptionSinhala: 'ප්‍රායෝගික හා න්‍යායික දැනුම සහිත වසරක පාඨමාලාවක් වන අතර ක්ෂේත්‍රයේ රැකියා හෝ උසස් ඩිප්ලෝමා සඳහා මඟපෙන්වයි.',
    iconName: 'document-text-outline',
  },
  {
    level: 'Higher Diploma',
    name: 'Higher Diploma / HND',
    sinhalaName: 'උසස් ඩිප්ලෝමාව / HND',
    nvqLevelApprox: 'NVQ Level 6',
    typicalDuration: '1.5 - 2 Years',
    description: 'Equivalent to the first two years of a bachelor’s degree. Allows direct lateral entry into the final year (Top-Up) of international degrees.',
    descriptionSinhala: 'ප්‍රථම උපාධියක පළමු වසර දෙකට සමාන වේ. විදේශීය හෝ දේශීය උපාධියක අවසන් වසරට (Top-Up) කෙලින්ම ඇතුළත් විය හැක.',
    iconName: 'layers-outline',
  },
  {
    level: 'Degree',
    name: 'Bachelor\'s Degree (General / Honours)',
    sinhalaName: 'ප්‍රථම උපාධිය (සාමාන්‍ය / ගෞරව)',
    nvqLevelApprox: 'NVQ Level 7 (SLQF 5/6)',
    typicalDuration: '3 - 4 Years',
    description: 'Undergraduate academic degree qualifying graduates for corporate executive roles, engineering registration, or postgraduate study.',
    descriptionSinhala: 'වසර 3 හෝ 4ක ප්‍රථම උපාධියයි. විධායක මට්ටමේ රැකියා, ඉංජිනේරු ලියාපදිංචිය සහ පශ්චාත් උපාධි සඳහා අත්‍යවශ්‍ය වේ.',
    iconName: 'school',
  },
  {
    level: 'Postgraduate Diploma',
    name: 'Postgraduate Diploma / Master\'s',
    sinhalaName: 'පශ්චාත් උපාධි ඩිප්ලෝමා / ශාස්ත්‍රපති (Master\'s)',
    nvqLevelApprox: 'SLQF Level 8-10',
    typicalDuration: '1 - 2 Years',
    description: 'Advanced specialization for degree holders or experienced executives (e.g. MBA, MSc Computing, LLM).',
    descriptionSinhala: 'උපාධිධාරීන්ට හෝ පළපුරුදු විධායකයින්ට තම ක්ෂේත්‍රයේ ඉහළම දැනුම ලබාගැනීමට ඇති පශ්චාත් උපාධි පාඨමාලා.',
    iconName: 'trophy-outline',
  },
  {
    level: 'Professional Qualification',
    name: 'Chartered & Professional Body Certification',
    sinhalaName: 'වෘත්තීය හා වරලත් ආයතනික සුදුසුකම්',
    nvqLevelApprox: 'Chartered Benchmark',
    typicalDuration: '2 - 4 Years',
    description: 'Industry-standard qualifications such as CA Sri Lanka, CIMA, ACCA, CIM, BCS, and Attorney-at-Law, offering immense global mobility.',
    descriptionSinhala: 'CA, CIMA, ACCA, CIM, BCS සහ නීති විද්‍යාලය වැනි වෘත්තීය ආයතන මඟින් පිරිනමන ජාත්‍යන්තර පිළිගැනීමක් සහිත සුදුසුකම්.',
    iconName: 'shield-checkmark-outline',
  },
];
