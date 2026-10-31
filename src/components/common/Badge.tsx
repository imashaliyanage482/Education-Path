import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

export type BadgeVariant = 'purple' | 'blue' | 'success' | 'warning' | 'danger' | 'gray';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'purple', style }) => {
  return (
    <View style={[styles.container, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  purple: {
    backgroundColor: COLORS.softLavender,
  },
  blue: {
    backgroundColor: COLORS.lightBlue,
  },
  success: {
    backgroundColor: COLORS.successLight,
  },
  warning: {
    backgroundColor: COLORS.warningLight,
  },
  danger: {
    backgroundColor: COLORS.dangerLight,
  },
  gray: {
    backgroundColor: COLORS.softGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  purpleText: {
    color: COLORS.primaryPurple,
  },
  blueText: {
    color: COLORS.modernBlue,
  },
  successText: {
    color: COLORS.success,
  },
  warningText: {
    color: COLORS.warning,
  },
  dangerText: {
    color: COLORS.danger,
  },
  grayText: {
    color: COLORS.secondaryText,
  },
});

export default Badge;
