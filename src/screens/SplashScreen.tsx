import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.85);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoBadge}>
          <Ionicons name="compass" size={48} color={COLORS.white} />
        </View>

        <Text style={styles.title}>EduPath</Text>
        <Text style={styles.tagline}>Discover Your Next Step.</Text>

        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>Sri Lanka Higher Education & Career Guide</Text>
        </View>
      </Animated.View>

      <View style={styles.bottomIndicator}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.darkNavy,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryPurple,
    letterSpacing: 0.2,
    marginBottom: 20,
  },
  pillBadge: {
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  pillText: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '700',
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  activeDot: {
    width: 18,
    backgroundColor: COLORS.primaryPurple,
  },
});

export default SplashScreen;
