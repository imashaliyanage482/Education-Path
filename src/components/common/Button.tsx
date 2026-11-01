import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const containerStyles: StyleProp<ViewStyle> = [
    styles.baseContainer,
    styles[size],
    isPrimary ? styles.primaryContainer : undefined,
    isSecondary ? styles.secondaryContainer : undefined,
    isOutline ? styles.outlineContainer : undefined,
    isGhost ? styles.ghostContainer : undefined,
    disabled || loading ? styles.disabledContainer : undefined,
    style,
  ];

  const labelStyles: StyleProp<TextStyle> = [
    styles.baseText,
    styles[`${size}Text`],
    isPrimary ? styles.primaryText : undefined,
    isSecondary ? styles.secondaryText : undefined,
    isOutline ? styles.outlineText : undefined,
    isGhost ? styles.ghostText : undefined,
    disabled || loading ? styles.disabledText : undefined,
    textStyle,
  ];

  const getIconColor = () => {
    if (disabled) return COLORS.secondaryText;
    if (isPrimary) return COLORS.white;
    if (isSecondary) return COLORS.primaryPurple;
    if (isOutline) return COLORS.primaryPurple;
    return COLORS.primaryPurple;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={containerStyles}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.primaryPurple} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={size === 'small' ? 16 : 18} color={getIconColor()} style={styles.leftIcon} />
          )}
          <Text style={labelStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={size === 'small' ? 16 : 18} color={getIconColor()} style={styles.rightIcon} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  large: {
    paddingVertical: 15,
    paddingHorizontal: 26,
  },
  primaryContainer: {
    backgroundColor: COLORS.primaryPurple,
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryContainer: {
    backgroundColor: COLORS.softLavender,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primaryPurple,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  disabledContainer: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 16,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.primaryPurple,
  },
  outlineText: {
    color: COLORS.primaryPurple,
  },
  ghostText: {
    color: COLORS.primaryPurple,
  },
  disabledText: {
    color: COLORS.secondaryText,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
