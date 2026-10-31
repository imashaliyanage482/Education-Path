import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useTranslation } from '../context/LanguageContext';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t, language, setLanguage, isSinhala } = useTranslation();
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(
    null
  );

  const handleOpenEmail = () => {
    Linking.openURL('mailto:support@edupath.lk?subject=EduPath Guidance Inquiry');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('settingsTitle')} showLanguageToggle={false} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
        {/* Guest Mode Indicator Card */}
        <View style={styles.guestCard}>
          <View style={styles.guestAvatar}>
            <Ionicons name="person-outline" size={26} color={COLORS.primaryPurple} />
          </View>
          <View style={styles.guestInfo}>
            <View style={styles.guestBadgeRow}>
              <Text style={styles.guestTitle}>Guest Student</Text>
              <Badge label="Guest Mode" variant="purple" />
            </View>
            <Text style={styles.guestDesc}>{t('guestModeDesc')}</Text>
          </View>
        </View>

        {/* Language Selection Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <Text style={styles.sectionSubtitle}>{t('languageDesc')}</Text>

          <View style={styles.langToggleRow}>
            <TouchableOpacity
              style={[styles.langOption, language === 'en' && styles.langOptionActive]}
              onPress={() => setLanguage('en')}
              activeOpacity={0.8}
            >
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
                English
              </Text>
              {language === 'en' && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primaryPurple} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langOption, language === 'si' && styles.langOptionActive]}
              onPress={() => setLanguage('si')}
              activeOpacity={0.8}
            >
              <Text style={[styles.langText, language === 'si' && styles.langTextActive]}>
                සිංහල (Sinhala)
              </Text>
              {language === 'si' && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primaryPurple} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Demonstration Data Notice */}
        <View style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primaryPurple} />
            <Text style={styles.demoTitle}>{t('demoDataNotice')}</Text>
          </View>
          <Text style={styles.demoText}>{t('demoDataNoticeText')}</Text>
        </View>

        {/* General Information Links */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('SavedCourses')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="bookmark-outline" size={20} color={COLORS.modernBlue} />
              <Text style={styles.settingItemLabel}>Saved Courses</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setActiveModal('about')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.primaryPurple} />
              <Text style={styles.settingItemLabel}>{t('aboutEduPath')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setActiveModal('privacy')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.modernBlue} />
              <Text style={styles.settingItemLabel}>{t('privacyPolicy')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setActiveModal('terms')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primaryPurple} />
              <Text style={styles.settingItemLabel}>{t('termsOfService')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={() => setActiveModal('contact')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="mail-outline" size={20} color={COLORS.modernBlue} />
              <Text style={styles.settingItemLabel}>{t('contactUs')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Version info - Protected Developer & Admin Entry Point */}
        <TouchableOpacity
          style={styles.versionContainer}
          activeOpacity={0.8}
          delayLongPress={1200}
          onLongPress={() => navigation.navigate('AdminLogin')}
        >
          <Text style={styles.versionText}>EduPath Mobile v2.4.0 (Build 2026.11)</Text>
          <Text style={styles.taglineText}>Discover Your Next Step.</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Detail Modals for About, Privacy, Terms, Contact */}
      <Modal visible={activeModal !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === 'about' && t('aboutEduPath')}
                {activeModal === 'privacy' && t('privacyPolicy')}
                {activeModal === 'terms' && t('termsOfService')}
                {activeModal === 'contact' && t('contactUs')}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={COLORS.darkNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {activeModal === 'about' && (
                <View>
                  <Text style={styles.modalParagraph}>{t('aboutText')}</Text>
                  <Text style={[styles.modalParagraph, { marginTop: 10 }]}>
                    EduPath bridges the gap between secondary school qualifications (O/L and A/L) and university or professional qualifications in Sri Lanka.
                  </Text>
                  <Text style={[styles.modalParagraph, { marginTop: 10 }]}>
                    Features: Course Explorer, Step-by-Step Path Finder, Structured Qualification Checker, Visual Career Roadmaps, and EduPath AI Advisor.
                  </Text>
                </View>
              )}

              {activeModal === 'privacy' && (
                <View>
                  <Text style={styles.modalParagraph}>
                    EduPath respects student privacy. Registration is completely optional. We do not permanently store your qualification grades or chat transcripts by default in Guest Mode.
                  </Text>
                  <Text style={[styles.modalParagraph, { marginTop: 10 }]}>
                    All AI interactions are processed through secured backend endpoints without exposing sensitive API tokens on the device.
                  </Text>
                </View>
              )}

              {activeModal === 'terms' && (
                <View>
                  <Text style={styles.modalParagraph}>
                    EduPath provides educational guidance and verified institutional criteria for informational purposes. Final admissions, fee structures, and scholarship determinations rest exclusively with the respective university or educational institute.
                  </Text>
                </View>
              )}

              {activeModal === 'contact' && (
                <View style={{ alignItems: 'center', paddingVertical: 14 }}>
                  <Ionicons name="mail" size={48} color={COLORS.primaryPurple} />
                  <Text style={styles.contactEmail}>support@edupath.lk</Text>
                  <Text style={styles.contactSub}>Colombo, Sri Lanka</Text>
                  <Button
                    title="Send Email Inquiries"
                    variant="primary"
                    onPress={handleOpenEmail}
                    style={{ marginTop: 20, width: '100%' }}
                  />
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
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
  contentPadding: {
    padding: 20,
    gap: 16,
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guestAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  guestInfo: {
    flex: 1,
  },
  guestBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  guestDesc: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
    marginBottom: 12,
  },
  langToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.softGray,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langOptionActive: {
    backgroundColor: COLORS.softLavender,
    borderColor: COLORS.primaryPurple,
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkNavy,
  },
  langTextActive: {
    color: COLORS.primaryPurple,
    fontWeight: '700',
  },
  demoCard: {
    backgroundColor: COLORS.softLavender,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryPurple,
    marginLeft: 6,
  },
  demoText: {
    fontSize: 11,
    color: COLORS.darkNavy,
    lineHeight: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkNavy,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
  taglineText: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '700',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.softGray,
    borderRadius: 16,
  },
  modalBody: {
    padding: 20,
  },
  modalParagraph: {
    fontSize: 13,
    color: COLORS.darkNavy,
    lineHeight: 20,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryPurple,
    marginTop: 10,
  },
  contactSub: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
});

export default SettingsScreen;
