import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Linking,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import {
  NAITA_PROFILE,
  NAITA_QUALIFICATION_FILTERS,
  NAITA_NVQ_FILTERS,
  NAITA_PROVIDER_FILTERS,
  NAITA_CATEGORIES,
  NAITA_DISTRICTS,
  NAITA_VERIFIED_COURSES,
} from '../data/naitaData';
import {
  NAITACourse,
  NAITAQualificationFilter,
  NAITANVQFilter,
  NAITAProviderFilter,
} from '../types';
import { NAITACourseCard } from '../components/naita/NAITACourseCard';
import { useTranslation } from '../context/LanguageContext';
import { useLiveCourses } from '../hooks/useLiveCourses';
import { syncInstitutionCourses } from '../utils/liveDataSync';

interface NAITACoursesScreenProps {
  navigation: any;
}

export const NAITACoursesScreen: React.FC<NAITACoursesScreenProps> = ({ navigation }) => {
  const { isSinhala } = useTranslation();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQual, setSelectedQual] = useState<NAITAQualificationFilter>('All Qualifications');
  const [selectedNVQ, setSelectedNVQ] = useState<NAITANVQFilter>('All Levels');
  const [selectedProvider, setSelectedProvider] = useState<NAITAProviderFilter>('All Providers');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<NAITACourse | null>(null);

  const liveCourses = useLiveCourses();
  const naitaCourses = useMemo(() => {
    return syncInstitutionCourses('NAITA', NAITA_VERIFIED_COURSES, liveCourses);
  }, [liveCourses]);

  // Filter Logic: Combined 5-Facet Filtering
  const filteredCourses = useMemo(() => {
    return naitaCourses.filter((course) => {
      // 1. Search Query Match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q.length === 0 ||
        course.name.toLowerCase().includes(q) ||
        (course.sinhalaName && course.sinhalaName.toLowerCase().includes(q)) ||
        (course.code && course.code.toLowerCase().includes(q)) ||
        course.category.toLowerCase().includes(q) ||
        course.trainingCentre.toLowerCase().includes(q);

      // 2. Qualification Type Match
      let matchesQual = true;
      if (selectedQual !== 'All Qualifications') {
        matchesQual = course.qualificationType === selectedQual;
      }

      // 3. NVQ Level Match
      let matchesNVQ = true;
      if (selectedNVQ !== 'All Levels') {
        matchesNVQ = course.nvqLevel.includes(selectedNVQ);
      }

      // 4. Provider Match
      let matchesProvider = true;
      if (selectedProvider !== 'All Providers') {
        matchesProvider = course.providerType === selectedProvider;
      }

      // 5. Category Match
      let matchesCategory = true;
      if (selectedCategory) {
        matchesCategory = course.category === selectedCategory;
      }

      // 6. District Match
      let matchesDistrict = true;
      if (selectedDistrict !== 'All Districts') {
        matchesDistrict =
          course.district.includes(selectedDistrict) ||
          course.district.includes('All') ||
          Boolean(
            course.availableDistricts &&
              (course.availableDistricts.includes(selectedDistrict) ||
                course.availableDistricts.includes('All Districts'))
          );
      }

      return (
        matchesSearch &&
        matchesQual &&
        matchesNVQ &&
        matchesProvider &&
        matchesCategory &&
        matchesDistrict
      );
    });
  }, [
    naitaCourses,
    searchQuery,
    selectedQual,
    selectedNVQ,
    selectedProvider,
    selectedCategory,
    selectedDistrict,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedQual !== 'All Qualifications' ||
    selectedNVQ !== 'All Levels' ||
    selectedProvider !== 'All Providers' ||
    selectedCategory !== null ||
    selectedDistrict !== 'All Districts';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedQual('All Qualifications');
    setSelectedNVQ('All Levels');
    setSelectedProvider('All Providers');
    setSelectedCategory(null);
    setSelectedDistrict('All Districts');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header
        title="NAITA Sri Lanka"
        subtitle="National Apprentice & Industrial Training Authority"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. NAITA Institution Overview Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.naitaLogoBadge}>
              <Image
                source={require('../../assets/institutes/naita_logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroHeaderText}>
              <Text style={styles.naitaShortName}>{NAITA_PROFILE.shortName}</Text>
              <Text style={styles.naitaFullName}>
                {isSinhala ? NAITA_PROFILE.nameSi : NAITA_PROFILE.name}
              </Text>
            </View>
          </View>

          <Text style={styles.heroIntroText}>
            {isSinhala ? NAITA_PROFILE.introductionSi : NAITA_PROFILE.introduction}
          </Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>40</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'සත්‍යාපිත පාඨමාලා' : 'Verified Courses'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>25</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'දිස්ත්‍රික් කාර්යාල' : 'District Offices'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'ජාතික ආයතන' : 'National Institutes'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>NVQ 3–6</Text>
              <Text style={styles.statLabel}>
                {isSinhala ? 'නිපුණතා මට්ටම්' : 'Qualification Levels'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Live Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                isSinhala
                  ? 'පාඨමාලා නම, කේතය (G50S003.3, IETI-01) හෝ අංශය සොයන්න...'
                  : 'Search by course, code (e.g. G50S003.3, IETI-01) or sector...'
              }
              placeholderTextColor={COLORS.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color={COLORS.secondaryText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. Combined Filter 1: Qualification Types (Instruction 4 & 11) */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>
            {isSinhala ? '1. සුදුසුකම් කාණ්ඩය' : '1. Qualification Type'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
            {NAITA_QUALIFICATION_FILTERS.map((qual) => {
              const isSelected = selectedQual === qual.id;
              return (
                <TouchableOpacity
                  key={qual.id}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setSelectedQual(qual.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {isSinhala ? qual.labelSi : qual.label} ({qual.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Informative notice if HND or Degree is selected (Instruction 5 & 9) */}
        {(selectedQual === 'HND' || selectedQual === 'Degree') && (
          <View style={styles.qualificationNoticeBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.modernBlue} />
            <View style={{ flex: 1 }}>
              <Text style={styles.qualificationNoticeTitle}>
                {selectedQual === 'Degree'
                  ? isSinhala
                    ? 'උපාධි පාඨමාලා පිළිබඳ නිල සටහන'
                    : 'Official Note on Degree Programmes'
                  : isSinhala
                  ? 'HND පාඨමාලා පිළිබඳ නිල සටහන'
                  : 'Official Note on Higher National Diplomas (HND)'}
              </Text>
              <Text style={styles.qualificationNoticeText}>
                {selectedQual === 'Degree'
                  ? isSinhala
                    ? 'NAITA යනු ශ්‍රී ලංකා රජයේ ප්‍රමුඛතම වෘත්තීය හා ආධුනිකත්ව අධිකාරිය වන අතර සෘජුවම උපාධි පිරිනමන්නේ නැත. වෘත්තීය උපාධි සඳහා University of Vocational Technology (UoVT) වෙත යොමුවන්න.'
                    : 'NAITA is Sri Lanka’s apex apprenticeship authority up to NVQ Level 6 (NDES). NAITA does not directly award university degrees. For TVET Bachelor’s degrees, see University of Vocational Technology (UoVT).'
                  : isSinhala
                  ? 'Higher National Diploma (HND) පාඨමාලා ශ්‍රී ලංකා උසස් තාක්ෂණ අධ්‍යාපන ආයතනය (SLIATE) මගින් පිරිනමනු ලැබේ.'
                  : 'Higher National Diploma (HND) programmes are conducted by the Sri Lanka Institute of Advanced Technological Education (SLIATE).'}
              </Text>
            </View>
          </View>
        )}

        {/* 4. Combined Filter 2: NVQ Level (Instruction 4 & 11) */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>
            {isSinhala ? '2. NVQ මට්ටම (Levels 1–7)' : '2. NVQ Level (Levels 1–7)'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
            {NAITA_NVQ_FILTERS.map((nvq) => {
              const isSelected = selectedNVQ === nvq.id;
              return (
                <TouchableOpacity
                  key={nvq.id}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setSelectedNVQ(nvq.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {nvq.label} ({nvq.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. Combined Filter 3: Training Provider (Instruction 7) */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>
            {isSinhala ? '3. පුහුණු ආයතනය / මධ්‍යස්ථානය' : '3. Training Provider (Direct vs. Specialized Institutes)'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
            {NAITA_PROVIDER_FILTERS.map((provider) => {
              const isSelected = selectedProvider === provider.id;
              return (
                <TouchableOpacity
                  key={provider.id}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setSelectedProvider(provider.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {isSinhala ? provider.labelSi : provider.label} ({provider.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 6. Combined Filter 4: Sector / Category (11 Official Sectors) */}
        <View style={styles.filterGroup}>
          <View style={styles.filterHeaderRow}>
            <Text style={styles.filterGroupLabel}>
              {isSinhala ? '4. ක්ෂේත්‍රය (Official Sectors - 11)' : '4. Course Sector (11 Official Sectors)'}
            </Text>
            {selectedCategory && (
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <Text style={styles.resetLink}>{isSinhala ? 'සියලු ක්ෂේත්‍ර' : 'Show All Sectors'}</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
            {NAITA_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.sectorCard, isSelected && styles.sectorCardActive]}
                  onPress={() => setSelectedCategory(isSelected ? null : cat.name)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? COLORS.white : COLORS.primaryPurple}
                  />
                  <Text style={[styles.sectorCardText, isSelected && styles.sectorCardTextActive]} numberOfLines={1}>
                    {isSinhala ? cat.nameSi : cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 7. Combined Filter 5: District Filter Button */}
        <View style={styles.districtRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.districtLabel}>{isSinhala ? '5. දිස්ත්‍රික්කය:' : '5. District:'}</Text>
            <Text style={styles.districtValue}>{selectedDistrict}</Text>
          </View>
          <TouchableOpacity
            style={styles.changeDistrictBtn}
            onPress={() => setShowDistrictModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={14} color={COLORS.primaryPurple} />
            <Text style={styles.changeDistrictBtnText}>
              {isSinhala ? 'දිස්ත්‍රික්කය මාරු කරන්න' : 'Select District'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersRow}>
            <Text style={styles.activeFiltersCount}>
              {filteredCourses.length}{' '}
              {isSinhala ? 'පාඨමාලා පෙරහන් කර ඇත' : 'programmes matched'}
            </Text>
            <TouchableOpacity onPress={handleClearFilters} style={styles.clearFiltersBtn}>
              <Ionicons name="refresh" size={12} color={COLORS.danger} />
              <Text style={styles.clearFiltersText}>
                {isSinhala ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Reset All Filters'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Course Cards Listing */}
        <View style={styles.coursesContainer}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <NAITACourseCard
                key={course.id}
                course={course}
                onPress={() => setSelectedCourseDetails(course)}
                isSinhala={isSinhala}
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

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* District Selection Modal */}
      <Modal visible={showDistrictModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.districtModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isSinhala ? 'දිස්ත්‍රික්කය තෝරන්න' : 'Select Training District'}
              </Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.darkNavy} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              {NAITA_DISTRICTS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.districtOption, selectedDistrict === d && styles.districtOptionActive]}
                  onPress={() => {
                    setSelectedDistrict(d);
                    setShowDistrictModal(false);
                  }}
                >
                  <Text
                    style={[styles.districtOptionText, selectedDistrict === d && styles.districtOptionTextActive]}
                  >
                    {d}
                  </Text>
                  {selectedDistrict === d && (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primaryPurple} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Course Full Details Modal */}
      {selectedCourseDetails && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
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
                <TouchableOpacity onPress={() => setSelectedCourseDetails(null)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.secondaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Badges Row */}
                <View style={styles.modalBadgesRow}>
                  <Badge label={selectedCourseDetails.nvqLevel} variant="purple" />
                  <Badge label={selectedCourseDetails.qualificationType} variant="blue" />
                  <Badge label={selectedCourseDetails.studyMode} variant="gray" />
                </View>

                {/* Training Provider & District */}
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
                  <Text style={styles.detailBodyText}>
                    ⏱️ {selectedCourseDetails.duration}
                  </Text>
                </View>

                {/* Course Fees & Financial Allowance */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පාඨමාලා ගාස්තු සහ සහන' : 'Course Fee & Financial Concessions'}
                  </Text>
                  <Text style={[styles.detailBodyText, { fontWeight: '700', color: COLORS.primaryPurple }]}>
                    💰 {selectedCourseDetails.courseFee}
                  </Text>
                  {selectedCourseDetails.registrationFee && (
                    <Text style={styles.detailBodyText}>
                      📝 Registration Fee: {selectedCourseDetails.registrationFee}
                    </Text>
                  )}
                  <Text style={styles.detailSubText}>
                    {isSinhala
                      ? 'අස්වැසුම ප්‍රතිලාභී අඩු ආදායම්ලාභී පවුල්වල සිසුන් සඳහා ගාස්තු සම්පූර්ණයෙන්ම නිදහස් කර ඇති අතර මාසික දීමනා සඳහා සුදුසුකම් ලබයි.'
                      : 'Students from low-income (Aswasuma) families follow courses free of charge and are eligible for monthly government apprentice allowances.'}
                  </Text>
                </View>

                {/* Entry Requirements */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'ඇතුළත් වීමේ සුදුසුකම්' : 'Entry Requirements'}
                  </Text>
                  <Text style={styles.detailBodyText}>
                    {selectedCourseDetails.entryRequirements}
                  </Text>
                </View>

                {/* Course Overview */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>
                    {isSinhala ? 'පාඨමාලා හැඳින්වීම' : 'Course Overview'}
                  </Text>
                  <Text style={styles.detailBodyText}>
                    {selectedCourseDetails.description}
                  </Text>
                </View>

                {/* Key Features / Modules */}
                {selectedCourseDetails.features && selectedCourseDetails.features.length > 0 && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>
                      {isSinhala ? 'විෂය පථයන් සහ කුසලතා' : 'Key Modules & Practical Skills'}
                    </Text>
                    {selectedCourseDetails.features.map((f, i) => (
                      <View key={i} style={styles.featureItemRow}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.featureItemText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Official Source & Verification Date (Instruction 6 & 9) */}
                <View style={styles.sourceVerificationCard}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.primaryPurple} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sourceVerificationTitle}>
                      Official Government Source Verified
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      Source: {selectedCourseDetails.officialSourceUrl}
                    </Text>
                    <Text style={styles.sourceVerificationSub}>
                      Verified Date: {selectedCourseDetails.verificationDate} (NAITA Act No. 20 of 1990)
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalActionButtonsRow}>
                <TouchableOpacity
                  style={styles.openWebBtn}
                  onPress={() => Linking.openURL(selectedCourseDetails.officialSourceUrl)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="globe-outline" size={16} color={COLORS.white} />
                  <Text style={styles.openWebBtnText}>
                    {isSinhala ? 'නිල NAITA වෙබ් අඩවියෙන් බලන්න' : 'Visit Official NAITA Page'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedCourseDetails(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeBtnText}>{isSinhala ? 'වසන්න' : 'Close'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default NAITACoursesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.softGray,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  naitaLogoBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 3,
  },
  heroHeaderText: {
    flex: 1,
  },
  naitaShortName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  naitaFullName: {
    fontSize: 12,
    color: COLORS.darkNavy,
    fontWeight: '600',
    lineHeight: 16,
  },
  heroIntroText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.softGray,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.secondaryText,
    marginTop: 2,
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
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
  filterGroup: {
    marginBottom: 10,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  filterGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  resetLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  filterPillsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  filterPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  sectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectorCardActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  sectorCardText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.darkNavy,
    maxWidth: 220,
  },
  sectorCardTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  qualificationNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  qualificationNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.modernBlue,
    marginBottom: 2,
  },
  qualificationNoticeText: {
    fontSize: 11,
    color: COLORS.darkNavy,
    lineHeight: 16,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
  },
  districtLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  districtValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginTop: 2,
  },
  changeDistrictBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeDistrictBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 10,
  },
  activeFiltersCount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearFiltersText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  coursesContainer: {
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginTop: 12,
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
    backgroundColor: COLORS.primaryPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyResetBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 46, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  districtModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxHeight: 460,
  },
  detailsModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  modalCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.modernBlue,
    marginBottom: 2,
  },
  modalCourseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 22,
  },
  modalCodeText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    fontWeight: '600',
    marginTop: 2,
  },
  modalScrollBody: {
    paddingVertical: 6,
  },
  modalBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: COLORS.softGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  detailBodyText: {
    fontSize: 12,
    color: COLORS.darkNavy,
    lineHeight: 18,
    marginBottom: 4,
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
    gap: 6,
    marginBottom: 4,
  },
  featureItemText: {
    fontSize: 12,
    color: COLORS.darkNavy,
    flex: 1,
  },
  sourceVerificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.softLavender,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  sourceVerificationTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryPurple,
    marginBottom: 2,
  },
  sourceVerificationSub: {
    fontSize: 10,
    color: COLORS.secondaryText,
    lineHeight: 14,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  openWebBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  openWebBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softGray,
    borderRadius: 10,
    paddingVertical: 10,
  },
  closeBtnText: {
    color: COLORS.darkNavy,
    fontSize: 12,
    fontWeight: '700',
  },
  districtOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  districtOptionActive: {
    backgroundColor: COLORS.softLavender,
    borderRadius: 8,
  },
  districtOptionText: {
    fontSize: 13,
    color: COLORS.darkNavy,
  },
  districtOptionTextActive: {
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
});
