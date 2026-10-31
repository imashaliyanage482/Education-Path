import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterPress?: () => void;
  onSubmitEditing?: () => void;
  hasActiveFilters?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  onFilterPress,
  onSubmitEditing,
  hasActiveFilters = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={18} color={COLORS.secondaryText} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.secondaryText}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              if (onClear) onClear();
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={hasActiveFilters ? COLORS.white : COLORS.primaryPurple}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkNavy,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
});

export default SearchBar;
