import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { SearchBar } from '../components/common/SearchBar';
import { CourseCard } from '../components/course/CourseCard';
import { FilterModal } from '../components/course/FilterModal';
import { Course, QualificationLevel, StudyField, StudyMode } from '../types';
import { CourseService, CourseFilterParams } from '../services/api';
import { useTranslation } from '../context/LanguageContext';

interface CourseExplorerScreenProps {
  navigation: any;
  route: any;
}

const QUALIFICATION_TYPES: (QualificationLevel | 'All')[] = [
  'All',
  'Degree',
  'Higher Diploma',
  'Diploma',
  'Certificate',
];

const NVQ_FILTER_LEVELS = [
  'All NVQ',
  'NVQ Level 3',
  'NVQ Level 4',
  'NVQ Level 5',
  'NVQ Level 6',
  'NVQ Level 7',
];

const INSTITUTION_CHIPS = [
  { label: 'All Institutes', id: 'All' },
  { label: 'UoVT', id: 'gov-inst-1' },
  { label: 'SLIATE', id: 'gov-inst-3' },
  { label: 'DTET', id: 'gov-inst-4' },
  { label: 'VTA', id: 'gov-inst-5' },
  { label: 'NVTI', id: 'gov-inst-6' },
  { label: 'NAITA', id: 'gov-inst-7' },
  { label: 'CGTTI', id: 'gov-inst-9' },
  { label: 'NYSC', id: 'gov-inst-10' },
];

export const CourseExplorerScreen: React.FC<CourseExplorerScreenProps> = ({ navigation, route }) => {
  const { t, isSinhala } = useTranslation();
  const initialQuery = route.params?.initialQuery || '';
  const initialLevel = route.params?.initialLevel || 'All';
  const initialInstitutionId = route.params?.initialInstitutionId || 'All';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [comparedCourseIds, setComparedCourseIds] = useState<string[]>([]);
  const [selectedNVQLevel, setSelectedNVQLevel] = useState<string>('All NVQ');

  const [activeFilters, setActiveFilters] = useState<CourseFilterParams>({
    searchQuery: initialQuery,
    level: initialLevel,
    institutionId: initialInstitutionId,
    nvqLevel: 'All',
    field: 'All',
    mode: 'All',
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await CourseService.getAllCourses({
        ...activeFilters,
        nvqLevel: selectedNVQLevel === 'All NVQ' ? 'All' : selectedNVQLevel,
        searchQuery,
      });
      setCourses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [searchQuery, activeFilters, selectedNVQLevel]);

  const handleSelectQualification = (level: QualificationLevel | 'All') => {
    setActiveFilters((prev) => ({ ...prev, level }));
  };

  const handleSelectInstitution = (instId: string) => {
    setActiveFilters((prev) => ({ ...prev, institutionId: instId }));
  };

  const toggleCompare = (courseId: string) => {
    if (comparedCourseIds.includes(courseId)) {
      setComparedCourseIds(comparedCourseIds.filter((id) => id !== courseId));
    } else {
      if (comparedCourseIds.length >= 3) {
        alert('You can compare a maximum of 3 courses at a time.');
        return;
      }
      setComparedCourseIds([...comparedCourseIds, courseId]);
    }
  };

  const handleNavigateToCompare = () => {
    navigation.navigate('CourseCompare', { courseIds: comparedCourseIds });
  };

  const hasActiveFilters =
    activeFilters.level !== 'All' ||
    activeFilters.field !== 'All' ||
    activeFilters.mode !== 'All' ||
    activeFilters.institutionId !== 'All' ||
    selectedNVQLevel !== 'All NVQ';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={t('explorerTitle')}
        subtitle={`${courses.length} ${t('totalCoursesFound')}`}
        showLanguageToggle={true}
        rightAction={
          comparedCourseIds.length > 0 ? (
            <TouchableOpacity
              onPress={handleNavigateToCompare}
              style={styles.floatingCompareBadge}
              activeOpacity={0.8}
            >
              <Ionicons name="git-compare" size={16} color={COLORS.white} />
              <Text style={styles.floatingCompareText}>
                {t('compare')} ({comparedCourseIds.length})
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.container}>
        {/* Search & Filter Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchPlaceholder')}
            onClear={() => setSearchQuery('')}
            onFilterPress={() => setFilterModalVisible(true)}
            hasActiveFilters={hasActiveFilters}
          />
        </View>

        {/* Top Description Banner */}
        <View style={styles.topDescriptionBanner}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primaryPurple} />
          <Text style={styles.topDescriptionText}>
            {isSinhala
              ? 'NVQ Level 3–7, ඩිප්ලෝමා, HND සහ උපාධි පාඨමාලා සියල්ල මෙහිදී පෙරහන් (Filter) කර බලන්න.'
              : 'Filter and explore accredited programmes by Qualification, NVQ Level (3–7), or Institution.'}
          </Text>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSectionContainer}>
          {/* Row 1: Qualification Filter Pills */}
          <View style={styles.filterRowBlock}>
            <Text style={styles.filterRowLabel}>Qualification</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {QUALIFICATION_TYPES.map((lvl) => {
                const isSelected = activeFilters.level === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    onPress={() => handleSelectQualification(lvl)}
                    style={[styles.quickPill, isSelected && styles.quickPillSelected]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickPillText, isSelected && styles.quickPillTextSelected]}>
                      {lvl === 'All' ? 'All Types' : lvl}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Row 2: NVQ Level Filter Pills */}
          <View style={styles.filterRowBlock}>
            <Text style={styles.filterRowLabel}>NVQ Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {NVQ_FILTER_LEVELS.map((nvq) => {
                const isSelected = selectedNVQLevel === nvq;
                return (
                  <TouchableOpacity
                    key={nvq}
                    onPress={() => setSelectedNVQLevel(nvq)}
                    style={[styles.nvqPill, isSelected && styles.nvqPillSelected]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.nvqPillText, isSelected && styles.nvqPillTextSelected]}>
                      {nvq}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Row 3: Institution Filter Pills */}
          <View style={[styles.filterRowBlock, { marginBottom: 4 }]}>
            <Text style={styles.filterRowLabel}>Institute</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {INSTITUTION_CHIPS.map((chip) => {
                const isSelected = activeFilters.institutionId === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    onPress={() => handleSelectInstitution(chip.id)}
                    style={[styles.instChip, isSelected && styles.instChipSelected]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.instChipText, isSelected && styles.instChipTextSelected]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Main Courses FlatList */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryPurple} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : (
          <FlatList
            data={courses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.coursesList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
                onCompareToggle={() => toggleCompare(item.id)}
                isCompared={comparedCourseIds.includes(item.id)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={COLORS.secondaryText} />
                <Text style={styles.emptyTitle}>No matching courses</Text>
                <Text style={styles.emptySubtitle}>{t('noCoursesFound')}</Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchQuery('');
                    setActiveFilters({ level: 'All', field: 'All', mode: 'All', institutionId: 'All' });
                  }}
                >
                  <Text style={styles.resetButtonText}>{t('reset')}</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={activeFilters}
        onApplyFilters={(newFilters) => setActiveFilters(newFilters)}
        onResetFilters={() =>
          setActiveFilters({ level: 'All', field: 'All', mode: 'All', institutionId: 'All' })
        }
      />
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
  searchContainer: {
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    paddingBottom: 4,
  },
  topDescriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
    gap: 8,
  },
  topDescriptionText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryPurple,
    lineHeight: 15,
  },
  filterSectionContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  filterRowBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  filterRowLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.darkNavy,
    width: 80,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  filterScroll: {
    gap: 6,
    paddingRight: 16,
  },
  quickPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: COLORS.softGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPillSelected: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },
  quickPillTextSelected: {
    color: COLORS.white,
  },
  nvqPill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  nvqPillSelected: {
    backgroundColor: COLORS.modernBlue,
    borderColor: COLORS.modernBlue,
  },
  nvqPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.modernBlue,
  },
  nvqPillTextSelected: {
    color: COLORS.white,
  },
  instChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  instChipSelected: {
    backgroundColor: COLORS.darkNavy,
    borderColor: COLORS.darkNavy,
  },
  instChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  instChipTextSelected: {
    color: COLORS.white,
  },
  coursesList: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  floatingCompareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 8,
  },
  floatingCompareText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 4,
  },
});

export default CourseExplorerScreen;
