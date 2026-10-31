import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NAITACourse } from '../../types';
import { COLORS } from '../../constants/colors';
import { Badge } from '../common/Badge';

interface NAITACourseCardProps {
  course: NAITACourse;
  onPress: () => void;
  isSinhala?: boolean;
}

export const NAITACourseCard: React.FC<NAITACourseCardProps> = ({
  course,
  onPress,
  isSinhala = false,
}) => {
  const getNVQVariant = (level: string) => {
    if (level.includes('Level 6') || level.includes('Level 7')) return 'purple';
    if (level.includes('Level 5')) return 'blue';
    if (level.includes('Level 4')) return 'success';
    return 'warning';
  };

  const getProviderVariant = (provider: string) => {
    if (provider.includes('AETI')) return 'purple';
    if (provider.includes('IETI')) return 'blue';
    return 'gray';
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.cardTouch}>
        {/* Course Cover Image */}
        {course.coverImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: course.coverImage }} style={styles.image} resizeMode="cover" />
            <View style={styles.badgeOverlay}>
              <Badge label={course.nvqLevel} variant={getNVQVariant(course.nvqLevel)} />
              <Badge label={course.qualificationType} variant="blue" />
            </View>
            <View style={styles.providerOverlay}>
              <Badge
                label={
                  course.providerType.includes('AETI')
                    ? 'AETI (Japan Tech)'
                    : course.providerType.includes('IETI')
                    ? 'IETI (German Project)'
                    : 'NAITA District'
                }
                variant={getProviderVariant(course.providerType)}
              />
            </View>
          </View>
        ) : (
          <View style={styles.compactHeaderRow}>
            <Badge label={course.nvqLevel} variant={getNVQVariant(course.nvqLevel)} />
            <Badge label={course.qualificationType} variant="blue" />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryTag} numberOfLines={1}>
              {isSinhala && course.categorySinhala ? course.categorySinhala : course.category}
            </Text>
            {course.code && <Text style={styles.codeText}>{course.code}</Text>}
          </View>

          <Text style={styles.courseName} numberOfLines={2}>
            {isSinhala && course.sinhalaName ? course.sinhalaName : course.name}
          </Text>

          {/* Details Row */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={COLORS.secondaryText} />
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={13} color={COLORS.secondaryText} />
              <Text style={styles.metaText} numberOfLines={1}>
                {course.trainingCentre}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={COLORS.secondaryText} />
              <Text style={styles.metaText} numberOfLines={1}>
                {course.district}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={13} color={COLORS.primaryPurple} />
              <Text style={[styles.metaText, { color: COLORS.primaryPurple, fontWeight: '700' }]} numberOfLines={1}>
                {course.courseFee}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.institutionTag}>
              <Ionicons name="shield-checkmark" size={13} color={COLORS.primaryPurple} />
              <Text style={styles.institutionTagText}>NAITA Verified</Text>
            </View>

            <TouchableOpacity style={styles.detailsBtn} onPress={onPress}>
              <Text style={styles.detailsBtnText}>
                {isSinhala ? 'විස්තර බලන්න' : 'Course Details'}
              </Text>
              <Ionicons name="arrow-forward" size={13} color={COLORS.primaryPurple} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTouch: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 135,
    position: 'relative',
    backgroundColor: COLORS.softGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  providerOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 10,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    gap: 6,
    padding: 12,
    paddingBottom: 0,
  },
  content: {
    padding: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.modernBlue,
    flex: 1,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondaryText,
    backgroundColor: COLORS.softGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 20,
    marginBottom: 10,
  },
  metaGrid: {
    gap: 6,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  institutionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  institutionTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
});
