import { Course } from '../types';

/**
 * Synchronizes local verified courses with live MongoDB Atlas records for a specific institution.
 * - If a local course was edited in MongoDB (matches by id or name), its updated fields take precedence.
 * - If new courses were created in the Admin Panel for this institution, they are appended.
 */
export const syncInstitutionCourses = <T extends { id: string; name: string }>(
  institutionAcronym: string,
  localCourses: T[],
  liveCourses: Course[]
): T[] => {
  if (!liveCourses || liveCourses.length === 0) return localCourses;

  const acronym = institutionAcronym.toLowerCase().trim();
  const instLiveCourses = liveCourses.filter((c) => {
    const instName = (c.institutionName || '').toLowerCase();
    const cId = (c.id || '').toLowerCase();
    const cAwarding = (c.awardingBody || '').toLowerCase();
    return (
      instName.includes(acronym) ||
      cId.includes(acronym) ||
      cAwarding.includes(acronym)
    );
  });

  if (instLiveCourses.length === 0) return localCourses;

  const matchedLiveIds = new Set<string>();

  const updatedLocal = localCourses
    .filter((local: any) => {
      const localName = (local.name || '').trim().toLowerCase();
      return instLiveCourses.some((live) => {
        const liveName = (live.name || '').trim().toLowerCase();
        return (
          live.id === local.id ||
          liveName === localName ||
          (local.code && live.id.toLowerCase().includes(local.code.toLowerCase()))
        );
      });
    })
    .map((local: any) => {
      const localName = (local.name || '').trim().toLowerCase();
      const matched = instLiveCourses.find((live) => {
        const liveName = (live.name || '').trim().toLowerCase();
        return (
          live.id === local.id ||
          liveName === localName ||
          (local.code && live.id.toLowerCase().includes(local.code.toLowerCase()))
        );
      });

    if (matched) {
      matchedLiveIds.add(matched.id);
      return {
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
      };
    }
    return local;
  });

  // Include any BRAND NEW courses created in Admin Panel that aren't in local array
  const newFromLive = instLiveCourses
    .filter((live) => !matchedLiveIds.has(live.id))
    .map((live) => {
      return {
        id: live.id,
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
        supportedLevels: live.nvqLevel ? [live.nvqLevel] : ['NVQ Level 4'],
        levelDetails: {},
      } as unknown as T;
    });

  return [...newFromLive, ...updatedLocal];
};
