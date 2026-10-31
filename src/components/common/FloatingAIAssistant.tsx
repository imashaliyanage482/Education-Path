import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface FloatingAIAssistantProps {
  onPress: () => void;
  showBadge?: boolean;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ onPress, showBadge = true }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel="Open EduPath AI Advisor"
    >
      <View style={styles.iconCircle}>
        <Ionicons name="sparkles" size={24} color={COLORS.white} />
        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 999,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.modernBlue,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
});

export default FloatingAIAssistant;
