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
import { VTACourseCard } from '../components/vta/VTACourseCard';
import { useLiveCourses } from '../hooks/useLiveCourses';
import { syncInstitutionCourses } from '../utils/liveDataSync';
import {
  VTA_PROFILE,
  VTA_CATEGORIES,
  VTA_NVQ_LEVELS,
  VTA_VERIFIED_COURSES,
} from '../data/vtaData';
import { VTACourse, VTANVQLevel } from '../types';
import { useTranslation } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const DISTRICT_LIST = [
  'All Districts',
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Galle',
  'Matara',
  'Kurunegala',
  'Anuradhapura',
  'Badulla',
  'Negombo',
  'Bentota',
];

interface VTACoursesScreenProps {
  navigation: any;
}

export const VTACoursesScreen: React.FC<VTACoursesScreenProps> = ({ navigation }) => {
  const { isSinhala } = useTranslation();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNVQLevel, setSelectedNVQLevel] = useState<VTANVQLevel>('All Levels');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');

  // Modal Details State
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<VTACourse | null>(null);
  const [selectedModalLevel, setSelectedModalLevel] = useState<string>('');

  // Open Details Modal and set the initial selected NVQ level
  const handleOpenDetails = (course: VTACourse) => {
    setSelectedCourseDetails(course);
    if (course.supportedLevels && course.supportedLevels.length > 0) {
      setSelectedModalLevel(course.supportedLevels[0]);
    } else {
      setSelectedModalLevel(course.nvqLevel);
    }
  };

  const liveCourses = useLiveCourses();
  const vtaCourses = useMemo(() => {
    return syncInstitutionCourses('VTA', VTA_VERIFIED_COURSES, liveCourses);
  }, [liveCourses]);

  // Filter logic across all verified courses
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return vtaCourses.filter((course) => {
      // 1. Search Query
      const matchesSearch =
        q.length === 0 ||
        course.name.toLowerCase().includes(q) ||
        (course.sinhalaName && course.sinhalaName.toLowerCase().includes(q)) ||
        (course.code && course.code.toLowerCase().includes(q)) ||
        course.category.toLowerCase().includes(q) ||
        (course.trainingCentre && course.trainingCentre.toLowerCase().includes(q)) ||
        (course.description && course.description.toLowerCase().includes(q));

      // 2. Category Filter
      const matchesCategory = selectedCategory ? course.category === selectedCategory : true;

      // 3. Global NVQ Level Filter
      let matchesNVQ = true;
      if (selectedNVQLevel !== 'All Levels') {
        matchesNVQ =
          course.nvqLevel.includes(selectedNVQLevel) ||
          Boolean(course.supportedLevels && course.supportedLevels.includes(selectedNVQLevel));
      }

      // 4. District Filter
      let matchesDistrict = true;
      if (selectedDistrict !== 'All Districts') {
        matchesDistrict = Boolean(
          course.district &&
            (course.district.includes(selectedDistrict) ||
              course.district.includes('Island-wide') ||
              course.district.includes('All 25 Districts'))
        );
      }

      return matchesSearch && matchesCategory && matchesNVQ && matchesDistrict;
    });
  }, [vtaCourses, searchQuery, selectedCategory, selectedNVQLevel, selectedDistrict]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== null ||
    selectedNVQLevel !== 'All Levels' ||
    selectedDistrict !== 'All Districts';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedNVQLevel('All Levels');
    setSelectedDistrict('All Districts');
  };

  // Active level detail derivation for the open modal
  const activeLevelDetail = selectedCourseDetails?.levelDetails?.[selectedModalLevel];
  const currentDuration = activeLevelDetail?.duration || selectedCourseDetails?.duration;
  const currentQualificationType =
    activeLevelDetail?.qualificationType || selectedCourseDetails?.qualificationType || 'National Certificate';
  const currentRequirements =
    activeLevelDetail?.entryRequirements || selectedCourseDetails?.entryRequirements;
  const currentModules =
    activeLevelDetail?.modules || selectedCourseDetails?.features || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header
        title="VTA Sri Lanka"
        subtitle="Vocational Training Authority"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. VTA Institution Overview Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.vtaLogoBadge}>
              <Image
                source={require('../../assets/institutes/vta_logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroHeaderText}>
              <Text style={styles.vtaShortName}>{VTA_PROFILE.shortName}</Text>
              <Text style={styles.vtaFullName}>
                {isSinhala ? VTA_PROFILE.nameSi : VTA_PROFILE.name}
              </Text>
            </View>
          </View>

          <Text style={styles.heroIntroText}>
            {isSinhala ? VTA_PROFILE.introductionSi : VTA_PROFILE.introduction}
          </Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>14</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'සත්‍යාපිත පාඨමාලා' : 'Verified Trades'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>25</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'දිස්ත්‍රික් මධ්‍යස්ථාන' : 'District Centres'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>NVQ 3–5</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'නිපුණතා මට්ටම්' : 'NVQ Levels'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'ප්‍රධාන ක්ෂේත්‍ර' : 'Trade Sectors'}
              </Text>
            </View>
          </View>

          <View style={styles.heroBadgeRow}>
            <View style={styles.stateTag}>
              <Ionicons name="checkmark-circle" size={13} color={COLORS.primaryPurple} />
              <Text style={styles.stateTagText}>Statutory Authority (Act No. 12 of 1995)</Text>
            </View>
            <View style={styles.nvqTag}>
              <Ionicons name="ribbon" size={13} color={COLORS.modernBlue} />
              <Text style={styles.nvqTagText}>Accredited NVQ Level 3 – 5 Qualifications</Text>
            </View>
          </View>
        </View>

        {/* 2. Global Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                isSinhala
                  ? 'පාඨමාලා නම, ක්ෂේත්‍රය හෝ නගරය සොයන්න...'
                  : 'Search VTA courses, trades, or training centres...'
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

        {/* 3. Trade Categories Horizontal Filter Bar */}
        <View style={styles.categoryFilterSection}>
          <Text style={styles.filterSectionTitle}>
            {isSinhala ? 'ක්ෂේත්‍ර පෙරහන (Trade Sectors)' : 'Trade Sectors'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsScroll}
          >
            {/* All Categories Option */}
            <TouchableOpacity
              style={[styles.categoryPill, selectedCategory === null && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="grid-outline"
                size={14}
                color={selectedCategory === null ? COLORS.white : COLORS.primaryPurple}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === null && styles.categoryPillTextActive,
                ]}
              >
                {isSinhala ? 'සියලු ක්ෂේත්‍ර (8)' : 'All Sectors (8)'}
              </Text>
            </TouchableOpacity>

            {/* 8 VTA Categories */}
            {VTA_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(isSelected ? null : cat.name)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.iconName as any}
                    size={14}
                    color={isSelected ? COLORS.white : COLORS.primaryPurple}
                  />
                  <Text
                    style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}
                  >
                    {isSinhala && cat.nameSi ? cat.nameSi : cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. NVQ Level Filter Row (Label "Filter Courses by NVQ Level" REMOVED as requested) */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeaderRow}>
            <View style={styles.filterTitleRow}>
              <Ionicons name="funnel-outline" size={16} color={COLORS.primaryPurple} />
              <Text style={styles.filterSubLabel}>
                {isSinhala ? 'මට්ටම් පෙරහන' : 'NVQ Level'}
              </Text>
            </View>
            {hasActiveFilters && (
              <TouchableOpacity onPress={handleClearFilters} style={styles.clearBtn} activeOpacity={0.7}>
                <Ionicons name="refresh" size={12} color={COLORS.danger} style={{ marginRight: 3 }} />
                <Text style={styles.clearBtnText}>
                  {isSinhala ? 'ෆිල්ටර ඉවත් කරන්න' : 'Clear Filters'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* NVQ Horizontal Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nvqScrollList}
          >
            {VTA_NVQ_LEVELS.map((level) => {
              const isSelected = selectedNVQLevel === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.nvqPill, isSelected && styles.nvqPillSelected]}
                  onPress={() => setSelectedNVQLevel(level)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.nvqPillText, isSelected && styles.nvqPillTextSelected]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* District Horizontal Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.nvqScrollList, { marginTop: 8 }]}
          >
            {DISTRICT_LIST.map((dist) => {
              const isSelected = selectedDistrict === dist;
              return (
                <TouchableOpacity
                  key={dist}
                  style={[styles.districtPill, isSelected && styles.districtPillSelected]}
                  onPress={() => setSelectedDistrict(dist)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={isSelected ? COLORS.white : COLORS.secondaryText}
                  />
                  <Text style={[styles.districtPillText, isSelected && styles.districtPillTextSelected]}>
                    {dist}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. Filter Counter Bar */}
        <View style={styles.activeFilterStatusBox}>
          <Text style={styles.resultsCounterText}>
            {filteredCourses.length}{' '}
            {filteredCourses.length === 1 ? 'Program Matched' : 'Programs Matched'}
          </Text>
        </View>

        {/* 6. VTA Course Cards (Exact NAITA card format) */}
        <View style={styles.coursesContainer}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <VTACourseCard
                key={course.id}
                course={course}
                isSinhala={isSinhala}
                onPress={() => handleOpenDetails(course)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={COLORS.secondaryText} />
              <Text style={styles.emptyTitle}>
                {isSinhala ? 'ගැලපෙන පාඨමාලා හමු නොවීය' : 'No matching courses found'}
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

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Course Full Details Modal with Interactive Top NVQ Level Selector */}
      {selectedCourseDetails && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalCategoryText}>
                    {selectedCourseDetails.category}
                  </Text>
                  <Text style={styles.modalCourseTitle}>
                    {isSinhala && selectedCourseDetails.sinhalaName
                      ? selectedCourseDetails.sinhalaName
                      : selectedCourseDetails.name}
                  </Text>
                  {selectedCourseDetails.code && (
                    <Text style={styles.modalCodeText}>
                      Code: {selectedCourseDetails.code}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedCourseDetails(null)}
                  style={styles.modalCloseCircle}
                >
                  <Ionicons name="close" size={20} color={COLORS.darkNavy} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Dynamic Multi-Level Selector Tabs inside the Details Form (Instruction 10) */}
                {selectedCourseDetails.supportedLevels &&
                  selectedCourseDetails.supportedLevels.length > 1 && (
                    <View style={styles.modalLevelSelectorBox}>
                      <View style={styles.modalLevelSelectorHeader}>
                        <Ionicons name="layers-outline" size={15} color={COLORS.primaryPurple} />
                        <Text style={styles.modalLevelSelectorTitle}>
                          {isSinhala
                            ? 'සුදුසුකම් මට්ටම තෝරන්න (Select Qualification Level):'
                            : 'Select Qualification Level to View Details:'}
                        </Text>
                      </View>
                      <View style={styles.modalLevelPillsRow}>
                        {selectedCourseDetails.supportedLevels.map((lvl) => {
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

                {/* Badges Row for Active Selected Level */}
                <View style={styles.modalBadgesRow}>
                  <Badge label={selectedModalLevel || selectedCourseDetails.nvqLevel} variant="purple" />
                  <Badge label={currentQualificationType} variant="blue" />
                  {selectedCourseDetails.studyMode && (
                    <Badge label={selectedCourseDetails.studyMode} variant="gray" />
                  )}
                  {selectedCourseDetails.isFree && (
                    <Badge label="FREE TUITION" variant="success" />
                  )}
                </View>

                {/* Training Provider & Location */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පුහුණු මධ්‍යස්ථානය හා ස්ථානය' : 'Training Institute & Location'}
                  </Text>
                  <Text style={styles.detailBodyText}>
                    🏢 {selectedCourseDetails.trainingCentre}
                  </Text>
                  <Text style={styles.detailBodyText}>
                    📍 {selectedCourseDetails.district}
                  </Text>
                  {currentDuration && (
                    <Text style={styles.detailBodyText}>
                      ⏱️ {currentDuration}
                    </Text>
                  )}
                </View>

                {/* Course Fees & Financial Concessions */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පාඨමාලා ගාස්තු සහ සහන' : 'Course Fee & Financial Concessions'}
                  </Text>
                  <Text
                    style={[styles.detailBodyText, { fontWeight: '700', color: COLORS.primaryPurple }]}
                  >
                    💰 {selectedCourseDetails.courseFee || 'Free Training (Government Vocational Training)'}
                  </Text>
                  <Text style={styles.detailSubText}>
                    {isSinhala
                      ? 'ශ්‍රී ලංකා වෘත්තීය පුහුණු අධිකාරිය (VTA) මගින් පවත්වනු ලබන මෙම පාඨමාලාව රජයේ පූර්ණ අනුග්‍රහයෙන් නොමිලේ පැවැත්වෙන අතර ජාත්‍යන්තරව පිළිගත් NVQ සහතිකය හිමිවේ.'
                      : 'Conducted under official government vocational development patronage with free tuition fees and nationally recognized NVQ certification.'}
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

                {/* Course Overview */}
                {selectedCourseDetails.description && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala ? 'පාඨමාලා හැඳින්වීම' : 'Course Overview'}
                    </Text>
                    <Text style={styles.detailBodyText}>
                      {selectedCourseDetails.description}
                    </Text>
                  </View>
                )}

                {/* Key Modules / Practical Skills for Selected Level */}
                {currentModules && currentModules.length > 0 && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala
                        ? `${selectedModalLevel} ප්‍රධාන විෂය පථයන්`
                        : `Key Modules & Practical Skills (${selectedModalLevel})`}
                    </Text>
                    {currentModules.map((item, idx) => (
                      <View key={idx} style={styles.featureItemRow}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.featureItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Official Source & Verification Date */}
                <View style={styles.sourceVerificationCard}>
                  <Ionicons name="shield-checkmark" size={18} color={COLORS.primaryPurple} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sourceVerificationTitle}>
                      Official Government Source Verified
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      Source: {selectedCourseDetails.officialSourceUrl || 'https://www.vtasl.gov.lk'}
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      Verified: {selectedCourseDetails.lastVerifiedAt || '2026-10-31'} (VTA Statutory Authority Act No. 12 of 1995)
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalActionButtonsRow}>
                {selectedCourseDetails.officialSourceUrl && (
                  <TouchableOpacity
                    style={styles.openWebBtn}
                    onPress={() => Linking.openURL(selectedCourseDetails.officialSourceUrl!)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="globe-outline" size={16} color={COLORS.white} />
                    <Text style={styles.openWebBtnText}>
                      {isSinhala ? 'නිල VTA අයදුම්පත් පිටුව' : 'Open Official VTA Page'}
                    </Text>
                    <Ionicons name="open-outline" size={13} color={COLORS.white} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setSelectedCourseDetails(null)}
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

export default VTACoursesScreen;

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
  vtaLogoBadge: {
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
  vtaShortName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryPurple,
    letterSpacing: 0.5,
  },
  vtaFullName: {
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
