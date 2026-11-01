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
import { UoVTCourseCard } from '../components/uovt/UoVTCourseCard';
import { DropdownSelect, DropdownOption } from '../components/common/DropdownSelect';
import { useLiveCourses } from '../hooks/useLiveCourses';
import { syncInstitutionCourses } from '../utils/liveDataSync';
import {
  UOVT_PROFILE,
  UOVT_FACULTIES,
  UOVT_NVQ_FILTERS,
  UOVT_DEGREE_FILTERS,
  UOVT_STUDY_MODE_FILTERS,
  UOVT_CAMPUS_FILTERS,
  UOVT_SUBJECT_CATEGORIES,
  UOVT_UNIVERSITY_COLLEGES,
  UOVT_VERIFIED_PROGRAMMES,
} from '../data/uovtData';
import { UoVTProgramme, UoVTSubjectCategory } from '../types';
import { useTranslation } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface UoVTCoursesScreenProps {
  navigation: any;
}

export const UoVTCoursesScreen: React.FC<UoVTCoursesScreenProps> = ({ navigation }) => {
  const { isSinhala } = useTranslation();

  // Active Screen Tab: Programmes vs University Colleges
  const [activeTab, setActiveTab] = useState<'programmes' | 'colleges'>('programmes');

  // Search & Filter States (Default to null - No Auto-Fill)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedNVQLevel, setSelectedNVQLevel] = useState<string | null>(null);
  const [selectedStudyMode, setSelectedStudyMode] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);

  // Dropdown Options strictly for UoVT
  const uovtCategoryOptions: DropdownOption[] = useMemo(() => {
    return UOVT_SUBJECT_CATEGORIES.map((cat) => ({
      value: cat.name,
      label: cat.name,
      labelSi: cat.nameSi,
    }));
  }, []);

  const uovtFacultyOptions: DropdownOption[] = useMemo(() => {
    return UOVT_FACULTIES.map((fac) => ({
      value: fac,
      label: fac,
    }));
  }, []);

  const uovtNvqOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'NVQ Level 7', label: 'NVQ Level 7 (Bachelor Degree)', labelSi: 'NVQ මට්ටම 7 (උපාධි පාඨමාලා)' },
      { value: 'NVQ Level 6', label: 'NVQ Level 6 (Higher Diploma)', labelSi: 'NVQ මට්ටම 6 (උසස් ඩිප්ලෝමා)' },
      { value: 'NVQ Level 5', label: 'NVQ Level 5 (National Diploma)', labelSi: 'NVQ මට්ටම 5 (ඩිප්ලෝමා)' },
    ];
  }, []);

  const uovtStudyModeOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'Weekday', label: 'Weekday (Full-time)', labelSi: 'සතියේ දින (සම්පූර්ණ කාලීන)' },
      { value: 'Weekend', label: 'Weekend (Part-time)', labelSi: 'සති අන්ත (අර්ධ කාලීන)' },
    ];
  }, []);

  const uovtCampusOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'Main Campus', label: 'Main Campus (Ratmalana)', labelSi: 'ප්‍රධාන මණ්ඩපය (රත්මලාන)' },
      { value: 'University College', label: 'Affiliated University Colleges (6)', labelSi: 'අනුබද්ධ විශ්වවිද්‍යාල විද්‍යාල (6)' },
    ];
  }, []);

  // Modal Details State
  const [selectedProgramme, setSelectedProgramme] = useState<UoVTProgramme | null>(null);
  const [selectedModalLevel, setSelectedModalLevel] = useState<string>('');

  // Handle open modal
  const handleOpenDetails = (prog: UoVTProgramme) => {
    setSelectedProgramme(prog);
    if (prog.supportedLevels && prog.supportedLevels.length > 0) {
      setSelectedModalLevel(prog.supportedLevels[prog.supportedLevels.length - 1]); // default to highest level (Degree)
    } else {
      setSelectedModalLevel(prog.nvqLevel);
    }
  };

  const liveCourses = useLiveCourses();
  const uovtProgrammes = useMemo(() => {
    return syncInstitutionCourses('UoVT', UOVT_VERIFIED_PROGRAMMES, liveCourses);
  }, [liveCourses]);

  // Filter logic across all verified programmes
  const filteredProgrammes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return uovtProgrammes.filter((prog) => {
      // 1. Search Query
      const matchesSearch =
        q.length === 0 ||
        Boolean(prog.name && prog.name.toLowerCase().includes(q)) ||
        Boolean(prog.sinhalaName && prog.sinhalaName.toLowerCase().includes(q)) ||
        Boolean(prog.code && prog.code.toLowerCase().includes(q)) ||
        Boolean(prog.subjectCategory && prog.subjectCategory.toLowerCase().includes(q)) ||
        Boolean(prog.faculty && prog.faculty.toLowerCase().includes(q)) ||
        Boolean(prog.description && prog.description.toLowerCase().includes(q));

      // 2. Subject Category Filter
      const matchesCategory = selectedCategory ? prog.subjectCategory === selectedCategory : true;

      // 3. Faculty Filter
      const matchesFaculty = selectedFaculty ? prog.faculty === selectedFaculty : true;

      // 4. NVQ Level Filter
      let matchesNVQ = true;
      if (selectedNVQLevel) {
        matchesNVQ = Boolean(
          (prog.nvqLevel && prog.nvqLevel.includes(selectedNVQLevel)) ||
          (prog.supportedLevels && prog.supportedLevels.some((lvl) => lvl && lvl.includes(selectedNVQLevel))) ||
          (prog.qualificationType && prog.qualificationType.includes(selectedNVQLevel))
        );
      }

      // 5. Study Mode Filter
      let matchesMode = true;
      if (selectedStudyMode) {
        const sm = prog.studyMode || 'Weekday';
        matchesMode = sm.toLowerCase().includes(selectedStudyMode.toLowerCase()) || sm.includes('Both');
      }

      // 6. Campus / Location Filter
      let matchesCampus = true;
      if (selectedCampus) {
        if (selectedCampus.includes('Main Campus')) {
          matchesCampus = Boolean(prog.campus && (prog.campus.includes('Main Campus') || prog.campus.includes('Both')));
        } else if (selectedCampus.includes('University College')) {
          matchesCampus = Boolean(prog.campus && (prog.campus.includes('University Colleges') || prog.campus.includes('Both')));
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFaculty &&
        matchesNVQ &&
        matchesMode &&
        matchesCampus
      );
    });
  }, [
    uovtProgrammes,
    searchQuery,
    selectedCategory,
    selectedFaculty,
    selectedNVQLevel,
    selectedStudyMode,
    selectedCampus,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== null ||
    selectedFaculty !== null ||
    selectedNVQLevel !== null ||
    selectedStudyMode !== null ||
    selectedCampus !== null;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedFaculty(null);
    setSelectedNVQLevel(null);
    setSelectedStudyMode(null);
    setSelectedCampus(null);
  };

  // Active level detail derivation for open modal
  const activeLevelDetail = selectedProgramme?.levelDetails?.[selectedModalLevel];
  const currentDuration = activeLevelDetail?.duration || selectedProgramme?.duration;
  const currentAwarded =
    activeLevelDetail?.qualificationAwarded || selectedProgramme?.qualificationAwarded;
  const currentAwardingBody =
    activeLevelDetail?.awardingBody || 'University of Vocational Technology (UoVT)';
  const currentDelivery =
    activeLevelDetail?.deliveryLocation || selectedProgramme?.campus;
  const currentRequirements =
    activeLevelDetail?.entryRequirements || selectedProgramme?.entryRequirements;
  const currentModules =
    activeLevelDetail?.modules || selectedProgramme?.curriculum || selectedProgramme?.features || [];
  const currentFee =
    activeLevelDetail?.courseFee || selectedProgramme?.courseFee;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header
        title="UoVT Sri Lanka"
        subtitle="University of Vocational Technology"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. UoVT Overview Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.uovtLogoBadge}>
              <Image
                source={require('../../assets/institutes/uovt_logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroHeaderText}>
              <Text style={styles.uovtShortName}>{UOVT_PROFILE.shortName}</Text>
              <Text style={styles.uovtFullName}>
                {isSinhala ? UOVT_PROFILE.nameSi : UOVT_PROFILE.name}
              </Text>
            </View>
          </View>

          <Text style={styles.heroIntroText}>
            {isSinhala ? UOVT_PROFILE.introductionSi : UOVT_PROFILE.introduction}
          </Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>10+</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'උපාධි පාඨමාලා' : 'Degrees (NVQ 7)'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'පීඨ' : 'Faculties'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'විශ්වවිද්‍යාල විද්‍යාල' : 'University Colleges'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>NVQ 5–7</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'මට්ටම් පරාසය' : 'NVQ Levels'}
              </Text>
            </View>
          </View>

          {/* Legal and Accreditation Badges */}
          <View style={styles.heroBadgeRow}>
            <View style={styles.stateTag}>
              <Ionicons name="school" size={13} color={COLORS.primaryPurple} />
              <Text style={styles.stateTagText}>Statutory University (Act No. 31 of 2008)</Text>
            </View>
            <View style={styles.nvqTag}>
              <Ionicons name="ribbon" size={13} color={COLORS.modernBlue} />
              <Text style={styles.nvqTagText}>Accredited B.Tech & B.Eng.Tech Degrees</Text>
            </View>
          </View>
        </View>

        {/* 2. Top Segment Switcher: Programmes vs 6 University Colleges */}
        <View style={styles.tabSwitcherContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'programmes' && styles.tabButtonActive]}
            onPress={() => setActiveTab('programmes')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="book-outline"
              size={15}
              color={activeTab === 'programmes' ? COLORS.primaryPurple : COLORS.secondaryText}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'programmes' && styles.tabButtonTextActive]}
            >
              {isSinhala ? 'උපාධි හා ඩිප්ලෝමා (Programmes)' : 'Degree & Diploma Programmes'}
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
              {isSinhala ? 'විශ්වවිද්‍යාල විද්‍යාල (6 UCs)' : '6 Affiliated Colleges'}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'programmes' ? (
          <>
            {/* 3. Global Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchWrapper}>
                <Ionicons name="search" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={
                    isSinhala
                      ? 'උපාධිය, විෂය ක්ෂේත්‍රය හෝ පීඨය සොයන්න...'
                      : 'Search UoVT degrees, subjects, or faculties...'
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

            {/* 4. UoVT Dropdown Filters (No Auto-Fill, Strictly UoVT-specific) */}
            <View style={styles.dropdownFiltersContainer}>
              <View style={styles.filterHeaderRow}>
                <View style={styles.filterTitleRow}>
                  <Ionicons name="options-outline" size={16} color={COLORS.primaryPurple} />
                  <Text style={styles.filterSectionTitle}>
                    {isSinhala ? 'UoVT උපාධි පාඨමාලා පෙරහන' : 'Filter UoVT Programmes'}
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

              {/* Subject Category Dropdown */}
              <DropdownSelect
                label={isSinhala ? 'විෂය ක්ෂේත්‍රය (Subject Category)' : 'Subject Category'}
                placeholder={isSinhala ? 'සියලු ක්ෂේත්‍ර (Select Category)' : 'All Categories (Select Category)'}
                selectedValue={selectedCategory}
                onSelect={setSelectedCategory}
                options={uovtCategoryOptions}
                iconName="laptop-outline"
                isSinhala={isSinhala}
              />

              {/* Faculty Dropdown */}
              <DropdownSelect
                label={isSinhala ? 'පීඨය (Faculty)' : 'Faculty'}
                placeholder={isSinhala ? 'සියලු පීඨ (Select Faculty)' : 'All Faculties (Select Faculty)'}
                selectedValue={selectedFaculty}
                onSelect={setSelectedFaculty}
                options={uovtFacultyOptions}
                iconName="school-outline"
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
                    options={uovtNvqOptions}
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
                    options={uovtStudyModeOptions}
                    iconName="time-outline"
                    isSinhala={isSinhala}
                  />
                </View>
              </View>

              {/* Campus / Location Dropdown */}
              <DropdownSelect
                label={isSinhala ? 'මණ්ඩපය / විද්‍යාලය (Location)' : 'Campus / University College'}
                placeholder={isSinhala ? 'සියලු ස්ථාන (Select Location)' : 'All Locations (Select Location)'}
                selectedValue={selectedCampus}
                onSelect={setSelectedCampus}
                options={uovtCampusOptions}
                iconName="business-outline"
                isSinhala={isSinhala}
              />
            </View>

            {/* Informational Guidance Notice on NVQ vs Degree Distinction */}
            <View style={styles.guidanceNoticeCard}>
              <Ionicons name="information-circle" size={18} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.guidanceNoticeTitle}>
                  {isSinhala
                    ? 'UoVT උපාධි සහ විශ්වවිද්‍යාල විද්‍යාල සහතික අතර වෙනස'
                    : 'UoVT Degree vs University College Qualifications'}
                </Text>
                <Text style={styles.guidanceNoticeText}>
                  {isSinhala
                    ? 'UoVT ප්‍රධාන මණ්ඩපය විසින් පිරිනමනු ලබන්නේ NVQ Level 7 උපාධි (B.Tech / B.Eng.Tech / B.Ed) වේ. NVQ Level 5 (ඩිප්ලෝමා) සහ Level 6 (උසස් ඩිප්ලෝමා) පවත්වනු ලබන්නේ අනුබද්ධ විශ්වවිද්‍යාල විද්‍යාල (University Colleges) 6 මගිනි.'
                    : 'UoVT Main Campus directly awards NVQ Level 7 Bachelor Degrees (B.Tech, B.Eng.Tech, B.Ed). NVQ Level 5 & 6 HNDs are conducted via the 6 affiliated regional University Colleges as direct pathways to UoVT degrees.'}
                </Text>
              </View>
            </View>

            {/* 6. Filter Counter Bar */}
            <View style={styles.activeFilterStatusBox}>
              <Text style={styles.resultsCounterText}>
                {filteredProgrammes.length}{' '}
                {filteredProgrammes.length === 1 ? 'Programme Matched' : 'Programmes Matched'}
              </Text>
            </View>

            {/* 7. Programme Cards List */}
            <View style={styles.coursesContainer}>
              {filteredProgrammes.length > 0 ? (
                filteredProgrammes.map((programme) => (
                  <UoVTCourseCard
                    key={programme.id}
                    programme={programme}
                    isSinhala={isSinhala}
                    onPress={() => handleOpenDetails(programme)}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={COLORS.secondaryText} />
                  <Text style={styles.emptyTitle}>
                    {isSinhala ? 'ගැලපෙන පාඨමාලා හමු නොවීය' : 'No matching programmes found'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {isSinhala
                      ? 'කරුණාකර පෙරහන් වෙනස් කර නැවත උත්සාහ කරන්න.'
                      : 'Try clearing some filters or searching with a different degree keyword.'}
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
             AFFILIATED UNIVERSITY COLLEGES VIEW (Instruction 8)
             ========================================================================= */
          <View style={styles.collegesSection}>
            <View style={styles.collegesHeaderBox}>
              <Text style={styles.collegesHeading}>
                {isSinhala
                  ? 'UoVT අනුබද්ධ විශ්වවිද්‍යාල විද්‍යාල 6'
                  : '6 Regional University Colleges Affiliated with UoVT'}
              </Text>
              <Text style={styles.collegesSubheading}>
                {isSinhala
                  ? '2008 අංක 31 දරන වෘත්තීය තාක්ෂණ විශ්වවිද්‍යාල පනත යටතේ ස්ථාපිත NVQ Level 5 & Level 6 උසස් ජාතික ඩිප්ලෝමා (HND) පිරිනමන ප්‍රමුඛ රාජ්‍ය ආයතන'
                  : 'Established under University of Vocational Technology Act No. 31 of 2008, delivering NVQ Level 5 & 6 HND diplomas with pathways to UoVT Bachelor Degrees.'}
              </Text>
            </View>

            <View style={styles.collegesList}>
              {UOVT_UNIVERSITY_COLLEGES.map((uc, index) => (
                <View key={uc.id} style={styles.collegeCard}>
                  {/* College Header */}
                  <View style={styles.collegeHeaderRow}>
                    <View style={styles.collegeIconBadge}>
                      <Ionicons name="business" size={22} color={COLORS.primaryPurple} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.collegeName}>{uc.name}</Text>
                      <Text style={styles.collegeNameSi}>{uc.nameSi}</Text>
                      <View style={styles.collegeLocationRow}>
                        <Ionicons name="location-outline" size={12} color={COLORS.secondaryText} />
                        <Text style={styles.collegeLocationText}>
                          {uc.location} • {uc.province}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.collegeDescriptionText}>{uc.description}</Text>

                  {/* Available Programmes */}
                  <View style={styles.collegeProgrammesBox}>
                    <Text style={styles.collegeProgrammesTitle}>
                      {isSinhala ? 'පිරිනමන NVQ 5 & 6 ඩිප්ලෝමා පාඨමාලා:' : 'Available NVQ 5 & 6 Diplomas:'}
                    </Text>
                    {uc.availableProgrammes.map((p, pIdx) => (
                      <View key={pIdx} style={styles.collegeProgItem}>
                        <Ionicons name="checkmark-circle" size={13} color={COLORS.primaryPurple} />
                        <Text style={styles.collegeProgText}>{p}</Text>
                      </View>
                    ))}
                  </View>

                  {/* College Footer */}
                  <View style={styles.collegeFooterRow}>
                    <View style={styles.collegeBadge}>
                      <Text style={styles.collegeBadgeText}>NVQ Level 5 & 6 Accredited</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.collegeWebBtn}
                      onPress={() => Linking.openURL(uc.websiteUrl)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.collegeWebBtnText}>Visit College Portal</Text>
                      <Ionicons name="open-outline" size={12} color={COLORS.primaryPurple} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Programme Details Modal with Interactive Multi-Level NVQ Tabs */}
      {selectedProgramme && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalCategoryText}>
                    {selectedProgramme.subjectCategory} • {selectedProgramme.faculty}
                  </Text>
                  <Text style={styles.modalCourseTitle}>
                    {isSinhala && selectedProgramme.sinhalaName
                      ? selectedProgramme.sinhalaName
                      : selectedProgramme.name}
                  </Text>
                  {selectedProgramme.code && (
                    <Text style={styles.modalCodeText}>
                      Code: {selectedProgramme.code} • {selectedProgramme.degreeType || 'Degree Programme'}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedProgramme(null)}
                  style={styles.modalCloseCircle}
                >
                  <Ionicons name="close" size={20} color={COLORS.darkNavy} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Dynamic Multi-Level Selector Tabs inside the Modal Form (Instruction 4 & 10) */}
                {selectedProgramme.supportedLevels && selectedProgramme.supportedLevels.length > 1 && (
                  <View style={styles.modalLevelSelectorBox}>
                    <View style={styles.modalLevelSelectorHeader}>
                      <Ionicons name="layers-outline" size={15} color={COLORS.primaryPurple} />
                      <Text style={styles.modalLevelSelectorTitle}>
                        {isSinhala
                          ? 'සුදුසුකම් මට්ටම හා මාර්ගය තෝරන්න (Select Qualification Pathway):'
                          : 'Select Qualification Pathway to View Level Details:'}
                      </Text>
                    </View>
                    <View style={styles.modalLevelPillsRow}>
                      {selectedProgramme.supportedLevels.map((lvl) => {
                        const isLvlActive = selectedModalLevel === lvl;
                        return (
                          <TouchableOpacity
                            key={lvl}
                            style={[
                              styles.modalLevelPill,
                              isLvlActive && styles.modalLevelPillActive,
                            ]}
                            onPress={() => setSelectedModalLevel(lvl)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={isLvlActive ? 'checkmark-circle' : 'ribbon-outline'}
                              size={14}
                              color={isLvlActive ? COLORS.white : COLORS.primaryPurple}
                            />
                            <Text
                              style={[
                                styles.modalLevelPillText,
                                isLvlActive && styles.modalLevelPillTextActive,
                              ]}
                            >
                              {lvl}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Badges Row for Active Level */}
                <View style={styles.modalBadgesRow}>
                  <Badge label={selectedModalLevel || selectedProgramme.nvqLevel} variant="purple" />
                  <Badge label={selectedProgramme.qualificationType} variant="blue" />
                  <Badge label={selectedProgramme.studyMode} variant="gray" />
                  <Badge label={currentDuration || selectedProgramme.duration} variant="warning" />
                </View>

                {/* Qualification Awarded & Awarding Body */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පිරිනමන සුදුසුකම සහ ආයතනය' : 'Qualification Awarded & Body'}
                  </Text>
                  <Text style={[styles.detailBodyText, { fontWeight: '700', color: COLORS.darkNavy }]}>
                    🎓 {currentAwarded}
                  </Text>
                  <Text style={styles.detailBodyText}>
                    🏛️ Awarding Body: {currentAwardingBody}
                  </Text>
                  <Text style={styles.detailBodyText}>
                    📍 Delivery Location: {currentDelivery}
                  </Text>
                  <Text style={styles.detailBodyText}>
                    ⏱️ Duration: {currentDuration}
                  </Text>
                </View>

                {/* Course Fees & Financial Concessions */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පාඨමාලා ගාස්තු සහ සහන' : 'Course Fee & Financial Concessions'}
                  </Text>
                  <Text style={[styles.detailBodyText, { fontWeight: '700', color: COLORS.primaryPurple }]}>
                    💰 {currentFee}
                  </Text>
                  {selectedProgramme.registrationFee && (
                    <Text style={styles.detailBodyText}>
                      📝 Registration & Application Fee: {selectedProgramme.registrationFee}
                    </Text>
                  )}
                  <Text style={styles.detailSubText}>
                    {isSinhala
                      ? 'සතියේ දින පූර්ණකාලීන උපාධි පාඨමාලා රජයේ පූර්ණ අනුග්‍රහයෙන් නොමිලේ (Free Tuition) පවත්වනු ලබන අතර පරිපාලන ගාස්තු පමණක් අදාළ වේ. සති අන්ත පාඨමාලා රැකියා නියුක්තිකයින් සඳහා වාරික වශයෙන් ගෙවිය හැක.'
                      : 'Weekday full-time degrees are state-funded with free tuition (only administrative/facility fees apply). Weekend part-time courses for working professionals are payable in semester installments.'}
                  </Text>
                </View>

                {/* Entry Requirements for Selected Level */}
                {currentRequirements && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala
                        ? `${selectedModalLevel} ඇතුළත් වීමේ සුදුසුකම්`
                        : `Entry Requirements (${selectedModalLevel})`}
                    </Text>
                    <Text style={styles.detailBodyText}>{currentRequirements}</Text>
                  </View>
                )}

                {/* Accepted Prior Qualifications */}
                {selectedProgramme.acceptedPriorQualifications && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala ? 'පිළිගන්නා පෙර සුදුසුකම් (Accepted Pathways)' : 'Accepted Prior Qualifications'}
                    </Text>
                    {selectedProgramme.acceptedPriorQualifications.map((item, idx) => (
                      <View key={idx} style={styles.featureItemRow}>
                        <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.modernBlue} />
                        <Text style={styles.featureItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Programme Overview & Industrial Placement */}
                {selectedProgramme.description && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala ? 'පාඨමාලා හැඳින්වීම' : 'Programme Overview'}
                    </Text>
                    <Text style={styles.detailBodyText}>{selectedProgramme.description}</Text>
                    {selectedProgramme.industrialTrainingDuration && (
                      <View style={[styles.featureItemRow, { marginTop: 6 }]}>
                        <Ionicons name="briefcase-outline" size={14} color={COLORS.primaryPurple} />
                        <Text style={[styles.featureItemText, { fontWeight: '700', color: COLORS.primaryPurple }]}>
                          Industrial Training: {selectedProgramme.industrialTrainingDuration}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Key Modules / Practical Skills for Selected Level */}
                {currentModules && currentModules.length > 0 && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala
                        ? `${selectedModalLevel} ප්‍රධාන විෂය පථයන්`
                        : `Key Modules & Curriculum (${selectedModalLevel})`}
                    </Text>
                    {currentModules.map((item, idx) => (
                      <View key={idx} style={styles.featureItemRow}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.featureItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Career Opportunities */}
                {selectedProgramme.careerOpportunities && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala ? 'වෘත්තීය අවස්ථා (Career Opportunities)' : 'Career Opportunities'}
                    </Text>
                    {selectedProgramme.careerOpportunities.map((career, idx) => (
                      <View key={idx} style={styles.featureItemRow}>
                        <Ionicons name="arrow-forward-circle" size={14} color={COLORS.primaryPurple} />
                        <Text style={styles.featureItemText}>{career}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Official Source & Verification Date */}
                <View style={styles.sourceVerificationCard}>
                  <Ionicons name="shield-checkmark" size={18} color={COLORS.primaryPurple} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sourceVerificationTitle}>
                      Official UoVT Government Source Verified
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      Source: {selectedProgramme.officialSourceUrl}
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      Verified: {selectedProgramme.lastVerifiedAt} • University of Vocational Technology Act No. 31 of 2008
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalActionButtonsRow}>
                {selectedProgramme.applicationUrl && (
                  <TouchableOpacity
                    style={styles.openWebBtn}
                    onPress={() => Linking.openURL(selectedProgramme.applicationUrl)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="globe-outline" size={16} color={COLORS.white} />
                    <Text style={styles.openWebBtnText}>
                      {isSinhala ? 'නිල අයදුම්පත් පෝටලය' : 'Open Official Portal'}
                    </Text>
                    <Ionicons name="open-outline" size={13} color={COLORS.white} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setSelectedProgramme(null)}
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

export default UoVTCoursesScreen;

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
  uovtLogoBadge: {
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
  uovtShortName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryPurple,
    letterSpacing: 0.5,
  },
  uovtFullName: {
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
  guidanceNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  guidanceNoticeTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 2,
  },
  guidanceNoticeText: {
    fontSize: 11,
    color: '#1E3A8A',
    lineHeight: 16,
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
    width: 44,
    height: 44,
    borderRadius: 12,
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
    marginTop: 3,
  },
  collegeLocationText: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '600',
  },
  collegeDescriptionText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 10,
  },
  collegeProgrammesBox: {
    backgroundColor: '#FAF8FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  collegeProgrammesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  collegeProgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  collegeProgText: {
    fontSize: 11,
    color: '#334155',
  },
  collegeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  collegeBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  collegeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  collegeWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collegeWebBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryPurple,
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
  modalLevelSelectorBox: {
    backgroundColor: '#FAF8FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2DAFC',
  },
  modalLevelSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  modalLevelSelectorTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  modalLevelPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalLevelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    gap: 6,
  },
  modalLevelPillActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  modalLevelPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  modalLevelPillTextActive: {
    color: COLORS.white,
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
