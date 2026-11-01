import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useTranslation } from '../context/LanguageContext';
import { InstitutionService } from '../services/api';
import {
  GOVERNMENT_VOCATIONAL_INSTITUTIONS,
  INSTITUTION_CATEGORIES,
} from '../data/sampleInstitutions';
import { GovernmentInstitutionCategory, Institution } from '../types';

const INSTITUTION_LOGOS: Record<string, any> = {
  UoVT: require('../../assets/institutes/uovt_logo.png'),
  SLIATE: require('../../assets/institutes/sliate_logo.png'),
  DTET: require('../../assets/institutes/dtet_logo.png'),
  VTA: require('../../assets/institutes/vta_logo.png'),
  NVTI: require('../../assets/institutes/nvti_logo.png'),
  NAITA: require('../../assets/institutes/naita_logo.png'),
  CGTTI: require('../../assets/institutes/cgtti_logo.png'),
  NYSC: require('../../assets/institutes/nysc_logo.png'),
};

interface GovernmentInstitutionsScreenProps {
  navigation: any;
}

export const GovernmentInstitutionsScreen: React.FC<GovernmentInstitutionsScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { isSinhala } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>(GOVERNMENT_VOCATIONAL_INSTITUTIONS);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadLiveInstitutions = async () => {
        try {
          const liveList = await InstitutionService.getAllInstitutions();
          if (liveList && liveList.length > 0 && isMounted) {
            setInstitutions(liveList);
          }
        } catch (err) {
          console.warn('Failed to fetch live institutions:', err);
        }
      };
      loadLiveInstitutions();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const filteredInstitutions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q.length === 0) return institutions;
    return institutions.filter(
      (inst) =>
        inst.shortName.toLowerCase().includes(q) ||
        inst.name.toLowerCase().includes(q) ||
        inst.category.toLowerCase().includes(q)
    );
  }, [institutions, searchQuery]);

  const getInstitutionIcon = (shortName: string): keyof typeof Ionicons.glyphMap => {
    switch (shortName) {
      case 'UoVT':
        return 'school';
      case 'SLIATE':
        return 'laptop-outline';
      case 'DTET':
        return 'business-outline';
      case 'VTA':
        return 'construct';
      case 'NVTI':
        return 'build-outline';
      case 'NAITA':
        return 'ribbon-outline';
      case 'CGTTI':
        return 'hardware-chip-outline';
      case 'NYSC':
        return 'people-outline';
      default:
        return 'school-outline';
    }
  };

  const getCategoryColor = (category: GovernmentInstitutionCategory) => {
    switch (category) {
      case 'Vocational Universities':
        return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'Advanced Technological Institutes':
        return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'Technical Colleges':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'Vocational Training Centres':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'Apprenticeship Institutes':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'Engineering Training Institutes':
        return { bg: '#E0E7FF', text: '#4338CA' };
      case 'Youth Training Institutes':
        return { bg: '#FCE7F3', text: '#BE185D' };
      default:
        return { bg: COLORS.softLavender, text: COLORS.primaryPurple };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Screen Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 12) + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.darkNavy} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {isSinhala ? 'රජයේ වෘත්තීය ආයතන' : 'Government Institutes'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isSinhala
              ? 'ප්‍රධාන රාජ්‍ය කාණ්ඩ 7 • ප්‍රමුඛ රාජ්‍ය ආයතන 8'
              : '7 National Categories • 8 Statutory State Institutes'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Info Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primaryPurple} />
            <Text style={styles.heroBadgeText}>
              {isSinhala ? 'නිල රාජ්‍ය ආයතන නාමාවලිය' : 'Official State Institutes'}
            </Text>
          </View>
          <Text style={styles.heroTitle}>
            {isSinhala
              ? 'රජයේ වෘත්තීය හා කාර්මික අධ්‍යාපන ආයතන'
              : 'Government Vocational & Technical Training Institutes'}
          </Text>
          <Text style={styles.heroDescription}>
            {isSinhala
              ? 'NVQ Level 3 සිට Degree සහ HND මට්ටම දක්වා රජයේ පිළිගත් නොමිලේ හෝ සහන ගාස්තු යටතේ හදාරන්න පුළුවන් වෘත්තීය පාඨමාලා මෙහිදී ගවේෂණය කරන්න.'
              : 'Explore verified state-sponsored TVET institutions providing NVQ Level 3 to 7 Degrees, HNDs, and technical diploma pathways across Sri Lanka.'}
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              isSinhala
                ? 'ආයතන නම හෝ කෙටි නම සොයන්න (VTA, SLIATE...)'
                : 'Search institute or acronym (e.g. VTA, SLIATE)...'
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

        {/* Result Counter */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsCount}>
            {filteredInstitutions.length}{' '}
            {isSinhala ? 'ආයතන සොයා ගන්නා ලදී' : 'institutes found'}
          </Text>
        </View>

        {/* List of Institutions */}
        {filteredInstitutions.map((inst: Institution) => {
          const isUoVT = inst.shortName === 'UoVT' || inst.id === 'gov-inst-1';
          const isSLIATE = inst.shortName === 'SLIATE' || inst.id === 'gov-inst-3';
          const isDTET = inst.shortName === 'DTET' || inst.id === 'gov-inst-4';
          const isVTA = inst.shortName === 'VTA' || inst.id === 'gov-inst-5';
          const isNVTI = inst.shortName === 'NVTI' || inst.id === 'gov-inst-6';
          const isNAITA = inst.shortName === 'NAITA' || inst.id === 'gov-inst-7';
          const isCGTTI = inst.shortName === 'CGTTI' || inst.id === 'gov-inst-9';
          const isNYSC = inst.shortName === 'NYSC' || inst.id === 'gov-inst-10';
          const iconName = getInstitutionIcon(inst.shortName);
          const colorTheme = getCategoryColor(inst.category);
          const logoSource = INSTITUTION_LOGOS[inst.shortName] || (inst.logo ? { uri: inst.logo } : null);

          const handlePress = () => {
            if (isUoVT) {
              navigation.navigate('UoVTCourses');
            } else if (isSLIATE) {
              navigation.navigate('SLIATECourses');
            } else if (isDTET) {
              navigation.navigate('DTETCourses');
            } else if (isVTA) {
              navigation.navigate('VTACourses');
            } else if (isNVTI) {
              navigation.navigate('NVTICourses');
            } else if (isNAITA) {
              navigation.navigate('NAITACourses');
            } else if (isCGTTI) {
              navigation.navigate('CGTTICourses');
            } else if (isNYSC) {
              navigation.navigate('NYSCCourses');
            } else {
              navigation.navigate('CourseExplorer', {
                initialInstitutionId: inst.id,
              });
            }
          };

          return (
            <View key={inst.id} style={styles.institutionCard}>
              <View style={styles.cardHeaderRow}>
                {logoSource ? (
                  <View style={styles.logoBox}>
                    <Image
                      source={logoSource}
                      style={styles.instLogoImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colorTheme.bg },
                    ]}
                  >
                    <Ionicons name={iconName} size={28} color={colorTheme.text} />
                  </View>
                )}

                <View style={styles.headerInfo}>
                  <View style={styles.acronymRow}>
                    <Text style={styles.instAcronym}>{inst.shortName}</Text>
                    <View style={[styles.categoryTag, { backgroundColor: colorTheme.bg }]}>
                      <Text style={[styles.categoryTagText, { color: colorTheme.text }]}>
                        {inst.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.instFullName}>{inst.name}</Text>
                </View>
              </View>

              {/* Action Button: Uniform View Courses for all cards (Light Soft Theme) */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.viewCourseButton}
                  onPress={handlePress}
                  activeOpacity={0.8}
                >
                  <Ionicons name="book-outline" size={16} color="#6D28D9" />
                  <Text style={styles.viewCourseButtonText}>
                    {isSinhala ? 'පාඨමාලා බලන්න (View Courses)' : 'View Courses'}
                  </Text>
                  <Ionicons name="arrow-forward" size={15} color="#6D28D9" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default GovernmentInstitutionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.softGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 12,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 24,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 19,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkNavy,
  },
  categoriesScroll: {
    paddingBottom: 14,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  categoryPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  resultsRow: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  institutionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  instLogoImage: {
    width: '100%',
    height: '100%',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  acronymRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  instAcronym: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  instFullName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 19,
  },
  cardActionsRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  viewCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#D8B4FE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewCourseButtonText: {
    color: '#6D28D9',
    fontSize: 13,
    fontWeight: '700',
  },
});
