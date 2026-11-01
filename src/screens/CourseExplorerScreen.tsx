import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { DropdownSelect, DropdownOption } from '../components/common/DropdownSelect';

interface CourseExplorerScreenProps {
  navigation: any;
  route: any;
}

const INSTITUTION_OPTIONS: DropdownOption[] = [
  { value: 'gov-inst-1', label: 'UoVT (Univ. of Vocational Technology)', labelSi: 'UoVT (වෘත්තීය තාක්ෂණ සරසවිය)' },
  { value: 'gov-inst-3', label: 'SLIATE (Advanced Tech Education)', labelSi: 'SLIATE (උසස් තාක්ෂණ අධ්‍යාපනය)' },
  { value: 'gov-inst-4', label: 'DTET (Technical Colleges)', labelSi: 'DTET (කාර්මික විද්‍යාල)' },
  { value: 'gov-inst-5', label: 'VTA (Vocational Training Authority)', labelSi: 'VTA (වෘත්තීය පුහුණු අධිකාරිය)' },
  { value: 'gov-inst-6', label: 'NVTI (Vocational Training Institutes)', labelSi: 'NVTI (ජාතික වෘත්තීය පුහුණු)' },
  { value: 'gov-inst-7', label: 'NAITA (Apprentice & Industrial Training)', labelSi: 'NAITA (ආධුනිකත්ව සහ කාර්මික පුහුණු)' },
  { value: 'gov-inst-9', label: 'CGTTI (German Tech Training Institute)', labelSi: 'CGTTI (ජර්මන් ටෙක්)' },
  { value: 'gov-inst-10', label: 'NYSC (National Youth Services Council)', labelSi: 'NYSC (ජාතික තරුණ සේවා)' },
];

const QUALIFICATION_OPTIONS: DropdownOption[] = [
  { value: 'Degree', label: 'Degree (Bachelor)', labelSi: 'උපාධි පාඨමාලා' },
  { value: 'Higher Diploma', label: 'Higher Diploma (HND)', labelSi: 'උසස් ජාතික ඩිප්ලෝමා (HND)' },
  { value: 'Diploma', label: 'Diploma (NVQ 5 / 6)', labelSi: 'ඩිප්ලෝමා පාඨමාලා' },
  { value: 'Certificate', label: 'Certificate (NVQ 3 / 4)', labelSi: 'සහතික පත්‍ර පාඨමාලා' },
];

const NVQ_OPTIONS: DropdownOption[] = [
  { value: 'NVQ Level 3', label: 'NVQ Level 3', labelSi: 'NVQ මට්ටම 3' },
  { value: 'NVQ Level 4', label: 'NVQ Level 4', labelSi: 'NVQ මට්ටම 4' },
  { value: 'NVQ Level 5', label: 'NVQ Level 5', labelSi: 'NVQ මට්ටම 5' },
  { value: 'NVQ Level 6', label: 'NVQ Level 6', labelSi: 'NVQ මට්ටම 6' },
  { value: 'NVQ Level 7', label: 'NVQ Level 7', labelSi: 'NVQ මට්ටම 7' },
];

export const CourseExplorerScreen: React.FC<CourseExplorerScreenProps> = ({ navigation, route }) => {
  const { t, isSinhala } = useTranslation();
  const initialQuery = route.params?.initialQuery || '';
  const initialLevel = route.params?.initialLevel && route.params.initialLevel !== 'All' ? route.params.initialLevel : null;
  const initialInstitutionId = route.params?.initialInstitutionId && route.params.initialInstitutionId !== 'All' ? route.params.initialInstitutionId : null;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [comparedCourseIds, setComparedCourseIds] = useState<string[]>([]);
  
  // No Auto-Fill: defaults to null
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(initialInstitutionId);
  const [selectedQualification, setSelectedQualification] = useState<string | null>(initialLevel);
  const [selectedNVQLevel, setSelectedNVQLevel] = useState<string | null>(null);

  const [activeFilters, setActiveFilters] = useState<CourseFilterParams>({
    searchQuery: initialQuery,
    level: initialLevel || 'All',
    institutionId: initialInstitutionId || 'All',
    nvqLevel: 'All',
    field: 'All',
    mode: 'All',
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await CourseService.getAllCourses({
        ...activeFilters,
        institutionId: selectedInstitution || 'All',
        level: (selectedQualification as any) || 'All',
        nvqLevel: selectedNVQLevel || 'All',
        searchQuery,
      });
      setCourses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [searchQuery, selectedInstitution, selectedQualification, selectedNVQLevel, activeFilters.field, activeFilters.mode])
  );

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
    searchQuery.trim().length > 0 ||
    selectedInstitution !== null ||
    selectedQualification !== null ||
    selectedNVQLevel !== null ||
    activeFilters.field !== 'All' ||
    activeFilters.mode !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedInstitution(null);
    setSelectedQualification(null);
    setSelectedNVQLevel(null);
    setActiveFilters({
      searchQuery: '',
      level: 'All',
      institutionId: 'All',
      nvqLevel: 'All',
      field: 'All',
      mode: 'All',
    });
  };

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

        {/* Dropdown Filters (No Auto-Fill) */}
        <View style={styles.dropdownFiltersContainer}>
          <View style={styles.filterHeaderRow}>
            <View style={styles.filterTitleRow}>
              <Ionicons name="options-outline" size={16} color={COLORS.primaryPurple} />
              <Text style={styles.filterSectionTitle}>
                {isSinhala ? 'පාඨමාලා පෙරහන (Filter Courses)' : 'Filter All Courses'}
              </Text>
            </View>
            {hasActiveFilters && (
              <TouchableOpacity onPress={handleClearFilters} style={styles.clearBtn} activeOpacity={0.7}>
                <Ionicons name="refresh" size={13} color={COLORS.danger} style={{ marginRight: 3 }} />
                <Text style={styles.clearBtnText}>
                  {isSinhala ? 'ඉවත් කරන්න' : 'Reset Filters'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Institution Dropdown */}
          <DropdownSelect
            label={isSinhala ? 'රාජ්‍ය ආයතනය (Institution)' : 'Government Institution'}
            placeholder={isSinhala ? 'සියලු ආයතන (Select Institute)' : 'All Institutions (Select Institute)'}
            selectedValue={selectedInstitution}
            onSelect={setSelectedInstitution}
            options={INSTITUTION_OPTIONS}
            iconName="business-outline"
            isSinhala={isSinhala}
          />

          {/* 2-Column: Qualification Type + NVQ Level */}
          <View style={styles.dropdownTwoColRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <DropdownSelect
                label={isSinhala ? 'සුදුසුකම් වර්ගය' : 'Qualification'}
                placeholder={isSinhala ? 'සියලු වර්ග' : 'All Qualifications'}
                selectedValue={selectedQualification}
                onSelect={setSelectedQualification}
                options={QUALIFICATION_OPTIONS}
                iconName="ribbon-outline"
                isSinhala={isSinhala}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <DropdownSelect
                label={isSinhala ? 'NVQ මට්ටම' : 'NVQ Level'}
                placeholder={isSinhala ? 'සියලු මට්ටම්' : 'All NVQ Levels'}
                selectedValue={selectedNVQLevel}
                onSelect={setSelectedNVQLevel}
                options={NVQ_OPTIONS}
                iconName="medal-outline"
                isSinhala={isSinhala}
              />
            </View>
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
  dropdownFiltersContainer: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  dropdownTwoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
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
