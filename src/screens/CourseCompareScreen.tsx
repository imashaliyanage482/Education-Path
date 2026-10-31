import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ALL_COMBINED_COURSES, CourseService } from '../services/api';
import { Course } from '../types';
import { formatCurrencyLKR } from '../utils/formatters';
import { useTranslation } from '../context/LanguageContext';

interface CourseCompareScreenProps {
  navigation: any;
  route: any;
}

const { width } = Dimensions.get('window');

export const CourseCompareScreen: React.FC<CourseCompareScreenProps> = ({ navigation, route }) => {
  const { t, isSinhala } = useTranslation();
  const initialIds: string[] = route.params?.courseIds || ['course-1', 'course-2'];

  const [courses, setCourses] = useState<Course[]>(ALL_COMBINED_COURSES);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(initialIds);

  useEffect(() => {
    let isMounted = true;
    CourseService.getAllCourses()
      .then((data) => {
        if (data && data.length > 0 && isMounted) {
          setCourses(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCourses: Course[] = selectedCourseIds
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is Course => c !== undefined);

  const removeCourse = (id: string) => {
    setSelectedCourseIds(selectedCourseIds.filter((cid) => cid !== id));
  };

  const addCourse = (id: string) => {
    if (selectedCourseIds.length >= 3) {
      alert('You can compare a maximum of 3 courses at once.');
      return;
    }
    if (!selectedCourseIds.includes(id)) {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  const unselectedCourses = courses.filter((c) => !selectedCourseIds.includes(c.id));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={t('compareTitle')}
        subtitle={t('compareSubtitle')}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
        rightAction={
          selectedCourseIds.length > 0 ? (
            <TouchableOpacity onPress={() => setSelectedCourseIds([])} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>{t('clearComparison')}</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
        {/* Quick Add Course Selector */}
        {selectedCourseIds.length < 3 && unselectedCourses.length > 0 && (
          <View style={styles.addCourseCard}>
            <Text style={styles.addCourseTitle}>+ Add Course to Compare (Up to 3)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddScroll}>
              {unselectedCourses.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.quickAddPill}
                  onPress={() => addCourse(c.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAddText} numberOfLines={1}>
                    {c.institutionName}: {c.name.substring(0, 30)}...
                  </Text>
                  <Ionicons name="add" size={16} color={COLORS.primaryPurple} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedCourses.length < 2 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="git-compare-outline" size={48} color={COLORS.secondaryText} />
            <Text style={styles.emptyTitle}>{t('selectCoursesToCompare')}</Text>
            <Text style={styles.emptyDesc}>
              Please select 2 or 3 courses above to see an in-depth side-by-side comparison of fees, entry criteria, duration, and accreditation.
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.matrixScroll}>
            <View style={styles.matrixContainer}>
              {/* Header Columns */}
              <View style={styles.matrixRowHeader}>
                {selectedCourses.map((course) => (
                  <View key={course.id} style={styles.matrixColumn}>
                    <TouchableOpacity
                      style={styles.removeCourseBtn}
                      onPress={() => removeCourse(course.id)}
                    >
                      <Ionicons name="close" size={14} color={COLORS.secondaryText} />
                    </TouchableOpacity>
                    <Badge label={course.qualificationType} variant="purple" />
                    <Text style={styles.matrixCourseName} numberOfLines={3}>
                      {isSinhala && course.sinhalaName ? course.sinhalaName : course.name}
                    </Text>
                    <Text style={styles.matrixInstName}>{course.institutionName}</Text>
                  </View>
                ))}
              </View>

              {/* Criterion: Total Fees */}
              <View style={styles.matrixSectionHeader}>
                <Text style={styles.matrixSectionTitle}>{t('totalFee')}</Text>
              </View>
              <View style={styles.matrixRow}>
                {selectedCourses.map((c) => (
                  <View key={c.id} style={styles.matrixCell}>
                    <Text style={styles.feeHighlight}>{formatCurrencyLKR(c.fees.totalFeeLKR)}</Text>
                    {c.fees.installmentAvailable && (
                      <Text style={styles.cellSubtext}>Installments Available</Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Criterion: Duration */}
              <View style={styles.matrixSectionHeader}>
                <Text style={styles.matrixSectionTitle}>{t('duration')}</Text>
              </View>
              <View style={styles.matrixRow}>
                {selectedCourses.map((c) => (
                  <View key={c.id} style={styles.matrixCell}>
                    <Text style={styles.cellMainText}>{c.duration}</Text>
                  </View>
                ))}
              </View>

              {/* Criterion: Study Mode */}
              <View style={styles.matrixSectionHeader}>
                <Text style={styles.matrixSectionTitle}>{t('mode')}</Text>
              </View>
              <View style={styles.matrixRow}>
                {selectedCourses.map((c) => (
                  <View key={c.id} style={styles.matrixCell}>
                    <Text style={styles.cellMainText}>{c.studyMode.join(', ')}</Text>
                  </View>
                ))}
              </View>

              {/* Criterion: Entry Requirements */}
              <View style={styles.matrixSectionHeader}>
                <Text style={styles.matrixSectionTitle}>{t('entryRequirements')}</Text>
              </View>
              <View style={styles.matrixRow}>
                {selectedCourses.map((c) => (
                  <View key={c.id} style={styles.matrixCell}>
                    {c.entryRequirements.alRequirement?.details && (
                      <Text style={styles.reqText}>
                        A/L: {c.entryRequirements.alRequirement.details}
                      </Text>
                    )}
                    {c.entryRequirements.olRequirement?.details && (
                      <Text style={[styles.reqText, { marginTop: 4 }]}>
                        O/L: {c.entryRequirements.olRequirement.details}
                      </Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Criterion: Accreditation */}
              <View style={styles.matrixSectionHeader}>
                <Text style={styles.matrixSectionTitle}>{t('accreditation')}</Text>
              </View>
              <View style={styles.matrixRow}>
                {selectedCourses.map((c) => (
                  <View key={c.id} style={styles.matrixCell}>
                    {c.accreditation.map((acc, aIdx) => (
                      <Text key={aIdx} style={styles.bulletText}>
                        • {acc}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>

              {/* Criterion: Career Outcomes */}
              <View style={styles.matrixSectionHeader}>
                <Text style={styles.matrixSectionTitle}>{t('careerProspects')}</Text>
              </View>
              <View style={styles.matrixRow}>
                {selectedCourses.map((c) => (
                  <View key={c.id} style={styles.matrixCell}>
                    {c.careerOpportunities.slice(0, 3).map((job, jIdx) => (
                      <Text key={jIdx} style={styles.bulletText}>
                        • {job}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>

              {/* Actions Row */}
              <View style={[styles.matrixRow, { marginTop: 16 }]}>
                {selectedCourses.map((c) => (
                  <View key={c.id} style={styles.matrixCell}>
                    <Button
                      title={t('viewDetails')}
                      variant="primary"
                      size="small"
                      onPress={() => navigation.navigate('CourseDetails', { courseId: c.id })}
                    />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
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
    padding: 16,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  addCourseCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addCourseTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginBottom: 8,
  },
  quickAddScroll: {
    gap: 8,
  },
  quickAddPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
  quickAddText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.darkNavy,
    marginRight: 4,
    maxWidth: 160,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginTop: 14,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
  },
  matrixScroll: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  matrixContainer: {
    padding: 16,
  },
  matrixRowHeader: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  matrixColumn: {
    width: 200,
    position: 'relative',
  },
  removeCourseBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixCourseName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 18,
  },
  matrixInstName: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '700',
  },
  matrixSectionHeader: {
    backgroundColor: COLORS.softGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 10,
    borderRadius: 8,
  },
  matrixSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: 12,
  },
  matrixCell: {
    width: 200,
    paddingHorizontal: 4,
  },
  feeHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  cellSubtext: {
    fontSize: 11,
    color: COLORS.success,
    marginTop: 2,
    fontWeight: '600',
  },
  cellMainText: {
    fontSize: 13,
    color: COLORS.darkNavy,
    fontWeight: '600',
  },
  reqText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    lineHeight: 16,
  },
  bulletText: {
    fontSize: 11,
    color: COLORS.darkNavy,
    lineHeight: 16,
    marginBottom: 2,
  },
});

export default CourseCompareScreen;
