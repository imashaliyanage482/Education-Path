import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { SearchBar } from '../components/common/SearchBar';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { FloatingAIAssistant } from '../components/common/FloatingAIAssistant';
import { useTranslation } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

// Custom images uploaded by user
const heroStepsImage = require('../../assets/hero_steps.png');
const institutionsBannerImage = require('../../assets/institutions_banner.png');

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t, isSinhala } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      navigation.navigate('GovernmentInstitutions', {
        initialQuery: searchQuery,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showLanguageToggle={true}
        rightAction={
          <TouchableOpacity
            style={styles.adminHeaderBtn}
            onPress={() => navigation.navigate('AdminLogin')}
            activeOpacity={0.75}
            accessibilityLabel="Admin Portal"
          >
            <Ionicons name="shield-checkmark" size={15} color={COLORS.primaryPurple} />
            <Text style={styles.adminHeaderBtnText}>Admin</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Custom Steps Artwork */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={heroStepsImage}
            style={styles.heroBannerBackground}
            imageStyle={styles.heroBannerImageStyle}
            resizeMode="cover"
          >
            <View style={styles.heroContentOverlay}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.verifiedTag}>
                  <Ionicons name="shield-checkmark" size={14} color={COLORS.primaryPurple} />
                  <Text style={styles.verifiedTagText}>Sri Lanka Higher Education Portal</Text>
                </View>
              </View>

              <Text style={styles.welcomeTitle}>{t('welcomeTitle')}</Text>
              <Text style={styles.welcomeSubtitle}>{t('welcomeSubtitle')}</Text>

              {/* Main CTA Button */}
              <Button
                title={t('ctaFindPath')}
                onPress={() => navigation.navigate('MyPathTab', { screen: 'FindMyPath' })}
                variant="primary"
                size="large"
                icon="compass"
                style={styles.ctaButton}
              />
            </View>
          </ImageBackground>

          {/* Search Bar */}
          <View style={styles.heroSearchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('searchPlaceholder')}
              onClear={() => setSearchQuery('')}
              onSubmitEditing={handleSearchSubmit}
              onFilterPress={() => navigation.navigate('GovernmentInstitutions')}
            />
          </View>
        </View>

        {/* AI Education Advisor Promotional Card */}
        <View style={styles.aiPromoCard}>
          <View style={styles.aiCardLeft}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={14} color={COLORS.primaryPurple} />
              <Text style={styles.aiBadgeText}>AI Guidance</Text>
            </View>
            <Text style={styles.aiCardTitle}>{t('sectionAiPromo')}</Text>
            <Text style={styles.aiCardSubtitle}>{t('aiPromoDesc')}</Text>
            <TouchableOpacity
              style={styles.aiCardButton}
              onPress={() => navigation.navigate('AITab')}
              activeOpacity={0.8}
            >
              <Text style={styles.aiCardButtonText}>{t('askAiButton')}</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.aiAvatarWrapper}>
            <View style={styles.aiAvatarCircle}>
              <Ionicons name="chatbubbles" size={32} color={COLORS.primaryPurple} />
            </View>
          </View>
        </View>

        {/* Government Institutions Discovery Card */}
        <View style={styles.courseDiscoveryCard}>
          <ImageBackground
            source={institutionsBannerImage}
            style={styles.discoveryImageBackground}
            imageStyle={styles.discoveryImage}
            resizeMode="cover"
          >
            <View style={styles.discoveryOverlay}>
              <View style={styles.discoveryBadge}>
                <Ionicons name="business" size={14} color={COLORS.primaryPurple} />
                <Text style={styles.discoveryBadgeText}>
                  {isSinhala ? 'රජයේ වෘත්තීය ආයතන නාමාවලිය' : 'Statutory TVET Institutes'}
                </Text>
              </View>
              <Text style={styles.discoveryTitle}>
                {isSinhala
                  ? 'රජයේ වෘත්තීය හා කාර්මික අධ්‍යාපන ආයතන'
                  : 'Government Vocational & Technical Training Institutes'}
              </Text>
              <Text style={styles.discoveryDescription}>
                {isSinhala
                  ? 'රජයේ පිළිගත් වෘත්තීය ආයතනවල NVQ, ඩිප්ලෝමා හා උපාධි පාඨමාලා මෙතැනින් සොයන්න.'
                  : 'Explore accredited NVQ, Diploma & Degree pathways across statutory training institutes.'}
              </Text>
              <TouchableOpacity
                style={styles.discoveryButton}
                onPress={() => navigation.navigate('GovernmentInstitutions')}
                activeOpacity={0.8}
              >
                <Ionicons name="business-outline" size={16} color={COLORS.white} />
                <Text style={styles.discoveryButtonText}>
                  {isSinhala ? 'ආයතන බලන්න (View Institutions)' : 'View Institutions'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating AI Bubble */}
      <FloatingAIAssistant onPress={() => navigation.navigate('AITab')} />
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
  adminHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  adminHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  heroSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  heroBannerBackground: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  heroBannerImageStyle: {
    borderRadius: 20,
  },
  heroContentOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  heroSearchWrapper: {
    marginTop: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  verifiedTagText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 5,
  },
  welcomeTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 33,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    color: COLORS.secondaryText,
    lineHeight: 20,
    marginBottom: 18,
  },
  ctaButton: {
    marginBottom: 16,
  },
  aiPromoCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    backgroundColor: '#FAF5FF',
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 20,
    minHeight: 160,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  aiCardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
    marginLeft: 4,
  },
  aiCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  aiCardSubtitle: {
    fontSize: 12.5,
    color: COLORS.secondaryText,
    lineHeight: 18,
    marginBottom: 14,
  },
  aiCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  aiCardButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: 6,
  },
  aiAvatarWrapper: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#F3E8FF',
  },
  courseDiscoveryCard: {
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  discoveryImageBackground: {
    width: '100%',
  },
  discoveryImage: {
    borderRadius: 22,
  },
  discoveryOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.93)',
    paddingHorizontal: 22,
    paddingVertical: 28,
    minHeight: 195,
  },
  discoveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
    marginBottom: 10,
  },
  discoveryBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  discoveryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 25,
    marginBottom: 8,
  },
  discoveryDescription: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 18,
  },
  discoveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  discoveryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default HomeScreen;
