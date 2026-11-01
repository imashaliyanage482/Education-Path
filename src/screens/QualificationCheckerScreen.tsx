import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Course, EligibilityEvaluation, UserQualificationInput } from '../types';
import { ALL_COMBINED_COURSES, CourseService } from '../services/api';
import { evaluateEligibility } from '../utils/eligibilityCalculator';
import { useTranslation } from '../context/LanguageContext';

interface QualificationCheckerScreenProps {
  navigation: any;
  route: any;
}

const GRADE_OPTIONS = ['A', 'B', 'C', 'S', 'W'];
const AL_STREAMS = ['Physical Science (Maths)', 'Biological Science', 'Commerce', 'Arts', 'Technology'];

export const QualificationCheckerScreen: React.FC<QualificationCheckerScreenProps> = ({
  navigation,
  route,
}) => {
  const { t, isSinhala } = useTranslation();
  const preselectedCourseId = route.params?.selectedCourseId;

  const [courses, setCourses] = useState<Course[]>(ALL_COMBINED_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course>(() => {
    return ALL_COMBINED_COURSES.find((c) => c.id === preselectedCourseId) || ALL_COMBINED_COURSES[0];
  });
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    CourseService.getAllCourses()
      .then((data) => {
        if (data && data.length > 0 && isMounted) {
          setCourses(data);
          if (preselectedCourseId) {
            const matched = data.find((c) => c.id === preselectedCourseId);
            if (matched) setSelectedCourse(matched);
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [preselectedCourseId]);

  // Form Inputs
  const [hasOL, setHasOL] = useState(true);
  const [olMathsGrade, setOlMathsGrade] = useState('C');
  const [olEnglishGrade, setOlEnglishGrade] = useState('C');
  const [hasAL, setHasAL] = useState(true);
  const [alStream, setAlStream] = useState('Commerce');
  const [alPassCount, setAlPassCount] = useState('3');

  // Result state
  const [evaluation, setEvaluation] = useState<EligibilityEvaluation | null>(null);

  const handleEvaluate = () => {
    const input: UserQualificationInput = {
      hasOL,
      olMathsGrade,
      olEnglishGrade,
      olPassCount: 6,
      hasAL,
      alStream: alStream.includes('Maths')
        ? 'Maths'
        : alStream.includes('Bio')
        ? 'Science'
        : 'Commerce',
      alPassCount: parseInt(alPassCount, 10) || 0,
      higherQualifications: [],
      workExperienceYears: 0,
      interests: [selectedCourse.studyField],
    };

    const res = evaluateEligibility(selectedCourse, input);
    setEvaluation(res);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Eligible':
        return 'success';
      case 'More Information Needed':
        return 'warning';
      case 'Future Pathway':
        return 'purple';
      case 'Additional Qualifications Required':
      default:
        return 'danger';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={t('checkerTitle')}
        subtitle={t('checkerSubtitle')}
        showLanguageToggle={true}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
        {/* Banner: Match All Eligible Courses via Find My Path */}
        <TouchableOpacity
          style={styles.findPathBanner}
          onPress={() => navigation.navigate('FindMyPath')}
          activeOpacity={0.85}
        >
          <View style={styles.findPathBannerIcon}>
            <Ionicons name="sparkles" size={20} color={COLORS.primaryPurple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.findPathBannerTitle}>
              {isSinhala ? 'ඔබට සුදුසු සියලුම පාඨමාලා එකවර සොයන්න' : 'Find All Courses You Qualify For'}
            </Text>
            <Text style={styles.findPathBannerSubtitle}>
              {isSinhala ? 'Find My Path හරහා NVQ, ඩිප්ලෝමා හා උපාධි පෙරහන් කරන්න' : 'Evaluate your results across all degrees, diplomas & NVQ'}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={COLORS.primaryPurple} />
        </TouchableOpacity>

        {/* Course Selector Dropdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>{t('selectCourseToCheck')}</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setCourseDropdownOpen(!courseDropdownOpen)}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedCourseName} numberOfLines={1}>
                {isSinhala && selectedCourse.sinhalaName
                  ? selectedCourse.sinhalaName
                  : selectedCourse.name}
              </Text>
              <Text style={styles.selectedCourseInst}>{selectedCourse.institutionName}</Text>
            </View>
            <Ionicons
              name={courseDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.primaryPurple}
            />
          </TouchableOpacity>

          {courseDropdownOpen && (
            <View style={styles.dropdownList}>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.dropdownItem,
                    selectedCourse.id === course.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCourse(course);
                    setCourseDropdownOpen(false);
                    setEvaluation(null);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedCourse.id === course.id && styles.dropdownItemTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {course.name}
                  </Text>
                  <Text style={styles.dropdownItemSub}>{course.institutionName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Input Form Card */}
        <View style={styles.card}>
          {/* G.C.E. O/L Results */}
          <View style={styles.formRowHeader}>
            <Text style={styles.cardSectionTitle}>{t('enterOlResults')}</Text>
            <TouchableOpacity
              onPress={() => setHasOL(!hasOL)}
              style={styles.checkboxRow}
              activeOpacity={0.8}
            >
              <Ionicons
                name={hasOL ? 'checkbox' : 'square-outline'}
                size={20}
                color={COLORS.primaryPurple}
              />
              <Text style={styles.checkboxLabel}>Passed O/L</Text>
            </TouchableOpacity>
          </View>

          {hasOL && (
            <View style={styles.gradesContainer}>
              <View style={styles.gradeSelectBox}>
                <Text style={styles.fieldLabel}>{t('mathsGrade')}</Text>
                <View style={styles.gradePillRow}>
                  {GRADE_OPTIONS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.gradePill, olMathsGrade === g && styles.gradePillActive]}
                      onPress={() => setOlMathsGrade(g)}
                    >
                      <Text
                        style={[
                          styles.gradePillText,
                          olMathsGrade === g && styles.gradePillTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.gradeSelectBox, { marginTop: 12 }]}>
                <Text style={styles.fieldLabel}>{t('englishGrade')}</Text>
                <View style={styles.gradePillRow}>
                  {GRADE_OPTIONS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.gradePill, olEnglishGrade === g && styles.gradePillActive]}
                      onPress={() => setOlEnglishGrade(g)}
                    >
                      <Text
                        style={[
                          styles.gradePillText,
                          olEnglishGrade === g && styles.gradePillTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* G.C.E. A/L Results */}
          <View style={[styles.formRowHeader, { marginTop: 20 }]}>
            <Text style={styles.cardSectionTitle}>{t('enterAlResults')}</Text>
            <TouchableOpacity
              onPress={() => setHasAL(!hasAL)}
              style={styles.checkboxRow}
              activeOpacity={0.8}
            >
              <Ionicons
                name={hasAL ? 'checkbox' : 'square-outline'}
                size={20}
                color={COLORS.primaryPurple}
              />
              <Text style={styles.checkboxLabel}>Sat A/L</Text>
            </TouchableOpacity>
          </View>

          {hasAL && (
            <View style={styles.gradesContainer}>
              <Text style={styles.fieldLabel}>{t('alStream')}</Text>
              <View style={styles.streamPillRow}>
                {AL_STREAMS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.streamPill, alStream === s && styles.streamPillActive]}
                    onPress={() => setAlStream(s)}
                  >
                    <Text
                      style={[
                        styles.streamPillText,
                        alStream === s && styles.streamPillTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>{t('alPasses')}</Text>
                <View style={styles.passCountRow}>
                  {['0', '1', '2', '3'].map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={[styles.passPill, alPassCount === count && styles.passPillActive]}
                      onPress={() => setAlPassCount(count)}
                    >
                      <Text
                        style={[
                          styles.passPillText,
                          alPassCount === count && styles.passPillTextActive,
                        ]}
                      >
                        {count} Passes
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          <Button
            title={t('checkStatusButton')}
            variant="primary"
            size="large"
            icon="analytics"
            onPress={handleEvaluate}
            style={{ marginTop: 20 }}
          />
        </View>

        {/* Evaluation Output Card */}
        {evaluation && (
          <View style={styles.evaluationCard}>
            <View style={styles.evalHeader}>
              <Badge
                label={isSinhala ? evaluation.statusSinhala : evaluation.status}
                variant={getStatusBadgeVariant(evaluation.status)}
              />
              <Text style={styles.matchScoreText}>
                {evaluation.matchScore}% Match
              </Text>
            </View>

            <Text style={styles.evalSummary}>
              {isSinhala ? evaluation.summarySinhala : evaluation.summary}
            </Text>

            {/* Criteria Met */}
            {evaluation.metRequirements.length > 0 && (
              <View style={styles.evalBlock}>
                <Text style={styles.evalBlockTitleGreen}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.success} /> {t('metCriteria')}
                </Text>
                {evaluation.metRequirements.map((met, idx) => (
                  <Text key={idx} style={styles.criteriaItem}>
                    • {met}
                  </Text>
                ))}
              </View>
            )}

            {/* Unmet Criteria */}
            {evaluation.missingRequirements.length > 0 && (
              <View style={styles.evalBlock}>
                <Text style={styles.evalBlockTitleRed}>
                  <Ionicons name="alert-circle" size={14} color={COLORS.danger} /> {t('unmetCriteria')}
                </Text>
                {evaluation.missingRequirements.map((missing, idx) => (
                  <Text key={idx} style={styles.criteriaItem}>
                    • {missing}
                  </Text>
                ))}
              </View>
            )}

            {/* Suggested Next Steps */}
            {evaluation.recommendedSteps.length > 0 && (
              <View style={styles.evalBlock}>
                <Text style={styles.evalBlockTitlePurple}>
                  <Ionicons name="bulb-outline" size={14} color={COLORS.primaryPurple} /> {t('suggestedSteps')}
                </Text>
                {evaluation.recommendedSteps.map((step, idx) => (
                  <Text key={idx} style={styles.criteriaItem}>
                    • {step}
                  </Text>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>{t('legalDisclaimer')}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  contentPadding: {
    padding: 20,
    gap: 16,
  },
  findPathBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    gap: 12,
  },
  findPathBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findPathBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 2,
  },
  findPathBannerSubtitle: {
    fontSize: 11.5,
    color: COLORS.secondaryText,
    lineHeight: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softGray,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCourseName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  selectedCourseInst: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    marginTop: 2,
  },
  dropdownList: {
    marginTop: 8,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.softLavender,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkNavy,
  },
  dropdownItemTextSelected: {
    color: COLORS.primaryPurple,
    fontWeight: '700',
  },
  dropdownItemSub: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  formRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkNavy,
    marginLeft: 6,
  },
  gradesContainer: {
    backgroundColor: COLORS.softGray,
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  gradeSelectBox: {},
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
    marginBottom: 6,
  },
  gradePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradePill: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradePillActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  gradePillText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  gradePillTextActive: {
    color: COLORS.white,
  },
  streamPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  streamPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streamPillActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  streamPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  streamPillTextActive: {
    color: COLORS.white,
  },
  passCountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  passPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  passPillActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  passPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  passPillTextActive: {
    color: COLORS.white,
  },
  evaluationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2DAFC',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  evalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  evalSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkNavy,
    lineHeight: 20,
    marginBottom: 14,
  },
  evalBlock: {
    marginBottom: 12,
  },
  evalBlockTitleGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 4,
  },
  evalBlockTitleRed: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
    marginBottom: 4,
  },
  evalBlockTitlePurple: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginBottom: 4,
  },
  criteriaItem: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
    marginLeft: 4,
  },
  disclaimerBox: {
    backgroundColor: COLORS.softGray,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disclaimerText: {
    fontSize: 10,
    color: COLORS.secondaryText,
    lineHeight: 14,
    fontStyle: 'italic',
  },
});

export default QualificationCheckerScreen;
