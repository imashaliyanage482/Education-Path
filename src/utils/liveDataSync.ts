import { Course } from '../types';

// In-memory set of deleted course IDs / names for immediate cross-screen consistency
const DELETED_COURSE_IDENTIFIERS = new Set<string>();

export const markCourseAsDeleted = (id: string, name?: string) => {
  if (id) DELETED_COURSE_IDENTIFIERS.add(id.toLowerCase().trim());
  if (name) DELETED_COURSE_IDENTIFIERS.add(name.toLowerCase().trim());
};

export const isCourseDeleted = (id?: string, name?: string): boolean => {
  if (id && DELETED_COURSE_IDENTIFIERS.has(id.toLowerCase().trim())) return true;
  if (name && DELETED_COURSE_IDENTIFIERS.has(name.toLowerCase().trim())) return true;
  return false;
};

/**
 * Synchronizes local verified courses with live MongoDB Atlas records for a specific institution.
 * - If a local course was edited in MongoDB (matches by id or name), its updated fields take precedence.
 * - If new courses were created in the Admin Panel for this institution, they are appended.
 * - Excludes any course deleted by an admin.
 */
export const syncInstitutionCourses = <T extends { id: string; name: string }>(
  institutionAcronym: string,
  localCourses: T[],
  liveCourses: Course[]
): T[] => {
  // Filter out deleted courses from local array first
  const activeLocalCourses = localCourses.filter((c) => !isCourseDeleted(c.id, c.name));
  if (!liveCourses || liveCourses.length === 0) return activeLocalCourses;

  const acronym = institutionAcronym.toLowerCase().trim();
  const instLiveCourses = liveCourses
    .filter((c) => !isCourseDeleted(c.id, c.name))
    .filter((c) => {
      const instName = (c.institutionName || '').toLowerCase();
      const cId = (c.id || (c as any)._id || '').toLowerCase();
      const cAwarding = (c.awardingBody || '').toLowerCase();
      return (
        instName.includes(acronym) ||
        cId.includes(acronym) ||
        cAwarding.includes(acronym) ||
        (acronym === 'naita' && instName.includes('national apprentice')) ||
        (acronym === 'uovt' && instName.includes('vocational technology')) ||
        (acronym === 'sliate' && instName.includes('advanced technological')) ||
        (acronym === 'dtet' && instName.includes('technical education')) ||
        (acronym === 'vta' && instName.includes('vocational training')) ||
        (acronym === 'cgtti' && (instName.includes('german tech') || instName.includes('ceylon german'))) ||
        (acronym === 'nvti' && instName.includes('national vocational training')) ||
        (acronym === 'nysc' && instName.includes('youth services'))
      );
    });

  if (instLiveCourses.length === 0) return activeLocalCourses;

  const matchedLiveIds = new Set<string>();
  const matchedLocalCourses: T[] = [];

  activeLocalCourses.forEach((local: any) => {
    if (isCourseDeleted(local.id, local.name)) return;
    const localName = (local.name || '').trim().toLowerCase();
    const localId = (local.id || '').toLowerCase();

    const matched = instLiveCourses.find((live) => {
      const liveName = (live.name || '').trim().toLowerCase();
      const liveId = (live.id || (live as any)._id || '').toLowerCase();
      return (
        liveId === localId ||
        liveName === localName ||
        (localName && (liveName.includes(localName) || localName.includes(liveName))) ||
        (local.code && liveId.includes(local.code.toLowerCase()))
      );
    });

    if (matched) {
      const resolvedId = matched.id || (matched as any)._id;
      if (resolvedId) matchedLiveIds.add(resolvedId);

      matchedLocalCourses.push({
        ...local,
        name: matched.name,
        sinhalaName: matched.sinhalaName || local.sinhalaName,
        coverImage: matched.coverImage || local.coverImage,
        duration: matched.duration || local.duration,
        description: matched.overview || local.description,
        entryRequirements:
          matched.entryRequirements?.olRequirement?.details ||
          local.entryRequirements,
        courseFee:
          matched.fees?.totalFeeLKR === 0
            ? 'Free / Government Funded'
            : `Rs. ${matched.fees?.totalFeeLKR?.toLocaleString()}`,
        isFree: matched.fees?.totalFeeLKR === 0,
        nvqLevel: matched.nvqLevel || local.nvqLevel,
        category: local.category || matched.studyField,
        district: matched.district || local.district,
      });
    } else {
      matchedLocalCourses.push(local);
    }
  });

  // Include any BRAND NEW courses created in Admin Panel that aren't in local array
  const newFromLive = instLiveCourses
    .filter((live) => !matchedLiveIds.has(live.id) && !matchedLiveIds.has((live as any)._id))
    .map((live) => {
      const resolvedStudyMode = Array.isArray(live.studyMode)
        ? (live.studyMode.length > 1 ? 'Both Full-time & Part-time' : (live.studyMode[0] || 'Full-time'))
        : (live.studyMode || 'Full-time');

      return {
        id: live.id || (live as any)._id,
        code: (live as any).code || 'HND-EXT',
        name: live.name,
        sinhalaName: live.sinhalaName,
        category: (live.studyField as any) || 'Technical',
        nvqLevel: live.nvqLevel || 'NVQ Level 4',
        duration: live.duration || '1 Year',
        description: live.overview || '',
        entryRequirements:
          live.entryRequirements?.olRequirement?.details || 'G.C.E. O/L passed',
        courseFee:
          live.fees?.totalFeeLKR === 0
            ? 'Free / Government Funded'
            : `Rs. ${live.fees?.totalFeeLKR?.toLocaleString()}`,
        isFree: live.fees?.totalFeeLKR === 0,
        coverImage:
          live.coverImage ||
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        district: live.district || 'All Districts',
        features: live.skillsGained || [],
        officialSourceUrl: live.officialApplyLink || live.officialWebsite,
        trainingCentre: live.institutionName || institutionAcronym,
        providerType: (live as any).providerType || 'Direct NAITA (District Network)',
        supportedLevels: live.nvqLevel ? [live.nvqLevel] : ['NVQ Level 4'],
        levelDetails: {},
        availableATIs: (live as any).availableATIs || ['19 Regional ATIs'],
        studyMode: resolvedStudyMode,
        qualificationAwarded: live.qualificationAwarded || live.qualificationType || 'Higher National Diploma',
        qualificationType: (live.qualificationType as any) || 'Certificate',
        applicationUrl: live.officialApplyLink || live.officialWebsite || 'https://www.sliate.ac.lk',
        lastVerifiedAt: 'November 2026',
      } as unknown as T;
    });

  return [...newFromLive, ...matchedLocalCourses];
};
