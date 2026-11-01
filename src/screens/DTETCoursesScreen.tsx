import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Modal,
  TextInput,
  Linking,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { DTETCourseCard } from '../components/dtet/DTETCourseCard';
import { DropdownSelect, DropdownOption } from '../components/common/DropdownSelect';
import { useLiveCourses } from '../hooks/useLiveCourses';
import { syncInstitutionCourses } from '../utils/liveDataSync';
import {
  DTET_PROFILE,
  DTET_CATEGORIES,
  DTET_COLLEGES,
  DTET_VERIFIED_COURSES,
} from '../data/dtetData';
import { DTETCourse, DTETCategoryName } from '../types';
import { useTranslation } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface DTETCoursesScreenProps {
  navigation: any;
}

export const DTETCoursesScreen: React.FC<DTETCoursesScreenProps> = ({ navigation }) => {
  const { isSinhala } = useTranslation();

  // Active Tab: Courses vs Colleges
  const [activeTab, setActiveTab] = useState<'courses' | 'colleges'>('courses');

  // Search & Filter States (Default to null - No Auto-Fill)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNVQLevel, setSelectedNVQLevel] = useState<string | null>(null);
  const [selectedStudyMode, setSelectedStudyMode] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Details Modal State
  const [selectedCourse, setSelectedCourse] = useState<DTETCourse | null>(null);

  // Distinct districts from Colleges
  const dtetDistrictOptions: DropdownOption[] = useMemo(() => {
    const set = new Set<string>();
    DTET_COLLEGES.forEach((c) => set.add(c.district));
    return Array.from(set).sort().map((d) => ({
      value: d,
      label: `${d} District (Colleges)`,
      labelSi: `${d} දිස්ත්‍රික්කය`,
    }));
  }, []);

  const dtetCategoryOptions: DropdownOption[] = useMemo(() => {
    return DTET_CATEGORIES.map((cat) => ({
      value: cat.name,
      label: cat.name,
      labelSi: cat.nameSi,
    }));
  }, []);

  const dtetNvqOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'NVQ Level 5', label: 'NVQ Level 5 (National Diploma)', labelSi: 'NVQ මට්ටම 5 (ඩිප්ලෝමා)' },
      { value: 'NVQ Level 4', label: 'NVQ Level 4 (National Certificate)', labelSi: 'NVQ මට්ටම 4 (සහතිකය)' },
      { value: 'NVQ Level 3', label: 'NVQ Level 3 (National Certificate)', labelSi: 'NVQ මට්ටම 3 (සහතිකය)' },
    ];
  }, []);

  const dtetStudyModeOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'Full-time', label: 'Full-time (Day)', labelSi: 'සම්පූර්ණ කාලීන (දිනපතා)' },
      { value: 'Part-time', label: 'Part-time (Weekend/Evening)', labelSi: 'අර්ධ කාලීන (සති අන්ත/සවස)' },
    ];
  }, []);

  const liveCourses = useLiveCourses();
  const dtetCourses = useMemo(() => {
    return syncInstitutionCourses('DTET', DTET_VERIFIED_COURSES, liveCourses);
  }, [liveCourses]);

  // Filter logic across all verified DTET courses
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return dtetCourses.filter((course) => {
      // 1. Search Query
      const matchesSearch =
        q.length === 0 ||
        Boolean(course.name && course.name.toLowerCase().includes(q)) ||
        Boolean(course.sinhalaName && course.sinhalaName.toLowerCase().includes(q)) ||
        Boolean(course.code && course.code.toLowerCase().includes(q)) ||
        Boolean(course.category && course.category.toLowerCase().includes(q)) ||
        Boolean(course.description && course.description.toLowerCase().includes(q));

      // 2. Category Filter
      const matchesCategory = selectedCategory ? course.category === selectedCategory : true;

      // 3. NVQ Level Filter
      let matchesNVQ = true;
      if (selectedNVQLevel) {
        matchesNVQ = Boolean(course.nvqLevel && course.nvqLevel.includes(selectedNVQLevel));
      }

      // 4. Study Mode Filter
      let matchesMode = true;
      if (selectedStudyMode) {
        const sm = course.studyMode || 'Full-time';
        matchesMode =
          sm.includes('Both') ||
          (selectedStudyMode.includes('Full-time') && sm.includes('Full-time')) ||
          (selectedStudyMode.includes('Part-time') && sm.includes('Part-time'));
      }

      // 5. District Filter
      let matchesDistrict = true;
      if (selectedDistrict) {
        const colleges = course.trainingColleges || [];
        matchesDistrict =
          colleges.some((colName) =>
            colName && colName.toLowerCase().includes(selectedDistrict.toLowerCase())
          ) ||
          colleges.some((colName) => colName && colName.toLowerCase().includes('all 39'));
      }

      return matchesSearch && matchesCategory && matchesNVQ && matchesMode && matchesDistrict;
    });
  }, [dtetCourses, searchQuery, selectedCategory, selectedNVQLevel, selectedStudyMode, selectedDistrict]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== null ||
    selectedNVQLevel !== null ||
    selectedStudyMode !== null ||
    selectedDistrict !== null;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedNVQLevel(null);
    setSelectedStudyMode(null);
    setSelectedDistrict(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header
        title="DTET Sri Lanka"
        subtitle="Technical Education & Training"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. DTET Overview Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.dtetLogoBadge}>
              <Image
                source={require('../../assets/institutes/dtet_logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroHeaderText}>
              <Text style={styles.dtetShortName}>{DTET_PROFILE.shortName}</Text>
              <Text style={styles.dtetFullName}>
                {isSinhala ? DTET_PROFILE.nameSi : DTET_PROFILE.name}
              </Text>
            </View>
          </View>

          <Text style={styles.heroIntroText}>
            {isSinhala ? DTET_PROFILE.introductionSi : DTET_PROFILE.introduction}
          </Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>23+</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'සත්‍යාපිත පාඨමාලා' : 'Courses'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>39</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'තාක්ෂණ විද්‍යාල' : 'Colleges'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>NVQ 3–5</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'නිපුණතා මට්ටම්' : 'NVQ Levels'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>1893</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'පුරෝගාමී වර්ෂය' : 'Established'}
              </Text>
            </View>
          </View>

          <View style={styles.heroBadgeRow}>
            <View style={styles.stateTag}>
              <Ionicons name="school" size={13} color={COLORS.primaryPurple} />
              <Text style={styles.stateTagText}>Pioneer of Technical Education (Est. 1893)</Text>
            </View>
            <View style={styles.nvqTag}>
              <Ionicons name="ribbon" size={13} color={COLORS.modernBlue} />
              <Text style={styles.nvqTagText}>Free Tuition + Monthly Bursary Allowance</Text>
            </View>
          </View>
        </View>

        {/* 2. Top Segment Switcher: Courses vs 39 Colleges */}
        <View style={styles.tabSwitcherContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'courses' && styles.tabButtonActive]}
            onPress={() => setActiveTab('courses')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="construct-outline"
              size={15}
              color={activeTab === 'courses' ? COLORS.primaryPurple : COLORS.secondaryText}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'courses' && styles.tabButtonTextActive]}
            >
              {isSinhala ? 'කාර්මික පාඨමාලා (Courses)' : 'Technical Courses'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'colleges' && styles.tabButtonActive]}
            onPress={() => setActiveTab('colleges')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={15}
              color={activeTab === 'colleges' ? COLORS.primaryPurple : COLORS.secondaryText}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'colleges' && styles.tabButtonTextActive]}
            >
              {isSinhala ? 'කාර්මික විද්‍යාල 39 (Colleges)' : '39 Technical Colleges'}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'courses' ? (
          <>
            {/* 3. Global Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchWrapper}>
                <Ionicons name="search" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={
                    isSinhala
                      ? 'පාඨමාලා නම, කේතය හෝ ක්ෂේත්‍රය සොයන්න...'
                      : 'Search DTET courses, trades, or NVQ levels...'
                  }
                  placeholderTextColor={COLORS.secondaryText}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.secondaryText} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 4. DTET Dropdown Filters (No Auto-Fill, Strictly DTET-specific) */}
            <View style={styles.dropdownFiltersContainer}>
              <View style={styles.filterHeaderRow}>
                <View style={styles.filterTitleRow}>
                  <Ionicons name="options-outline" size={16} color={COLORS.primaryPurple} />
                  <Text style={styles.filterSectionTitle}>
                    {isSinhala ? 'DTET කාර්මික පාඨමාලා පෙරහන' : 'Filter DTET Courses'}
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

              {/* Trade Sector Dropdown */}
              <DropdownSelect
                label={isSinhala ? 'වෘත්තීය ක්ෂේත්‍රය (Trade Sector)' : 'Trade Category'}
                placeholder={isSinhala ? 'සියලු ක්ෂේත්‍ර (Select Sector)' : 'All Sectors (Select Sector)'}
                selectedValue={selectedCategory}
                onSelect={setSelectedCategory}
                options={dtetCategoryOptions}
                iconName="construct-outline"
                isSinhala={isSinhala}
              />

              {/* 2-Column: NVQ Level + Study Mode */}
              <View style={styles.dropdownTwoColRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <DropdownSelect
                    label={isSinhala ? 'NVQ මට්ටම' : 'NVQ Level'}
                    placeholder={isSinhala ? 'සියලු මට්ටම්' : 'All Levels'}
                    selectedValue={selectedNVQLevel}
                    onSelect={setSelectedNVQLevel}
                    options={dtetNvqOptions}
                    iconName="ribbon-outline"
                    isSinhala={isSinhala}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <DropdownSelect
                    label={isSinhala ? 'හැදෑරීමේ මාදිලිය' : 'Study Mode'}
                    placeholder={isSinhala ? 'සියලු මාදිලි' : 'All Modes'}
                    selectedValue={selectedStudyMode}
                    onSelect={setSelectedStudyMode}
                    options={dtetStudyModeOptions}
                    iconName="time-outline"
                    isSinhala={isSinhala}
                  />
                </View>
              </View>

              {/* College District Dropdown */}
              <DropdownSelect
                label={isSinhala ? 'විද්‍යාල දිස්ත්‍රික්කය' : 'College District'}
                placeholder={isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts'}
                selectedValue={selectedDistrict}
                onSelect={setSelectedDistrict}
                options={dtetDistrictOptions}
                iconName="location-outline"
                isSinhala={isSinhala}
              />
            </View>

            {/* 6. Filter Counter Bar */}
            <View style={styles.activeFilterStatusBox}>
              <Text style={styles.resultsCounterText}>
                {filteredCourses.length}{' '}
                {filteredCourses.length === 1 ? 'Course Matched' : 'Courses Matched'}
              </Text>
            </View>

            {/* 7. Course Cards List */}
            <View style={styles.coursesContainer}>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <DTETCourseCard
                    key={course.id}
                    course={course}
                    isSinhala={isSinhala}
                    onPress={() => setSelectedCourse(course)}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={COLORS.secondaryText} />
                  <Text style={styles.emptyTitle}>
                    {isSinhala ? 'ගැලපෙන පාඨමාලා හමු නොවීය' : 'No matching DTET courses found'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {isSinhala
                      ? 'කරුණාකර පෙරහන් වෙනස් කර නැවත උත්සාහ කරන්න.'
                      : 'Try clearing some filters or searching with a different trade keyword.'}
                  </Text>
                  <TouchableOpacity style={styles.emptyResetBtn} onPress={handleClearFilters}>
                    <Text style={styles.emptyResetBtnText}>
                      {isSinhala ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Clear All Filters'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        ) : (
          /* =========================================================================
             39 TECHNICAL COLLEGES & COTs DIRECTORY
             ========================================================================= */
          <View style={styles.collegesSection}>
            <View style={styles.collegesHeaderBox}>
              <Text style={styles.collegesHeading}>
                {isSinhala ? 'තාක්ෂණ හා කාර්මික විද්‍යාල 39 නාමාවලිය' : '39 Technical Colleges & COTs Directory'}
              </Text>
              <Text style={styles.collegesSubheading}>
                {isSinhala
                  ? 'දිවයිනේ පළාත් 9ම ආවරණය වන ප්‍රමුඛ තාක්ෂණ විද්‍යාල 9ක් (COTs) සහ ප්‍රාදේශීය කාර්මික විද්‍යාල 30ක තොරතුරු'
                  : 'Directory of 9 Provincial Apex Colleges of Technology (COTs) and 30 regional Technical Colleges across Sri Lanka.'}
              </Text>
            </View>

            <View style={styles.collegesList}>
              {DTET_COLLEGES.map((college) => (
                <View key={college.id} style={styles.collegeCard}>
                  {/* Header */}
                  <View style={styles.collegeHeaderRow}>
                    <View style={styles.collegeIconBadge}>
                      <Ionicons
                        name={college.type === 'College of Technology' ? 'school' : 'construct'}
                        size={20}
                        color={COLORS.primaryPurple}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.collegeName}>{college.name}</Text>
                      {college.sinhalaName && (
                        <Text style={styles.collegeNameSi}>{college.sinhalaName}</Text>
                      )}
                      <View style={styles.collegeLocationRow}>
                        <Ionicons name="location-outline" size={12} color={COLORS.secondaryText} />
                        <Text style={styles.collegeLocationText}>
                          {college.district} District • {college.province}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.collegeTypeBadge,
                        college.type === 'College of Technology' && styles.cotBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.collegeTypeBadgeText,
                          college.type === 'College of Technology' && styles.cotBadgeText,
                        ]}
                      >
                        {college.type === 'College of Technology' ? 'COT (Diploma)' : 'Technical College'}
                      </Text>
                    </View>
                  </View>

                  {/* Contact Details */}
                  <View style={styles.collegeContactBox}>
                    <View style={styles.collegeContactRow}>
                      <Ionicons name="map-outline" size={13} color={COLORS.secondaryText} />
                      <Text style={styles.collegeContactText}>{college.address}</Text>
                    </View>
                    <View style={styles.collegeContactRow}>
                      <Ionicons name="call-outline" size={13} color={COLORS.primaryPurple} />
                      <Text style={[styles.collegeContactText, { fontWeight: '700', color: COLORS.darkNavy }]}>
                        {college.telephone}
                      </Text>
                    </View>
                  </View>

                  {/* Available Courses */}
                  <View style={styles.collegeCoursesBox}>
                    <Text style={styles.collegeCoursesTitle}>
                      {isSinhala ? 'පිරිනමනු ලබන ප්‍රධාන පාඨමාලා:' : 'Available Courses at this College:'}
                    </Text>
                    {college.availableCourses.map((c, cIdx) => (
                      <View key={cIdx} style={styles.collegeCourseItem}>
                        <Ionicons name="checkmark-circle" size={13} color={COLORS.primaryPurple} />
                        <Text style={styles.collegeCourseText}>{c}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={styles.collegeActionsRow}>
                    <TouchableOpacity
                      style={styles.collegeApplyBtn}
                      onPress={() => Linking.openURL('https://mis.dtet.gov.lk/')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.collegeApplyBtnText}>Apply (mis.dtet.gov.lk)</Text>
                      <Ionicons name="open-outline" size={12} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Course Details Modal */}
      {selectedCourse && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalCategoryText}>{selectedCourse.category}</Text>
                  <Text style={styles.modalCourseTitle}>
                    {isSinhala && selectedCourse.sinhalaName
                      ? selectedCourse.sinhalaName
                      : selectedCourse.name}
                  </Text>
                  <Text style={styles.modalCodeText}>
                    Code: {selectedCourse.code} • {selectedCourse.qualificationType}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedCourse(null)}
                  style={styles.modalCloseCircle}
                >
                  <Ionicons name="close" size={20} color={COLORS.darkNavy} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Badges Row */}
                <View style={styles.modalBadgesRow}>
                  <Badge label={selectedCourse.nvqLevel} variant="purple" />
                  <Badge label={selectedCourse.qualificationType} variant="blue" />
                  <Badge label={selectedCourse.studyMode} variant="gray" />
                  {selectedCourse.isFree && <Badge label="FREE TUITION" variant="success" />}
                </View>

                {/* Course Overview & Statutory Profile */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'සුදුසුකම සහ ආයතනය' : 'Qualification & Awarding Body'}
                  </Text>
                  <Text style={[styles.detailBodyText, { fontWeight: '700', color: COLORS.darkNavy }]}>
                    🛠️ {selectedCourse.name} ({selectedCourse.nvqLevel})
                  </Text>
                  <Text style={styles.detailBodyText}>
                    🏛️ Awarding Body: Department of Technical Education and Training (DTET, Est. 1893)
                  </Text>
                  <Text style={styles.detailBodyText}>
                    ⏱️ Duration: {selectedCourse.duration}
                  </Text>
                </View>

                {/* Course Fees & Allowances */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පාඨමාලා ගාස්තු සහ ශිෂ්‍යාධාර' : 'Course Fee & Government Allowances'}
                  </Text>
                  <Text style={[styles.detailBodyText, { fontWeight: '700', color: COLORS.primaryPurple }]}>
                    💰 {selectedCourse.courseFee}
                  </Text>
                  <Text style={styles.detailSubText}>
                    {isSinhala
                      ? 'පූර්ණකාලීන සිසුන් සඳහා පාඨමාලා ගාස්තු සම්පූර්ණයෙන්ම නොමිලේ (Free Tuition) වන අතර සුදුසුකම් ලබන අඩු ආදායම්ලාභී පවුල්වල සිසුන් සඳහා මසකට රු. 7,500ක් දක්වා රජයේ මාසික පැමිණීමේ දීමනා සහ ප්‍රවාහන වාර ප්‍රවේශපත්‍ර සහන හිමිවේ.'
                      : 'Full-time courses are completely free of charge. Eligible students receive monthly government attendance bursary allowances of up to Rs. 7,500/month along with subsidized railway and bus transport season tickets.'}
                  </Text>
                </View>

                {/* Entry Requirements */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'ඇතුළත් වීමේ සුදුසුකම්' : 'Entry Requirements'}
                  </Text>
                  <Text style={styles.detailBodyText}>{selectedCourse.entryRequirements}</Text>
                </View>

                {/* Course Description */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පාඨමාලා හැඳින්වීම' : 'Course Overview'}
                  </Text>
                  <Text style={styles.detailBodyText}>{selectedCourse.description}</Text>
                </View>

                {/* Training Colleges */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'මෙම පාඨමාලාව පවත්වන විද්‍යාල' : 'Conducting Colleges of Technology'}
                  </Text>
                  <View style={styles.collegesChipsRow}>
                    {selectedCourse.trainingColleges.map((col, idx) => (
                      <View key={idx} style={styles.collegeChip}>
                        <Ionicons name="business" size={11} color={COLORS.primaryPurple} />
                        <Text style={styles.collegeChipText}>{col}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Key Modules / Curriculum */}
                {selectedCourse.curriculum && selectedCourse.curriculum.length > 0 && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala ? 'ප්‍රධාන විෂය පථයන් සහ කුසලතා' : 'Key Modules & Practical Skills'}
                    </Text>
                    {selectedCourse.curriculum.map((item, idx) => (
                      <View key={idx} style={styles.featureItemRow}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.featureItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Career Opportunities */}
                {selectedCourse.careerOpportunities && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala ? 'වෘත්තීය අවස්ථා' : 'Career Opportunities'}
                    </Text>
                    {selectedCourse.careerOpportunities.map((career, idx) => (
                      <View key={idx} style={styles.featureItemRow}>
                        <Ionicons name="arrow-forward-circle" size={14} color={COLORS.primaryPurple} />
                        <Text style={styles.featureItemText}>{career}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Statutory Verification Box */}
                <View style={styles.sourceVerificationCard}>
                  <Ionicons name="shield-checkmark" size={18} color={COLORS.primaryPurple} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sourceVerificationTitle}>
                      Official Government Source Verified
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      Source: {selectedCourse.officialSourceUrl}
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      Department of Technical Education and Training (DTET) • Last Verified: {selectedCourse.lastVerifiedAt}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalActionButtonsRow}>
                <TouchableOpacity
                  style={styles.openWebBtn}
                  onPress={() => Linking.openURL(selectedCourse.applicationUrl)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="globe-outline" size={16} color={COLORS.white} />
                  <Text style={styles.openWebBtnText}>
                    {isSinhala ? 'නිල අයදුම්පත් පෝටලය' : 'Apply Online (mis.dtet.gov.lk)'}
                  </Text>
                  <Ionicons name="open-outline" size={13} color={COLORS.white} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setSelectedCourse(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeModalBtnText}>
                    {isSinhala ? 'වසන්න' : 'Close'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default DTETCoursesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.softGray,
  },
  container: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2DAFC',
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dtetLogoBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 3,
  },
  heroHeaderText: {
    flex: 1,
  },
  dtetShortName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryPurple,
    letterSpacing: 0.5,
  },
  dtetFullName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginTop: 1,
  },
  heroIntroText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8F6FF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.secondaryText,
    marginTop: 2,
    textAlign: 'center',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stateTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginLeft: 4,
  },
  nvqTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nvqTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.modernBlue,
    marginLeft: 4,
  },
  tabSwitcherContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.softLavender,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  tabButtonTextActive: {
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  searchSection: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.darkNavy,
  },
  dropdownFiltersContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
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
  dropdownTwoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  categoryFilterSection: {
    marginTop: 12,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  categoryPillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkNavy,
  },
  categoryPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  filterSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
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
  nvqScrollList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  nvqPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.softGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nvqPillSelected: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  nvqPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },
  nvqPillTextSelected: {
    color: COLORS.white,
  },
  districtPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 4,
  },
  districtPillSelected: {
    backgroundColor: COLORS.darkNavy,
    borderColor: COLORS.darkNavy,
  },
  districtPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  districtPillTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  activeFilterStatusBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },
  coursesContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyResetBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.softLavender,
    borderRadius: 8,
  },
  emptyResetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  collegesSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  collegesHeaderBox: {
    marginBottom: 12,
  },
  collegesHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  collegesSubheading: {
    fontSize: 11.5,
    color: COLORS.secondaryText,
    marginTop: 3,
    lineHeight: 16,
  },
  collegesList: {
    gap: 14,
  },
  collegeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  collegeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  collegeIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collegeName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  collegeNameSi: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 1,
  },
  collegeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  collegeLocationText: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '600',
  },
  collegeTypeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  collegeTypeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  cotBadge: {
    backgroundColor: '#EDE9FE',
  },
  cotBadgeText: {
    color: COLORS.primaryPurple,
  },
  collegeContactBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  collegeContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collegeContactText: {
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
  },
  collegeCoursesBox: {
    backgroundColor: '#FAF8FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  collegeCoursesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  collegeCourseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  collegeCourseText: {
    fontSize: 11,
    color: '#334155',
  },
  collegeActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  collegeCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softLavender,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  collegeCallBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  collegeApplyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  collegeApplyBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  detailsModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalCategoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  modalCourseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginTop: 2,
    lineHeight: 22,
  },
  modalCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondaryText,
    marginTop: 3,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollBody: {
    padding: 18,
  },
  modalBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  detailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailSectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  detailBodyText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 3,
  },
  detailSubText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    lineHeight: 16,
    marginTop: 4,
  },
  collegesChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  collegeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  collegeChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  featureItemText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  sourceVerificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.softLavender,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  sourceVerificationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  sourceVerificationSub: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 14,
  },
  modalActionButtonsRow: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: 'row',
    gap: 10,
  },
  openWebBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  openWebBtnText: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  closeModalBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softGray,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeModalBtnText: {
    color: COLORS.darkNavy,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
