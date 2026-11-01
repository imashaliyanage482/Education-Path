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
import { SLIATECourseCard } from '../components/sliate/SLIATECourseCard';
import { DropdownSelect, DropdownOption } from '../components/common/DropdownSelect';
import { useLiveCourses } from '../hooks/useLiveCourses';
import { syncInstitutionCourses } from '../utils/liveDataSync';
import {
  SLIATE_PROFILE,
  SLIATE_CATEGORIES,
  SLIATE_ATIS,
  SLIATE_VERIFIED_PROGRAMMES,
} from '../data/sliateData';
import { SLIATEProgramme, SLIATECategoryName } from '../types';
import { useTranslation } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface SLIATECoursesScreenProps {
  navigation: any;
}

export const SLIATECoursesScreen: React.FC<SLIATECoursesScreenProps> = ({ navigation }) => {
  const { isSinhala } = useTranslation();

  // Active Tab: Programmes vs 19 ATIs
  const [activeTab, setActiveTab] = useState<'programmes' | 'atis'>('programmes');

  // Search & Filter States (Default to null - No Auto-Fill)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStudyMode, setSelectedStudyMode] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Details Modal State
  const [selectedProgramme, setSelectedProgramme] = useState<SLIATEProgramme | null>(null);

  const liveCourses = useLiveCourses();
  const sliateProgrammes = useMemo(() => {
    return syncInstitutionCourses('SLIATE', SLIATE_VERIFIED_PROGRAMMES, liveCourses);
  }, [liveCourses]);

  // Dropdown Options strictly tailored for SLIATE
  const sliateCategoryOptions: DropdownOption[] = useMemo(() => {
    return SLIATE_CATEGORIES.map((cat) => ({
      value: cat.name,
      label: cat.name,
      labelSi: cat.nameSi,
    }));
  }, []);

  const sliateStudyModeOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'Full-time', label: 'Full-time (Weekday)', labelSi: 'සම්පූර්ණ කාලීන (සතියේ දින)' },
      { value: 'Part-time', label: 'Part-time (Weekend)', labelSi: 'අර්ධ කාලීන (සති අන්ත)' },
    ];
  }, []);

  const sliateDistrictOptions: DropdownOption[] = useMemo(() => {
    const set = new Set<string>();
    SLIATE_ATIS.forEach((a) => {
      if (a.district) set.add(a.district);
    });
    return Array.from(set).sort().map((d) => ({
      value: d,
      label: `${d} District (ATIs)`,
      labelSi: `${d} දිස්ත්‍රික්කය`,
    }));
  }, []);

  // Filter logic across all verified programmes
  const filteredProgrammes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sliateProgrammes.filter((prog) => {
      // 1. Search Query
      const matchesSearch =
        q.length === 0 ||
        (prog.name && prog.name.toLowerCase().includes(q)) ||
        (prog.sinhalaName && prog.sinhalaName.toLowerCase().includes(q)) ||
        (prog.code && prog.code.toLowerCase().includes(q)) ||
        (prog.category && prog.category.toLowerCase().includes(q)) ||
        (prog.description && prog.description.toLowerCase().includes(q));

      // 2. Category Filter
      const matchesCategory = selectedCategory ? prog.category === selectedCategory : true;

      // 3. Study Mode Filter
      let matchesMode = true;
      if (selectedStudyMode) {
        const sm = prog.studyMode || 'Full-time';
        matchesMode =
          sm.includes('Both') ||
          (selectedStudyMode.includes('Full-time') && sm.includes('Full-time')) ||
          (selectedStudyMode.includes('Part-time') && sm.includes('Part-time'));
      }

      // 4. District Filter
      let matchesDistrict = true;
      if (selectedDistrict) {
        const atis = prog.availableATIs || [];
        matchesDistrict = atis.some((atiName) =>
          atiName && atiName.toLowerCase().includes(selectedDistrict.toLowerCase())
        );
      }

      return matchesSearch && matchesCategory && matchesMode && matchesDistrict;
    });
  }, [sliateProgrammes, searchQuery, selectedCategory, selectedStudyMode, selectedDistrict]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== null ||
    selectedStudyMode !== null ||
    selectedDistrict !== null;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedStudyMode(null);
    setSelectedDistrict(null);
  };

  // Distinct districts from ATIs
  const atiDistricts = useMemo(() => {
    const set = new Set<string>();
    SLIATE_ATIS.forEach((a) => set.add(a.district));
    return ['All Districts', ...Array.from(set).sort()];
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header
        title="SLIATE Sri Lanka"
        subtitle="Advanced Technological Education"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. SLIATE Overview Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.sliateLogoBadge}>
              <Image
                source={require('../../assets/institutes/sliate_logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroHeaderText}>
              <Text style={styles.sliateShortName}>{SLIATE_PROFILE.shortName}</Text>
              <Text style={styles.sliateFullName}>
                {isSinhala ? SLIATE_PROFILE.nameSi : SLIATE_PROFILE.name}
              </Text>
            </View>
          </View>

          <Text style={styles.heroIntroText}>
            {isSinhala ? SLIATE_PROFILE.introductionSi : SLIATE_PROFILE.introduction}
          </Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>14</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'HND පාඨමාලා' : 'HND Programmes'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>19</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'ATI ආයතන' : 'ATI Institutes'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>NVQ 6</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'සුදුසුකම් මට්ටම' : 'Level Equivalent'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>1995</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'ස්ථාපිත වර්ෂය' : 'Established'}
              </Text>
            </View>
          </View>

          <View style={styles.heroBadgeRow}>
            <View style={styles.stateTag}>
              <Ionicons name="school" size={13} color={COLORS.primaryPurple} />
              <Text style={styles.stateTagText}>Statutory Authority (Act No. 29 of 1995)</Text>
            </View>
            <View style={styles.nvqTag}>
              <Ionicons name="ribbon" size={13} color={COLORS.modernBlue} />
              <Text style={styles.nvqTagText}>HNDA B.Com Degree Equivalent</Text>
            </View>
          </View>
        </View>

        {/* 2. Top Segment Switcher: HND Programmes vs 19 ATIs */}
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
              {isSinhala ? 'HND පාඨමාලා (Programmes)' : 'HND Programmes (14)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'atis' && styles.tabButtonActive]}
            onPress={() => setActiveTab('atis')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={15}
              color={activeTab === 'atis' ? COLORS.primaryPurple : COLORS.secondaryText}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'atis' && styles.tabButtonTextActive]}
            >
              {isSinhala ? 'ATI ආයතන 19 (ATIs)' : '19 ATI Institutes'}
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
                      ? 'HND නම, කේතය (HNDA, HNDIT) හෝ ක්ෂේත්‍රය සොයන්න...'
                      : 'Search HND programmes (e.g. HNDA, HNDIT, HNDE)...'
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

            {/* 4. SLIATE Dropdown Filters (No Auto-Fill, Strictly SLIATE-specific) */}
            <View style={styles.dropdownFiltersContainer}>
              <View style={styles.filterHeaderRow}>
                <View style={styles.filterTitleRow}>
                  <Ionicons name="options-outline" size={16} color={COLORS.primaryPurple} />
                  <Text style={styles.filterSectionTitle}>
                    {isSinhala ? 'SLIATE HND පාඨමාලා පෙරහන' : 'Filter SLIATE HND Programmes'}
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

              {/* HND Category Dropdown */}
              <DropdownSelect
                label={isSinhala ? 'HND අධ්‍යයන ක්ෂේත්‍රය (Field)' : 'HND Field / Category'}
                placeholder={isSinhala ? 'සියලු ක්ෂේත්‍ර (Select Field)' : 'All Fields (Select Field)'}
                selectedValue={selectedCategory}
                onSelect={setSelectedCategory}
                options={sliateCategoryOptions}
                iconName="school-outline"
                isSinhala={isSinhala}
              />

              {/* 2-Column: Study Mode + ATI District */}
              <View style={styles.dropdownTwoColRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <DropdownSelect
                    label={isSinhala ? 'හැදෑරීමේ මාදිලිය' : 'Study Mode'}
                    placeholder={isSinhala ? 'සියලු මාදිලි' : 'All Modes'}
                    selectedValue={selectedStudyMode}
                    onSelect={setSelectedStudyMode}
                    options={sliateStudyModeOptions}
                    iconName="time-outline"
                    isSinhala={isSinhala}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <DropdownSelect
                    label={isSinhala ? 'ATI දිස්ත්‍රික්කය' : 'ATI District'}
                    placeholder={isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts'}
                    selectedValue={selectedDistrict}
                    onSelect={setSelectedDistrict}
                    options={sliateDistrictOptions}
                    iconName="location-outline"
                    isSinhala={isSinhala}
                  />
                </View>
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
                  <SLIATECourseCard
                    key={programme.id}
                    programme={programme}
                    isSinhala={isSinhala}
                    onPress={() => setSelectedProgramme(programme)}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={COLORS.secondaryText} />
                  <Text style={styles.emptyTitle}>
                    {isSinhala ? 'ගැලපෙන පාඨමාලා හමු නොවීය' : 'No matching HND programmes found'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {isSinhala
                      ? 'කරුණාකර පෙරහන් වෙනස් කර නැවත උත්සාහ කරන්න.'
                      : 'Try clearing some filters or searching with a different keyword.'}
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
             19 ADVANCED TECHNOLOGICAL INSTITUTES (ATIs) DIRECTORY
             ========================================================================= */
          <View style={styles.atisSection}>
            <View style={styles.atisHeaderBox}>
              <Text style={styles.atisHeading}>
                {isSinhala ? 'උසස් තාක්ෂණ ආයතන (ATIs) 19 නාමාවලිය' : '19 Advanced Technological Institutes (ATIs)'}
              </Text>
              <Text style={styles.atisSubheading}>
                {isSinhala
                  ? 'දිවයින පුරා පිහිටි SLIATE උසස් තාක්ෂණ ආයතනවල ලිපිනයන්, දුරකථන අංක හා ක්‍රියාත්මක HND පාඨමාලා'
                  : 'Official directory of 19 ATIs across Sri Lanka with addresses, direct contact details, and available HND programmes.'}
              </Text>
            </View>

            <View style={styles.atisList}>
              {SLIATE_ATIS.map((ati) => (
                <View key={ati.id} style={styles.atiCard}>
                  {/* ATI Header */}
                  <View style={styles.atiHeaderRow}>
                    <View style={styles.atiIconBadge}>
                      <Ionicons name="business" size={20} color={COLORS.primaryPurple} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.atiName}>{ati.name}</Text>
                      <View style={styles.atiLocationRow}>
                        <Ionicons name="location-outline" size={12} color={COLORS.secondaryText} />
                        <Text style={styles.atiLocationText}>
                          {ati.location} • {ati.province}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.atiTypeBadge}>
                      <Text style={styles.atiTypeBadgeText}>{ati.type}</Text>
                    </View>
                  </View>

                  {/* Contact Info */}
                  <View style={styles.atiContactBox}>
                    <View style={styles.atiContactRow}>
                      <Ionicons name="map-outline" size={13} color={COLORS.secondaryText} />
                      <Text style={styles.atiContactText}>{ati.address}</Text>
                    </View>
                    <View style={styles.atiContactRow}>
                      <Ionicons name="call-outline" size={13} color={COLORS.primaryPurple} />
                      <Text style={[styles.atiContactText, { fontWeight: '700', color: COLORS.darkNavy }]}>
                        {ati.telephone}
                      </Text>
                    </View>
                    <View style={styles.atiContactRow}>
                      <Ionicons name="mail-outline" size={13} color={COLORS.modernBlue} />
                      <Text style={styles.atiContactText}>{ati.email}</Text>
                    </View>
                  </View>

                  {/* Offered HNDs */}
                  <View style={styles.atiProgrammesBox}>
                    <Text style={styles.atiProgrammesTitle}>
                      {isSinhala ? 'මෙම ATI හි පැවැත්වෙන HND පාඨමාලා:' : 'Available HND Programmes at this ATI:'}
                    </Text>
                    {ati.offeredProgrammes.map((p, pIdx) => (
                      <View key={pIdx} style={styles.atiProgItem}>
                        <Ionicons name="checkmark-circle" size={13} color={COLORS.primaryPurple} />
                        <Text style={styles.atiProgText}>{p}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={styles.atiActionsRow}>
                    <TouchableOpacity
                      style={styles.atiApplyBtn}
                      onPress={() => Linking.openURL('https://apply.sliate.ac.lk/')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.atiApplyBtnText}>Apply Online</Text>
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

      {/* Programme Details Modal */}
      {selectedProgramme && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalCategoryText}>{selectedProgramme.category}</Text>
                  <Text style={styles.modalCourseTitle}>
                    {isSinhala && selectedProgramme.sinhalaName
                      ? selectedProgramme.sinhalaName
                      : selectedProgramme.name}
                  </Text>
                  <Text style={styles.modalCodeText}>
                    Code: {selectedProgramme.code} • {selectedProgramme.qualificationType}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedProgramme(null)}
                  style={styles.modalCloseCircle}
                >
                  <Ionicons name="close" size={20} color={COLORS.darkNavy} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Badges Row */}
                <View style={styles.modalBadgesRow}>
                  <Badge label="NVQ Level 6 Equivalent" variant="purple" />
                  <Badge label={selectedProgramme.studyMode} variant="blue" />
                  <Badge label={selectedProgramme.duration} variant="warning" />
                  {selectedProgramme.isFree && <Badge label="FREE TUITION" variant="success" />}
                </View>

                {/* Qualification & Academic Profile */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'සුදුසුකම සහ ආයතනය' : 'Qualification & Awarding Body'}
                  </Text>
                  <Text style={[styles.detailBodyText, { fontWeight: '700', color: COLORS.darkNavy }]}>
                    🎓 {selectedProgramme.qualificationAwarded}
                  </Text>
                  <Text style={styles.detailBodyText}>
                    🏛️ Awarding Body: Sri Lanka Institute of Advanced Technological Education (SLIATE)
                  </Text>
                  <Text style={styles.detailBodyText}>
                    ⏱️ Academic Duration: {selectedProgramme.duration} ({selectedProgramme.academicDuration})
                  </Text>
                  {selectedProgramme.industrialTrainingDuration && (
                    <Text style={[styles.detailBodyText, { color: COLORS.primaryPurple, fontWeight: '700' }]}>
                      💼 Industrial Training: {selectedProgramme.industrialTrainingDuration}
                    </Text>
                  )}
                </View>

                {/* Course Fees & Financial Concessions */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පාඨමාලා ගාස්තු සහ සහන' : 'Course Fee & Financial Concessions'}
                  </Text>
                  <Text style={[styles.detailBodyText, { fontWeight: '700', color: COLORS.primaryPurple }]}>
                    💰 {selectedProgramme.courseFee}
                  </Text>
                  {selectedProgramme.registrationFee && (
                    <Text style={styles.detailBodyText}>
                      📝 Registration Fee: {selectedProgramme.registrationFee}
                    </Text>
                  )}
                  <Text style={styles.detailSubText}>
                    {isSinhala
                      ? 'පූර්ණකාලීන සිසුන් සඳහා පාඨමාලා ගාස්තු සම්පූර්ණයෙන්ම නොමිලේ (Free Tuition) වන අතර මහපොළ හා ශිෂ්‍යත්ව සඳහා සුදුසුකම් ලබයි. සති අන්ත / අර්ධකාලීන පාඨමාලා සඳහා සහනදායී ගාස්තුවක් අදාළ වේ.'
                      : 'Full-time courses are completely tuition-free (state-funded by Ministry of Education) and students are eligible for Mahapola & government bursaries. Nominal semester fees apply for part-time programmes.'}
                  </Text>
                </View>

                {/* Entry Requirements */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'ඇතුළත් වීමේ සුදුසුකම්' : 'Admission & Entry Requirements'}
                  </Text>
                  <Text style={styles.detailBodyText}>{selectedProgramme.entryRequirements}</Text>
                  {selectedProgramme.selectionProcedure && (
                    <Text style={[styles.detailSubText, { marginTop: 4, fontWeight: '600' }]}>
                      Selection Method: {selectedProgramme.selectionProcedure}
                    </Text>
                  )}
                </View>

                {/* Programme Overview */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පාඨමාලා හැඳින්වීම' : 'Programme Overview'}
                  </Text>
                  <Text style={styles.detailBodyText}>{selectedProgramme.description}</Text>
                </View>

                {/* Available ATIs */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'මෙම පාඨමාලාව පවත්වන ATI ආයතන' : `Conducted at ${selectedProgramme.availableATIs.length} ATIs Island-wide`}
                  </Text>
                  <View style={styles.availableATIsGrid}>
                    {selectedProgramme.availableATIs.map((ati, i) => (
                      <View key={i} style={styles.atiChip}>
                        <Ionicons name="location" size={11} color={COLORS.primaryPurple} />
                        <Text style={styles.atiChipText}>{ati}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Key Modules / Curriculum */}
                {selectedProgramme.curriculum && selectedProgramme.curriculum.length > 0 && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala ? 'ප්‍රධාන විෂය පථයන්' : 'Key Modules & Curriculum'}
                    </Text>
                    {selectedProgramme.curriculum.map((item, idx) => (
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
                      {isSinhala ? 'වෘත්තීය අවස්ථා' : 'Career Opportunities & Pathways'}
                    </Text>
                    {selectedProgramme.careerOpportunities.map((career, idx) => (
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
                      Source: {selectedProgramme.officialSourceUrl}
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      SLIATE Statutory Authority Act No. 29 of 1995 • Last Verified: {selectedProgramme.lastVerifiedAt}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalActionButtonsRow}>
                <TouchableOpacity
                  style={styles.openWebBtn}
                  onPress={() => Linking.openURL(selectedProgramme.applicationUrl)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="globe-outline" size={16} color={COLORS.white} />
                  <Text style={styles.openWebBtnText}>
                    {isSinhala ? 'නිල අයදුම්පත් පෝටලය' : 'Apply Online (apply.sliate.ac.lk)'}
                  </Text>
                  <Ionicons name="open-outline" size={13} color={COLORS.white} />
                </TouchableOpacity>

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

export default SLIATECoursesScreen;

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
  sliateLogoBadge: {
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
  sliateShortName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryPurple,
    letterSpacing: 0.5,
  },
  sliateFullName: {
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
  atisSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  atisHeaderBox: {
    marginBottom: 12,
  },
  atisHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  atisSubheading: {
    fontSize: 11.5,
    color: COLORS.secondaryText,
    marginTop: 3,
    lineHeight: 16,
  },
  atisList: {
    gap: 14,
  },
  atiCard: {
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
  atiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  atiIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atiName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  atiLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  atiLocationText: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '600',
  },
  atiTypeBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  atiTypeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  atiContactBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  atiContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  atiContactText: {
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
  },
  atiProgrammesBox: {
    backgroundColor: '#FAF8FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  atiProgrammesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  atiProgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  atiProgText: {
    fontSize: 11,
    color: '#334155',
  },
  atiActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  atiCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softLavender,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  atiCallBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  atiApplyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  atiApplyBtnText: {
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
  availableATIsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  atiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  atiChipText: {
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
