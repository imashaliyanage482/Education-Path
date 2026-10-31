import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { StudyField, QualificationLevel, StudyMode } from '../../types';
import { Button } from '../common/Button';
import { useTranslation } from '../../context/LanguageContext';
import { CourseFilterParams } from '../../services/api';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: CourseFilterParams;
  onApplyFilters: (filters: CourseFilterParams) => void;
  onResetFilters: () => void;
}

const FIELDS: (StudyField | 'All')[] = [
  'All',
  'Information Technology',
  'Medicine & Healthcare',
  'Business & Management',
  'Engineering & Technology',
  'Law & Legal Studies',
  'Accounting & Finance',
];

const QUALIFICATION_LEVELS: (QualificationLevel | 'All')[] = [
  'All',
  'Certificate',
  'Foundation',
  'Diploma',
  'Higher Diploma',
  'HND',
  'Degree',
  'Postgraduate Diploma',
  'Professional Qualification',
];

const MODES: (StudyMode | 'All')[] = ['All', 'Full-time', 'Part-time', 'Online', 'Hybrid'];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const { t } = useTranslation();

  const [selectedField, setSelectedField] = useState<StudyField | 'All'>(filters.field || 'All');
  const [selectedLevel, setSelectedLevel] = useState<QualificationLevel | 'All'>(
    filters.level || 'All'
  );
  const [selectedMode, setSelectedMode] = useState<StudyMode | 'All'>(filters.mode || 'All');

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      field: selectedField,
      level: selectedLevel,
      mode: selectedMode,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedField('All');
    setSelectedLevel('All');
    setSelectedMode('All');
    onResetFilters();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('filter')}</Text>
              <Text style={styles.subtitle}>Refine course search</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.darkNavy} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Study Field Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('fieldStudyField')}</Text>
              <View style={styles.chipGrid}>
                {FIELDS.map((field) => {
                  const isSelected = selectedField === field;
                  return (
                    <TouchableOpacity
                      key={field}
                      onPress={() => setSelectedField(field)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {field === 'All' ? t('allCategories') : field}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Qualification Level Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sectionQualifications')}</Text>
              <View style={styles.chipGrid}>
                {QUALIFICATION_LEVELS.map((lvl) => {
                  const isSelected = selectedLevel === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      onPress={() => setSelectedLevel(lvl)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {lvl === 'All' ? t('allLevels') : lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Study Mode Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filterByMode')}</Text>
              <View style={styles.chipGrid}>
                {MODES.map((mode) => {
                  const isSelected = selectedMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setSelectedMode(mode)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              title={t('reset')}
              variant="outline"
              onPress={handleReset}
              style={styles.resetBtn}
            />
            <Button
              title={t('applyFilter')}
              variant="primary"
              onPress={handleApply}
              style={styles.applyBtn}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.softGray,
    borderRadius: 20,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.softGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});

export default FilterModal;
