import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export interface DropdownOption {
  label: string;
  value: string;
  count?: number;
  icon?: string;
  labelSi?: string;
}

interface DropdownSelectProps {
  label?: string;
  placeholder: string;
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  options: DropdownOption[];
  iconName?: any;
  containerStyle?: any;
  isSinhala?: boolean;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  placeholder,
  selectedValue,
  onSelect,
  options,
  iconName = 'funnel-outline',
  containerStyle,
  isSinhala = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === selectedValue);

  const displayTitle = selectedOption
    ? isSinhala && selectedOption.labelSi
      ? selectedOption.labelSi
      : selectedOption.label
    : placeholder;

  const isSelected = selectedValue !== null && selectedValue !== '' && selectedValue !== 'All' && selectedValue !== 'All Levels' && selectedValue !== 'All Districts' && selectedValue !== 'All Providers' && selectedValue !== 'All Qualifications';

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Select Trigger Box */}
      <TouchableOpacity
        style={[
          styles.selectBox,
          isOpen && styles.selectBoxOpen,
          isSelected && styles.selectBoxActive,
        ]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View style={styles.leftRow}>
          <Ionicons
            name={selectedOption?.icon || iconName}
            size={16}
            color={isSelected ? COLORS.primaryPurple : '#94A3B8'}
            style={styles.leadingIcon}
          />
          <Text
            style={[
              styles.selectedText,
              !isSelected && styles.placeholderText,
              isSelected && styles.activeSelectedText,
            ]}
            numberOfLines={1}
          >
            {displayTitle}
            {selectedOption?.count !== undefined && isSelected ? ` (${selectedOption.count})` : ''}
          </Text>
        </View>

        <View style={styles.rightRow}>
          {isSelected && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onSelect(null);
                setIsOpen(false);
              }}
              style={styles.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={isOpen ? COLORS.primaryPurple : '#64748B'}
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown Options Menu */}
      {isOpen && (
        <View style={styles.dropdownMenu}>
          <ScrollView
            style={styles.optionsScroll}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {/* 'All / Any' Reset Option */}
            <TouchableOpacity
              style={[styles.optionItem, !isSelected && styles.optionItemCurrent]}
              onPress={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="apps-outline"
                size={15}
                color={!isSelected ? COLORS.primaryPurple : '#64748B'}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.optionText,
                  !isSelected && styles.optionTextCurrent,
                ]}
              >
                {isSinhala ? 'සියල්ල (All)' : 'All / Reset'}
              </Text>
              {!isSelected && (
                <Ionicons name="checkmark" size={16} color={COLORS.primaryPurple} />
              )}
            </TouchableOpacity>

            {/* List of Options */}
            {options.map((opt) => {
              const active = selectedValue === opt.value;
              const optLabel = isSinhala && opt.labelSi ? opt.labelSi : opt.label;

              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionItem, active && styles.optionItemCurrent]}
                  onPress={() => {
                    onSelect(opt.value);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={(opt.icon as any) || 'ellipse-outline'}
                    size={14}
                    color={active ? COLORS.primaryPurple : '#94A3B8'}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.optionText, active && styles.optionTextCurrent]}
                    numberOfLines={1}
                  >
                    {optLabel}
                  </Text>
                  {opt.count !== undefined && (
                    <Text style={styles.countBadge}>({opt.count})</Text>
                  )}
                  {active && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primaryPurple} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
    marginLeft: 2,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  selectBoxOpen: {
    borderColor: COLORS.primaryPurple,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  selectBoxActive: {
    borderColor: COLORS.primaryPurple,
    backgroundColor: '#FAF5FF',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  leadingIcon: {
    marginRight: 8,
  },
  selectedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  placeholderText: {
    color: '#64748B',
    fontWeight: '500',
  },
  activeSelectedText: {
    color: COLORS.primaryPurple,
    fontWeight: '700',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearBtn: {
    padding: 2,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderWidth: 1.2,
    borderColor: COLORS.primaryPurple,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 220,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
  },
  optionsScroll: {
    paddingVertical: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionItemCurrent: {
    backgroundColor: '#F5F3FF',
  },
  optionText: {
    fontSize: 12.5,
    color: '#334155',
    flex: 1,
  },
  optionTextCurrent: {
    color: COLORS.primaryPurple,
    fontWeight: '700',
  },
  countBadge: {
    fontSize: 11,
    color: '#94A3B8',
    marginRight: 6,
  },
});

export default DropdownSelect;
