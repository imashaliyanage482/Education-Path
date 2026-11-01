import React from 'react';
import { Text, View, StyleSheet, TextStyle, ViewStyle } from 'react-native';

export interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle | ViewStyle;
}

// Unicode characters that respect the exact `color` prop
const COLORABLE_SYMBOLS: Record<string, string> = {
  // Navigation & Chevrons
  'arrow-back': '←',
  'arrow-back-outline': '←',
  'chevron-back': '‹',
  'chevron-back-outline': '‹',
  'arrow-forward': '→',
  'arrow-forward-outline': '→',
  'chevron-forward': '›',
  'chevron-forward-outline': '›',
  'chevron-down': '▾',
  'chevron-down-outline': '▾',
  'chevron-up': '▴',
  'chevron-up-outline': '▴',
  'close': '✕',
  'close-outline': '✕',
  'close-circle': '✕',
  'close-circle-outline': '✕',
  'checkmark': '✓',
  'checkmark-outline': '✓',
  'checkmark-circle': '✓',
  'checkmark-circle-outline': '✓',
  'add': '+',
  'add-outline': '+',
  'add-circle': '+',
  'add-circle-outline': '+',
  'menu': '☰',
  'menu-outline': '☰',
  'options': '⚙',
  'options-outline': '⚙',
  'filter': '⚙',
  'filter-outline': '⚙',
};

// Rich Universal Emojis that are natively built into all Android devices
const EMOJI_ICONS: Record<string, string> = {
  // Tabs & Main Navigation
  'home': '🏠',
  'home-outline': '🏠',
  'compass': '🧭',
  'compass-outline': '🧭',
  'sparkles': '✨',
  'sparkles-outline': '✨',
  'bookmark': '🔖',
  'bookmark-outline': '🔖',
  
  // Education & Institutions
  'school': '🎓',
  'school-outline': '🎓',
  'book': '📚',
  'book-outline': '📚',
  'library': '🏛️',
  'library-outline': '🏛️',
  'ribbon': '🎖️',
  'ribbon-outline': '🎖️',
  'trophy': '🏆',
  'trophy-outline': '🏆',
  
  // Search & Discover
  'search': '🔍',
  'search-outline': '🔍',
  'funnel': '🔍',
  'funnel-outline': '🔍',
  
  // Specs & Details
  'time': '⏱️',
  'time-outline': '⏱️',
  'laptop': '💻',
  'laptop-outline': '💻',
  'location': '📍',
  'location-outline': '📍',
  'cash': '💵',
  'cash-outline': '💵',
  'wallet': '👛',
  'wallet-outline': '👛',
  'star': '⭐',
  'star-outline': '⭐',
  'heart': '❤️',
  'heart-outline': '🤍',
  'checkbox': '✅',
  'checkbox-outline': '☑️',
  
  // Institution Specifics (VTA, CGTTI, NVTI, NAITA, DTET, NYSC, SLIATE, UoVT)
  'build': '🛠️',
  'build-outline': '🛠️',
  'construct': '🏗️',
  'construct-outline': '🏗️',
  'hardware-chip': '⚙️',
  'hardware-chip-outline': '⚙️',
  'car-sport': '🚗',
  'car-sport-outline': '🚗',
  'people': '👥',
  'people-outline': '👥',
  'person': '👤',
  'person-outline': '👤',
  'business': '🏢',
  'business-outline': '🏢',
  
  // Actions & Utilities
  'call': '📞',
  'call-outline': '📞',
  'mail': '✉️',
  'mail-outline': '✉️',
  'globe': '🌐',
  'globe-outline': '🌐',
  'link': '🔗',
  'link-outline': '🔗',
  'share-social': '↗️',
  'share-social-outline': '↗️',
  'refresh': '🔄',
  'refresh-outline': '🔄',
  'information-circle': 'ℹ️',
  'information-circle-outline': 'ℹ️',
  'alert-circle': '⚠️',
  'alert-circle-outline': '⚠️',
  'trash': '🗑️',
  'trash-outline': '🗑️',
  'pencil': '✏️',
  'pencil-outline': '✏️',
  'create': '✏️',
  'create-outline': '✏️',
  'eye': '👁️',
  'eye-outline': '👁️',
  'eye-off': '🙈',
  'eye-off-outline': '🙈',
  'log-in': '🔑',
  'log-in-outline': '🔑',
  'log-out': '🚪',
  'log-out-outline': '🚪',
  'settings': '⚙️',
  'settings-outline': '⚙️',
  'lock-closed': '🔒',
  'lock-closed-outline': '🔒',
  'stats-chart': '📊',
  'stats-chart-outline': '📊',
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color = '#1E1B4B',
  style,
}) => {
  const normalizedName = (name || '').toLowerCase().trim();

  // 1. Check if it's a colorable symbol (arrows, crosses, checkmarks, etc.)
  if (COLORABLE_SYMBOLS[normalizedName]) {
    const symbol = COLORABLE_SYMBOLS[normalizedName];
    const isArrow = symbol === '←' || symbol === '→' || symbol === '‹' || symbol === '›';
    const isChevron = symbol === '‹' || symbol === '›';

    return (
      <View style={[styles.container, { width: size, height: size }, style as ViewStyle]}>
        <Text
          style={[
            styles.symbolText,
            {
              fontSize: isChevron ? size * 1.2 : isArrow ? size * 0.95 : size * 0.85,
              color: color,
              fontWeight: isChevron ? '300' : '700',
              lineHeight: size,
            },
            style as TextStyle,
          ]}
        >
          {symbol}
        </Text>
      </View>
    );
  }

  // 2. Check if it's a rich universal emoji
  let emoji = EMOJI_ICONS[normalizedName];

  // Fuzzy match if not found exactly
  if (!emoji) {
    if (normalizedName.includes('home')) emoji = '🏠';
    else if (normalizedName.includes('compass') || normalizedName.includes('path')) emoji = '🧭';
    else if (normalizedName.includes('sparkle') || normalizedName.includes('ai') || normalizedName.includes('star')) emoji = '✨';
    else if (normalizedName.includes('school') || normalizedName.includes('degree') || normalizedName.includes('grad')) emoji = '🎓';
    else if (normalizedName.includes('book')) emoji = '📚';
    else if (normalizedName.includes('search')) emoji = '🔍';
    else if (normalizedName.includes('time') || normalizedName.includes('clock')) emoji = '⏱️';
    else if (normalizedName.includes('laptop') || normalizedName.includes('computer')) emoji = '💻';
    else if (normalizedName.includes('location') || normalizedName.includes('pin') || normalizedName.includes('map')) emoji = '📍';
    else if (normalizedName.includes('bookmark') || normalizedName.includes('save')) emoji = '🔖';
    else if (normalizedName.includes('close') || normalizedName.includes('cross')) emoji = '✕';
    else if (normalizedName.includes('check')) emoji = '✔️';
    else if (normalizedName.includes('arrow') && normalizedName.includes('back')) emoji = '←';
    else if (normalizedName.includes('arrow')) emoji = '→';
    else if (normalizedName.includes('build') || normalizedName.includes('tool') || normalizedName.includes('construct')) emoji = '🛠️';
    else if (normalizedName.includes('heart')) emoji = '❤️';
    else if (normalizedName.includes('filter')) emoji = '⚙️';
    else emoji = '🔹';
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style as ViewStyle]}>
      <Text
        style={[
          styles.emojiText,
          {
            fontSize: size * 0.85,
            lineHeight: size,
          },
          style as TextStyle,
        ]}
      >
        {emoji}
      </Text>
    </View>
  );
};

// Also export as Ionicons for drop-in compatibility
export const Ionicons = AppIcon;
export default AppIcon;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  emojiText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
