import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { useTranslation } from '../../context/LanguageContext';

const ANDROID_STATUS_BAR = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showLanguageToggle?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  showLanguageToggle = true,
  rightAction,
}) => {
  const { language, toggleLanguage } = useTranslation();

  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch (e) {
    // In case rendered outside NavigationContainer
  }

  const handleGoHome = () => {
    if (!navigation) return;
    try {
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
    } catch (e) {
      try {
        navigation.navigate('HomeTab');
      } catch (err) {
        try {
          navigation.navigate('Home');
        } catch (err2) {}
      }
    }
  };

  const handleOpenAdmin = () => {
    if (!navigation) return;
    try {
      navigation.navigate('AdminLogin');
    } catch (e) {}
  };

  let insetsTop = 0;
  try {
    const insets = useSafeAreaInsets();
    insetsTop = insets.top;
  } catch (e) {}

  const calculatedPaddingTop = Math.max(
    insetsTop,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 38) : 16,
    Platform.OS === 'android' ? 38 : 0
  ) + (Platform.OS === 'android' ? 12 : 8);

  return (
    <View style={[styles.container, { paddingTop: calculatedPaddingTop }]}>
      <View style={styles.topRow}>
        <View style={styles.leftContainer}>
          {showBack && onBackPress ? (
            <View style={styles.backAndBrandRow}>
              <TouchableOpacity
                onPress={onBackPress}
                style={styles.backButton}
                activeOpacity={0.7}
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={22} color={COLORS.darkNavy} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.brandContainer}
                onPress={handleGoHome}
                onLongPress={handleOpenAdmin}
                delayLongPress={1200}
                activeOpacity={0.7}
                accessibilityLabel="Go to Home screen"
              >
                <View style={[styles.brandIconWrapper, { width: 28, height: 28 }]}>
                  <Ionicons name="compass" size={17} color={COLORS.white} />
                </View>
                <Text style={[styles.brandName, { fontSize: 18 }]}>EduPath</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.brandContainer}
              onPress={handleGoHome}
              onLongPress={handleOpenAdmin}
              delayLongPress={1200}
              activeOpacity={0.7}
              accessibilityLabel="Go to Home screen"
            >
              <View style={styles.brandIconWrapper}>
                <Ionicons name="compass" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.brandName}>EduPath</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightContainer}>
          {showLanguageToggle && (
            <TouchableOpacity
              onPress={toggleLanguage}
              style={styles.languageToggle}
              activeOpacity={0.7}
              accessibilityLabel="Switch language"
            >
              <Ionicons name="globe-outline" size={16} color={COLORS.primaryPurple} />
              <Text style={styles.languageText}>
                {language === 'en' ? 'සිංහල' : 'English'}
              </Text>
            </TouchableOpacity>
          )}
          {rightAction}
        </View>
      </View>

      {title ? (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : ANDROID_STATUS_BAR + 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backAndBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkNavy,
    letterSpacing: -0.5,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.softGray,
    marginRight: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginLeft: 4,
  },
  titleContainer: {
    marginTop: 10,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkNavy,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 3,
    lineHeight: 18,
  },
});

export default Header;
