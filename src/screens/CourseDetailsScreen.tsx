import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Course, Institution } from '../types';
import { ALL_COMBINED_COURSES, CourseService, InstitutionService } from '../services/api';
import { formatCurrencyLKR } from '../utils/formatters';
import { useTranslation } from '../context/LanguageContext';

interface CourseDetailsScreenProps {
  navigation: any;
  route: any;
}

export const CourseDetailsScreen: React.FC<CourseDetailsScreenProps> = ({ navigation, route }) => {
  const { t, isSinhala } = useTranslation();
  const { courseId } = route.params || {};

  const initialCourse: Course =
    route.params?.course ||
    ALL_COMBINED_COURSES.find((c) => c.id === courseId) ||
    ALL_COMBINED_COURSES[0];

  const [course, setCourse] = useState<Course>(initialCourse);
  const [institution, setInstitution] = useState<Institution | undefined>();

  useEffect(() => {
    let isMounted = true;
    const fetchLiveCourse = async () => {
      if (!courseId) return;
      try {
        const live = await CourseService.getCourseById(courseId);
        if (live && isMounted) {
          setCourse(live);
          if (live.institutionId) {
            const inst = await InstitutionService.getInstitutionById(live.institutionId);
            if (inst && isMounted) setInstitution(inst);
          }
        }
      } catch (err) {
        console.warn('Error fetching live course in CourseDetailsScreen:', err);
      }
    };
    fetchLiveCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<string | null>('requirements');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Could not open URL', err));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${course.name} at ${course.institutionName} on EduPath - Discover Your Next Step!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckQualification = () => {
    navigation.navigate('MyPathTab', {
      screen: 'QualificationChecker',
      params: { selectedCourseId: course.id },
    });
  };

  const displayName = isSinhala && course.sinhalaName ? course.sinhalaName : course.name;
  const displayOverview = isSinhala && course.sinhalaOverview ? course.sinhalaOverview : course.overview;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
        rightAction={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={20} color={COLORS.darkNavy} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner Cover Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: course.coverImage }} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.imageOverlay} />
          <View style={styles.badgeOverlay}>
            <Badge label={course.qualificationType} variant="purple" />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.verifiedText}>{t('verified')}</Text>
            </View>
          </View>
        </View>

        {/* Institution Logo & Basic Information */}
        <View style={styles.headerInfoCard}>
          <View style={styles.instRow}>
            {institution?.logo ? (
              <Image source={{ uri: institution.logo }} style={styles.instLogo} />
            ) : (
              <View style={[styles.instLogo, { backgroundColor: COLORS.softLavender, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="school" size={20} color={COLORS.primaryPurple} />
              </View>
            )}
            <View style={styles.instDetails}>
              <Text style={styles.instName}>{course.institutionName}</Text>
              <Text style={styles.instLocation}>{institution?.category || institution?.location || 'Sri Lanka'}</Text>
            </View>
          </View>

          <Text style={styles.courseTitle}>{displayName}</Text>

          {/* Quick Specifications Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Ionicons name="time-outline" size={18} color={COLORS.primaryPurple} />
              <Text style={styles.specLabel}>{t('duration')}</Text>
              <Text style={styles.specValue}>{course.duration.split('(')[0]}</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="wallet-outline" size={18} color={COLORS.modernBlue} />
              <Text style={styles.specLabel}>{t('totalFee')}</Text>
              <Text style={styles.specValue}>{formatCurrencyLKR(course.fees.totalFeeLKR)}</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="laptop-outline" size={18} color={COLORS.primaryPurple} />
              <Text style={styles.specLabel}>{t('mode')}</Text>
              <Text style={styles.specValue}>{course.studyMode[0]}</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="language-outline" size={18} color={COLORS.modernBlue} />
              <Text style={styles.specLabel}>{t('teachingMedium')}</Text>
              <Text style={styles.specValue}>{course.teachingLanguage.join(', ')}</Text>
            </View>
          </View>

          {/* Check Qualification CTA Banner */}
          <TouchableOpacity
            style={styles.qualificationCheckerBanner}
            onPress={handleCheckQualification}
            activeOpacity={0.85}
          >
            <View style={styles.checkerBannerLeft}>
              <Ionicons name="shield-checkmark" size={22} color={COLORS.primaryPurple} />
              <View style={styles.checkerBannerText}>
                <Text style={styles.checkerBannerTitle}>Check Your Entry Eligibility</Text>
                <Text style={styles.checkerBannerSubtitle}>Instant match against official requirements</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primaryPurple} />
          </TouchableOpacity>
        </View>

        {/* Section: Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>{t('courseOverview')}</Text>
          <Text style={styles.bodyParagraph}>{displayOverview}</Text>
        </View>

        {/* Section: Fees and Payment Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>{t('feesAndCost')}</Text>

          <View style={styles.feeBreakdownRow}>
            <Text style={styles.feeBreakdownLabel}>{t('totalFee')}</Text>
            <Text style={styles.feeBreakdownValue}>{formatCurrencyLKR(course.fees.totalFeeLKR)}</Text>
          </View>

          {course.fees.registrationFeeLKR ? (
            <View style={styles.feeBreakdownRow}>
              <Text style={styles.feeBreakdownLabel}>{t('registrationFee')}</Text>
              <Text style={styles.feeBreakdownValue}>
                {formatCurrencyLKR(course.fees.registrationFeeLKR)}
              </Text>
            </View>
          ) : null}

          {course.fees.installmentAvailable && (
            <View style={styles.installmentNote}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primaryPurple} />
              <Text style={styles.installmentNoteText}>{course.fees.installmentDetails}</Text>
            </View>
          )}

          {course.fees.scholarshipAvailable && course.fees.scholarshipNote && (
            <View style={styles.scholarshipNote}>
              <Ionicons name="gift-outline" size={16} color={COLORS.success} />
              <Text style={styles.scholarshipNoteText}>{course.fees.scholarshipNote}</Text>
            </View>
          )}
        </View>

        {/* Section: Entry Requirements (Expandable) */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.expandableHeader}
            onPress={() => toggleSection('requirements')}
            activeOpacity={0.8}
          >
            <Text style={styles.sectionHeaderTitle}>{t('entryRequirements')}</Text>
            <Ionicons
              name={expandedSection === 'requirements' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.primaryPurple}
            />
          </TouchableOpacity>

          {expandedSection === 'requirements' && (
            <View style={styles.expandableBody}>
              {course.entryRequirements.olRequirement && (
                <View style={styles.reqBlock}>
                  <Text style={styles.reqTitle}>{t('olRequirements')}</Text>
                  <Text style={styles.reqDetails}>
                    {course.entryRequirements.olRequirement.details ||
                      `Minimum ${course.entryRequirements.olRequirement.minimumPasses || 6} passes.`}
                  </Text>
                </View>
              )}

              {course.entryRequirements.alRequirement && (
                <View style={styles.reqBlock}>
                  <Text style={styles.reqTitle}>{t('alRequirements')}</Text>
                  <Text style={styles.reqDetails}>
                    {course.entryRequirements.alRequirement.details ||
                      `Stream: ${course.entryRequirements.alRequirement.stream || 'Any'}. Passes: ${
                        course.entryRequirements.alRequirement.minimumPasses || 2
                      }.`}
                  </Text>
                </View>
              )}

              {course.entryRequirements.previousQualifications && (
                <View style={styles.reqBlock}>
                  <Text style={styles.reqTitle}>{t('priorQualifications')}</Text>
                  {course.entryRequirements.previousQualifications.map((p, idx) => (
                    <Text key={idx} style={styles.reqDetails}>
                      • {p}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Section: Modules & Curriculum */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.expandableHeader}
            onPress={() => toggleSection('modules')}
            activeOpacity={0.8}
          >
            <Text style={styles.sectionHeaderTitle}>{t('curriculum')}</Text>
            <Ionicons
              name={expandedSection === 'modules' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.primaryPurple}
            />
          </TouchableOpacity>

          {expandedSection === 'modules' && (
            <View style={styles.expandableBody}>
              {course.modules.map((m, idx) => (
                <View key={idx} style={styles.moduleItem}>
                  <Text style={styles.moduleSemester}>{m.yearOrSemester}</Text>
                  {m.subjects.map((sub, sIdx) => (
                    <View key={sIdx} style={styles.subjectRow}>
                      <Ionicons name="book-outline" size={13} color={COLORS.primaryPurple} />
                      <Text style={styles.subjectText}>{sub}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Section: Skills & Career Opportunities */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>{t('skillsAcquired')}</Text>
          <View style={styles.skillsGrid}>
            {course.skillsGained.map((skill, idx) => (
              <View key={idx} style={styles.skillChip}>
                <Ionicons name="checkmark-sharp" size={12} color={COLORS.primaryPurple} />
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionHeaderTitle, { marginTop: 18 }]}>
            {t('careerProspects')}
          </Text>
          <View style={styles.careerList}>
            {course.careerOpportunities.map((c, idx) => (
              <View key={idx} style={styles.careerRow}>
                <Ionicons name="briefcase-outline" size={16} color={COLORS.modernBlue} />
                <Text style={styles.careerText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section: Awarding Body & Accreditation */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>{t('qualificationAwarded')}</Text>
          <Text style={styles.bodyParagraph}>{course.qualificationAwarded}</Text>

          <Text style={[styles.sectionHeaderTitle, { marginTop: 14 }]}>{t('accreditation')}</Text>
          {course.accreditation.map((acc, idx) => (
            <View key={idx} style={styles.accRow}>
              <Ionicons name="ribbon-outline" size={15} color={COLORS.primaryPurple} />
              <Text style={styles.accText}>{acc}</Text>
            </View>
          ))}
        </View>

        {/* Section: Contact & Official Verification */}
        {institution && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>{t('institutionContact')}</Text>
            {institution.contactNumber ? (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color={COLORS.secondaryText} />
                <Text style={styles.contactText}>{institution.contactNumber}</Text>
              </View>
            ) : null}
            {institution.email ? (
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={16} color={COLORS.secondaryText} />
                <Text style={styles.contactText}>{institution.email}</Text>
              </View>
            ) : null}
            {institution.location ? (
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.secondaryText} />
                <Text style={styles.contactText}>{institution.location}</Text>
              </View>
            ) : null}

            <View style={styles.lastVerifiedRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.secondaryText} />
              <Text style={styles.lastVerifiedText}>
                {t('lastVerified')}: {course.lastVerifiedDate}
              </Text>
            </View>
          </View>
        )}

        {/* Demonstration Disclaimer Note */}
        <View style={styles.sampleDisclaimerBox}>
          <Ionicons name="alert-circle-outline" size={16} color={COLORS.secondaryText} />
          <Text style={styles.sampleDisclaimerText}>{t('sampleNotice')}</Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Button
          title={t('officialWebsite')}
          variant="outline"
          onPress={() => handleOpenUrl(course.officialWebsite)}
          style={styles.websiteBtn}
        />
        <Button
          title={t('applyNow')}
          variant="primary"
          onPress={() => handleOpenUrl(course.officialApplyLink)}
          icon="open-outline"
          iconPosition="right"
          style={styles.applyBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.softGray,
  },
  shareBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.softGray,
    marginLeft: 8,
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 27, 46, 0.25)',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginLeft: 4,
  },
  headerInfoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 20,
    padding: 18,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
  },
  instRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: COLORS.softGray,
  },
  instDetails: {
    flex: 1,
  },
  instName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  instLocation: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 27,
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  specBox: {
    width: '48%',
    backgroundColor: COLORS.softGray,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  specLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginTop: 2,
  },
  qualificationCheckerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.softLavender,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  checkerBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkerBannerText: {
    marginLeft: 10,
    flex: 1,
  },
  checkerBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  checkerBannerSubtitle: {
    fontSize: 11,
    color: COLORS.primaryPurple,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 8,
  },
  bodyParagraph: {
    fontSize: 13,
    color: COLORS.darkNavy,
    lineHeight: 20,
  },
  feeBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  feeBreakdownLabel: {
    fontSize: 13,
    color: COLORS.secondaryText,
  },
  feeBreakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  installmentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  installmentNoteText: {
    fontSize: 12,
    color: COLORS.primaryPurple,
    marginLeft: 8,
    flex: 1,
  },
  scholarshipNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  scholarshipNoteText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 8,
    flex: 1,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandableBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  reqBlock: {
    marginBottom: 12,
  },
  reqTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 3,
  },
  reqDetails: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
  },
  moduleItem: {
    marginBottom: 12,
  },
  moduleSemester: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginBottom: 4,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  subjectText: {
    fontSize: 12,
    color: COLORS.darkNavy,
    marginLeft: 6,
  },
  skillsGrid: {
    gap: 6,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 12,
    color: COLORS.primaryPurple,
    fontWeight: '600',
    marginLeft: 6,
  },
  careerList: {
    gap: 8,
  },
  careerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  careerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkNavy,
    marginLeft: 8,
  },
  accRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  accText: {
    fontSize: 12,
    color: COLORS.darkNavy,
    marginLeft: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.darkNavy,
    marginLeft: 8,
  },
  lastVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  lastVerifiedText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginLeft: 6,
  },
  sampleDisclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sampleDisclaimerText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  websiteBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 1.4,
  },
});

export default CourseDetailsScreen;
