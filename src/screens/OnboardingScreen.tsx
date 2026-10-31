import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Button } from '../components/common/Button';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

// Uploaded custom welcome image
const welcomeHeroImage = require('../../assets/welcome_hero.png');

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Custom Hero Image Card */}
        <View style={styles.imageCard}>
          <Image
            source={welcomeHeroImage}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeBigText}>Welcome,</Text>
          <Text style={styles.explorerSubText}>Future Explorer</Text>
          <Text style={styles.welcomeDescription}>
            Your journey begins here. Discover accredited degrees, diplomas, and technical career pathways tailored to your qualifications and future goals.
          </Text>
        </View>
      </View>

      {/* Bottom Action Area: Get Started Button */}
      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={onFinish}
          variant="primary"
          size="large"
          style={styles.getStartedBtn}
        />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  imageCard: {
    width: width - 36,
    height: Math.min(height * 0.44, 380),
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 5,
    marginBottom: 18,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  welcomeBigText: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.darkNavy,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  explorerSubText: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.primaryPurple,
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
    marginBottom: 4,
  },
  welcomeDescription: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 8,
  },
  getStartedBtn: {
    width: '100%',
    borderRadius: 16,
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
