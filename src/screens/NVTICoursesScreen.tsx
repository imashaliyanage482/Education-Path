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
import { NVTICourseCard } from '../components/nvti/NVTICourseCard';
import { useLiveCourses } from '../hooks/useLiveCourses';
import { syncInstitutionCourses } from '../utils/liveDataSync';
import {
  NVTI_PROFILE,
  NVTI_CATEGORIES,
  NVTI_CENTERS,
  NVTI_VERIFIED_COURSES,
} from '../data/nvtiData';
import { NVTICourse, NVTICategoryName } from '../types';
import { useTranslation } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface NVTICoursesScreenProps {
  navigation: any;
}

export const NVTICoursesScreen: React.FC<NVTICoursesScreenProps> = ({ navigation }) => {
  const { isSinhala } = useTranslation();

  // Active Tab: Courses vs Centers
  const [activeTab, setActiveTab] = useState<'courses' | 'centers'>('courses');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NVTICategoryName | null>(null);
  const [selectedNVQLevel, setSelectedNVQLevel] = useState<string>('All Levels');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');

  // Details Modal State
  const [selectedCourse, setSelectedCourse] = useState<NVTICourse | null>(null);

  // Distinct districts from Centers
  const centerDistricts = useMemo(() => {
    const set = new Set<string>();
    NVTI_CENTERS.forEach((c) => set.add(c.district));
    return ['All Districts', ...Array.from(set).sort()];
  }, []);

  const liveCourses = useLiveCourses();
  const nvtiCourses = useMemo(() => {
    return syncInstitutionCourses('NVTI', NVTI_VERIFIED_COURSES, liveCourses);
  }, [liveCourses]);

  // Filter logic across all verified NVTI courses
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return nvtiCourses.filter((course) => {
      // 1. Search Query
      const matchesSearch =
        q.length === 0 ||
        course.name.toLowerCase().includes(q) ||
        (course.sinhalaName && course.sinhalaName.toLowerCase().includes(q)) ||
        course.code.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q);

      // 2. Category Filter
      const matchesCategory = selectedCategory ? course.category === selectedCategory : true;

      // 3. NVQ Level Filter
      let matchesNVQ = true;
      if (selectedNVQLevel !== 'All Levels') {
        matchesNVQ = course.nvqLevel.includes(selectedNVQLevel);
      }

      // 4. District Filter
      let matchesDistrict = true;
      if (selectedDistrict !== 'All Districts') {
        matchesDistrict = course.trainingCenters.some((centerName) => {
          const matchedCenter = NVTI_CENTERS.find((c) => c.name.toLowerCase() === centerName.toLowerCase());
          return matchedCenter ? matchedCenter.district === selectedDistrict : false;
        });
      }

      return matchesSearch && matchesCategory && matchesNVQ && matchesDistrict;
    });
  }, [nvtiCourses, searchQuery, selectedCategory, selectedNVQLevel, selectedDistrict]);

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed opening url:', err));
  };

  const handleCall = (phone: string) => {
    const cleanPhone = phone.split('/')[0].trim().replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch((err) => console.error('Failed to call:', err));
  };

  const handleEmail = (email: string) => {
    const cleanEmail = email.split('/')[0].trim();
    Linking.openURL(`mailto:${cleanEmail}`).catch((err) => console.error('Failed to email:', err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header
        title={isSinhala ? 'NVTI පාඨමාලා' : 'NVTI Courses'}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/institutes/nvti_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroTitles}>
              <View style={styles.statusPill}>
                <Ionicons name="shield-checkmark" size={13} color="#059669" />
                <Text style={styles.statusPillText}>VTA Apex Residential Institutes</Text>
              </View>
              <Text style={styles.heroTitle}>{NVTI_PROFILE.shortName}</Text>
              <Text style={styles.heroSubtitle}>
                {isSinhala ? NVTI_PROFILE.sinhalaName : NVTI_PROFILE.name}
              </Text>
            </View>
          </View>

          <Text style={styles.heroDescription}>
            {isSinhala ? NVTI_PROFILE.sinhalaOverview : NVTI_PROFILE.overview}
          </Text>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{NVTI_CENTERS.length}</Text>
              <Text style={styles.metricLabel}>{isSinhala ? 'ජාතික මධ්‍යස්ථාන' : 'Apex NVTIs'}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{NVTI_VERIFIED_COURSES.length}</Text>
              <Text style={styles.metricLabel}>{isSinhala ? 'NVQ පාඨමාලා' : 'Verified Courses'}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>100% Free</Text>
              <Text style={styles.metricLabel}>{isSinhala ? 'නොමිලේ පුහුණුව' : 'State Funded'}</Text>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'courses' && styles.tabButtonActive]}
            onPress={() => setActiveTab('courses')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="book-outline"
              size={18}
              color={activeTab === 'courses' ? COLORS.primaryPurple : COLORS.secondaryText}
            />
            <Text style={[styles.tabText, activeTab === 'courses' && styles.tabTextActive]}>
              {isSinhala ? `පාඨමාලා (${filteredCourses.length})` : `Courses (${filteredCourses.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'centers' && styles.tabButtonActive]}
            onPress={() => setActiveTab('centers')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={18}
              color={activeTab === 'centers' ? COLORS.primaryPurple : COLORS.secondaryText}
            />
            <Text style={[styles.tabText, activeTab === 'centers' && styles.tabTextActive]}>
              {isSinhala ? `ආයතන ජාලය (${NVTI_CENTERS.length})` : `Institutes (${NVTI_CENTERS.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'courses' ? (
          <>
            {/* Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color={COLORS.secondaryText} />
                <TextInput
                  placeholder={
                    isSinhala
                      ? 'පාඨමාලා නම, කේතය හෝ විෂය සොයන්න...'
                      : 'Search courses by name, code or keyword...'
                  }
                  placeholderTextColor={COLORS.secondaryText}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={COLORS.secondaryText} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category Filter Chips */}
            <View style={styles.filterSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === null && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === null && styles.categoryChipTextActive,
                    ]}
                  >
                    {isSinhala ? 'සියලු විෂය ක්ෂේත්‍ර' : 'All Categories'}
                  </Text>
                </TouchableOpacity>

                {NVTI_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => setSelectedCategory(isActive ? null : cat.name)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={14}
                        color={isActive ? COLORS.white : COLORS.primaryPurple}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Secondary Filter Row: NVQ Level & District */}
            <View style={styles.secondaryFilterRow}>
              {/* NVQ Filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                {['All Levels', 'NVQ Level 4', 'NVQ Level 5'].map((lvl) => {
                  const isActive = selectedNVQLevel === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.smallFilterPill, isActive && styles.smallFilterPillActive]}
                      onPress={() => setSelectedNVQLevel(lvl)}
                    >
                      <Text
                        style={[
                          styles.smallFilterPillText,
                          isActive && styles.smallFilterPillTextActive,
                        ]}
                      >
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* District Filter Row */}
            <View style={styles.districtFilterRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {centerDistricts.map((dst) => {
                  const isActive = selectedDistrict === dst;
                  return (
                    <TouchableOpacity
                      key={dst}
                      style={[styles.districtPill, isActive && styles.districtPillActive]}
                      onPress={() => setSelectedDistrict(dst)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color={isActive ? COLORS.white : COLORS.secondaryText}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.districtPillText,
                          isActive && styles.districtPillTextActive,
                        ]}
                      >
                        {dst}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Course Cards List */}
            <View style={styles.coursesListContainer}>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <NVTICourseCard
                    key={course.id}
                    course={course}
                    isSinhala={isSinhala}
                    onPress={() => setSelectedCourse(course)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={COLORS.secondaryText} />
                  <Text style={styles.emptyTitle}>
                    {isSinhala ? 'පාඨමාලා කිසිවක් හමු නොවීය' : 'No courses match your filter'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {isSinhala
                      ? 'කරුණාකර වෙනත් සෙවුම් පදයක් හෝ පෙරහනක් තෝරන්න.'
                      : 'Try resetting the category, NVQ level or district filter.'}
                  </Text>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                      setSelectedNVQLevel('All Levels');
                      setSelectedDistrict('All Districts');
                    }}
                  >
                    <Text style={styles.resetButtonText}>
                      {isSinhala ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Reset All Filters'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        ) : (
          /* Institutes Network Directory Tab */
          <View style={styles.centersListContainer}>
            <Text style={styles.sectionHeaderTitle}>
              {isSinhala ? 'ජාතික වෘත්තීය පුහුණු ආයතන (NVTI) නාමාවලිය' : 'NVTI National Campus Directory'}
            </Text>
            <Text style={styles.sectionHeaderSubtitle}>
              {isSinhala
                ? 'නේවාසිකාගාර සහ නවීන තාක්ෂණික වැඩබිම් සහිත ප්‍රධාන මධ්‍යස්ථාන 9'
                : '9 residential apex technical institutes across Sri Lanka'}
            </Text>

            {NVTI_CENTERS.map((center) => (
              <View key={center.id} style={styles.centerCard}>
                <View style={styles.centerHeaderRow}>
                  <View style={styles.centerIconBox}>
                    <Ionicons name="business" size={22} color={COLORS.primaryPurple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.centerName}>
                      {isSinhala && center.sinhalaName ? center.sinhalaName : center.name}
                    </Text>
                    <View style={styles.centerBadgeRow}>
                      <Badge label={center.district} variant="blue" />
                      <Badge label={`${center.province} Province`} variant="gray" />
                    </View>
                  </View>
                </View>

                {/* Specialization highlight */}
                <View style={styles.specializationBox}>
                  <Ionicons name="sparkles" size={14} color="#7C3AED" style={{ marginRight: 6 }} />
                  <Text style={styles.specializationText}>{center.specialization}</Text>
                </View>

                {/* Address & Contacts */}
                <View style={styles.centerDetailsList}>
                  <View style={styles.centerDetailRow}>
                    <Ionicons name="location-outline" size={15} color={COLORS.secondaryText} style={{ marginRight: 6 }} />
                    <Text style={styles.centerDetailText}>{center.address}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.centerDetailRow}
                    onPress={() => handleCall(center.telephone)}
                  >
                    <Ionicons name="call-outline" size={15} color={COLORS.primaryPurple} style={{ marginRight: 6 }} />
                    <Text style={[styles.centerDetailText, styles.linkText]}>{center.telephone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.centerDetailRow}
                    onPress={() => handleEmail(center.email)}
                  >
                    <Ionicons name="mail-outline" size={15} color={COLORS.primaryPurple} style={{ marginRight: 6 }} />
                    <Text style={[styles.centerDetailText, styles.linkText]}>{center.email}</Text>
                  </TouchableOpacity>
                </View>

                {/* Offered Courses list */}
                <View style={styles.centerCoursesBox}>
                  <Text style={styles.centerCoursesTitle}>Key Programmes Conducted:</Text>
                  {center.availableCourses.map((cName, idx) => (
                    <View key={idx} style={styles.centerCourseBulletRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginRight: 6 }} />
                      <Text style={styles.centerCourseBulletText}>{cName}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Course Details Modal */}
      <Modal
        visible={!!selectedCourse}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCourse(null)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.modalCodeText}>{selectedCourse?.code}</Text>
                <Text style={styles.modalTitleText}>
                  {isSinhala && selectedCourse?.sinhalaName
                    ? selectedCourse.sinhalaName
                    : selectedCourse?.name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedCourse(null)}
              >
                <Ionicons name="close" size={24} color={COLORS.darkNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Badges Strip */}
              <View style={styles.modalBadgesStrip}>
                <Badge label={selectedCourse?.nvqLevel || ''} variant="purple" />
                <Badge label={selectedCourse?.qualificationType || ''} variant="blue" />
                <Badge label="Residential & Free" variant="success" />
              </View>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoGridCard}>
                  <Ionicons name="time-outline" size={20} color={COLORS.primaryPurple} />
                  <Text style={styles.infoGridLabel}>Duration</Text>
                  <Text style={styles.infoGridValue}>{selectedCourse?.duration}</Text>
                </View>

                <View style={styles.infoGridCard}>
                  <Ionicons name="cash-outline" size={20} color="#059669" />
                  <Text style={styles.infoGridLabel}>Course Fee</Text>
                  <Text style={[styles.infoGridValue, { color: '#059669' }]}>
                    {selectedCourse?.courseFee}
                  </Text>
                </View>

                <View style={styles.infoGridCard}>
                  <Ionicons name="school-outline" size={20} color={COLORS.primaryPurple} />
                  <Text style={styles.infoGridLabel}>Awarding Body</Text>
                  <Text style={styles.infoGridValue}>VTA & TVEC (NVQ Certified)</Text>
                </View>

                <View style={styles.infoGridCard}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primaryPurple} />
                  <Text style={styles.infoGridLabel}>Study Mode</Text>
                  <Text style={styles.infoGridValue}>{selectedCourse?.studyMode}</Text>
                </View>
              </View>

              {/* Conducted NVTI Locations */}
              <View style={styles.modalSectionCard}>
                <View style={styles.modalSectionHeaderRow}>
                  <Ionicons name="business-outline" size={18} color={COLORS.primaryPurple} />
                  <Text style={styles.modalSectionTitle}>Conducted NVTI Campuses</Text>
                </View>
                {selectedCourse?.trainingCenters.map((centerName, idx) => (
                  <View key={idx} style={styles.locationPillRow}>
                    <Ionicons name="pin" size={14} color={COLORS.primaryPurple} style={{ marginRight: 6 }} />
                    <Text style={styles.locationPillText}>{centerName}</Text>
                  </View>
                ))}
              </View>

              {/* Description */}
              <View style={styles.modalSectionCard}>
                <View style={styles.modalSectionHeaderRow}>
                  <Ionicons name="information-circle-outline" size={18} color={COLORS.primaryPurple} />
                  <Text style={styles.modalSectionTitle}>Programme Overview</Text>
                </View>
                <Text style={styles.modalBodyText}>{selectedCourse?.description}</Text>
              </View>

              {/* Entry Requirements */}
              <View style={styles.modalSectionCard}>
                <View style={styles.modalSectionHeaderRow}>
                  <Ionicons name="checkbox-outline" size={18} color={COLORS.primaryPurple} />
                  <Text style={styles.modalSectionTitle}>Admission Requirements</Text>
                </View>
                <Text style={styles.modalBodyText}>{selectedCourse?.entryRequirements}</Text>
              </View>

              {/* Curriculum */}
              {selectedCourse?.curriculum && selectedCourse.curriculum.length > 0 && (
                <View style={styles.modalSectionCard}>
                  <View style={styles.modalSectionHeaderRow}>
                    <Ionicons name="layers-outline" size={18} color={COLORS.primaryPurple} />
                    <Text style={styles.modalSectionTitle}>Curriculum & Practical Modules</Text>
                  </View>
                  {selectedCourse.curriculum.map((mod, idx) => (
                    <View key={idx} style={styles.checkListItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 8, marginTop: 2 }} />
                      <Text style={styles.checkListText}>{mod}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Career Opportunities */}
              {selectedCourse?.careerOpportunities && selectedCourse.careerOpportunities.length > 0 && (
                <View style={styles.modalSectionCard}>
                  <View style={styles.modalSectionHeaderRow}>
                    <Ionicons name="briefcase-outline" size={18} color={COLORS.primaryPurple} />
                    <Text style={styles.modalSectionTitle}>Career & Employment Pathways</Text>
                  </View>
                  {selectedCourse.careerOpportunities.map((career, idx) => (
                    <View key={idx} style={styles.checkListItem}>
                      <Ionicons name="star" size={14} color="#D97706" style={{ marginRight: 8, marginTop: 3 }} />
                      <Text style={styles.checkListText}>{career}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActionButtonsRow}>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => selectedCourse?.applicationUrl && handleOpenLink(selectedCourse.applicationUrl)}
                >
                  <Ionicons name="newspaper-outline" size={18} color={COLORS.white} />
                  <Text style={styles.primaryActionButtonText}>Apply Online / Download Application</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={() => handleCall(NVTI_PROFILE.hotline)}
                >
                  <Ionicons name="call-outline" size={18} color={COLORS.primaryPurple} />
                  <Text style={styles.secondaryActionButtonText}>Call VTA Hotline: 011-2581177</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default NVTICoursesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.softGray,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  heroTitles: {
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
    gap: 4,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginTop: 1,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.darkNavy,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 2,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECECF2',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#F5F3FF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },
  tabTextActive: {
    color: COLORS.primaryPurple,
  },
  searchSection: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#ECECF2',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
    color: COLORS.darkNavy,
  },
  filterSection: {
    marginBottom: 10,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECECF2',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkNavy,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  secondaryFilterRow: {
    marginBottom: 8,
  },
  smallFilterPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#ECECF2',
  },
  smallFilterPillActive: {
    backgroundColor: COLORS.darkNavy,
    borderColor: COLORS.darkNavy,
  },
  smallFilterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  smallFilterPillTextActive: {
    color: COLORS.white,
  },
  districtFilterRow: {
    marginBottom: 14,
  },
  districtPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#ECECF2',
  },
  districtPillActive: {
    backgroundColor: COLORS.modernBlue,
    borderColor: COLORS.modernBlue,
  },
  districtPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  districtPillTextActive: {
    color: COLORS.white,
  },
  coursesListContainer: {
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECF2',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: COLORS.primaryPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  centersListContainer: {
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 2,
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginBottom: 12,
  },
  centerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECECF2',
  },
  centerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  centerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  centerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 4,
  },
  centerBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  specializationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  specializationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    flex: 1,
  },
  centerDetailsList: {
    gap: 6,
    marginBottom: 12,
  },
  centerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerDetailText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    flex: 1,
  },
  linkText: {
    color: COLORS.primaryPurple,
    fontWeight: '600',
  },
  centerCoursesBox: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  centerCoursesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  centerCourseBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  centerCourseBulletText: {
    fontSize: 12,
    color: COLORS.darkNavy,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 40,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginBottom: 2,
  },
  modalTitleText: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 25,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    padding: 18,
  },
  modalBadgesStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  infoGridCard: {
    width: (width - 36 - 10) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginTop: 4,
    marginBottom: 2,
  },
  infoGridValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  modalSectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  modalBodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.darkNavy,
  },
  locationPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.darkNavy,
  },
  checkListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  checkListText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.darkNavy,
    flex: 1,
    fontWeight: '500',
  },
  modalActionButtonsRow: {
    gap: 10,
    marginTop: 8,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 8,
  },
  secondaryActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
});
