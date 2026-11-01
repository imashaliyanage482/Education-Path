import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VTACourse } from '../../types';
import { COLORS } from '../../constants/colors';
import { Badge } from '../common/Badge';

interface VTACourseCardProps {
  course: VTACourse;
  onPress: () => void;
  isSinhala?: boolean;
}

export const VTACourseCard: React.FC<VTACourseCardProps> = ({ course, onPress, isSinhala }) => {
  const getNVQVariant = (level: string) => {
    if (level.includes('Level 5') || level.includes('Level 6') || level.includes('Level 7') || level.includes('Diploma')) {
      return 'purple';
    }
    if (level.includes('Level 4')) {
      return 'warning';
    }
    return 'warning';
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.cardTouch}>
        {/* Course Cover Image */}
        {course.coverImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: course.coverImage }} style={styles.image} resizeMode="cover" />
            <View style={styles.badgeOverlay}>
              <View style={styles.leftBadgesRow}>
                <Badge label={course.nvqLevel} variant={getNVQVariant(course.nvqLevel)} />
                <Badge label={course.qualificationType || 'Vocational'} variant="blue" />
              </View>
              <View style={styles.rightTagBadge}>
                <Text style={styles.rightTagText}>VTA District</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.compactHeaderRow}>
            <View style={styles.leftBadgesRow}>
              <Badge label={course.nvqLevel} variant={getNVQVariant(course.nvqLevel)} />
              <Badge label={course.qualificationType || 'Vocational'} variant="blue" />
            </View>
            <View style={styles.rightTagBadge}>
              <Text style={styles.rightTagText}>VTA District</Text>
            </View>
          </View>
        )}

        <View style={styles.content}>
          {/* Category & Course Code */}
          <View style={styles.categoryRow}>
            <Text style={styles.categoryTag} numberOfLines={1}>
              {course.category}
            </Text>
            {course.code && <Text style={styles.codeText}>{course.code}</Text>}
          </View>

          {/* Course Name */}
          <Text style={styles.courseName} numberOfLines={2}>
            {isSinhala && course.sinhalaName ? course.sinhalaName : course.name}
          </Text>

          {/* Details Meta List */}
          <View style={styles.metaList}>
            {course.duration ? (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={COLORS.secondaryText} style={styles.metaIcon} />
                <Text style={styles.metaText}>{course.duration}</Text>
              </View>
            ) : null}

            {course.trainingCentre ? (
              <View style={styles.metaRow}>
                <Ionicons name="business-outline" size={14} color={COLORS.secondaryText} style={styles.metaIcon} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {course.trainingCentre}
                </Text>
              </View>
            ) : null}

            {course.district ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.secondaryText} style={styles.metaIcon} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {course.district}
                </Text>
              </View>
            ) : null}

            {course.courseFee ? (
              <View style={styles.metaRow}>
                <Ionicons name="cash-outline" size={14} color={COLORS.primaryPurple} style={styles.metaIcon} />
                <Text style={styles.feeHighlightText} numberOfLines={1}>
                  {course.courseFee}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Bottom Footer Row */}
          <View style={styles.footerRow}>
            <View style={styles.institutionTag}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.primaryPurple} />
              <Text style={styles.institutionTagText}>VTA Verified</Text>
            </View>

            <TouchableOpacity style={styles.detailsBtn} onPress={onPress} activeOpacity={0.75}>
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
    marginBottom: 16,
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
    height: 125,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rightTagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rightTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  content: {
    padding: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    flex: 1,
    marginRight: 6,
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 22,
    marginBottom: 8,
  },
  metaList: {
    gap: 5,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: 18,
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
    flex: 1,
  },
  feeHighlightText: {
    fontSize: 12,
    color: COLORS.primaryPurple,
    fontWeight: '700',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  institutionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  institutionTagText: {
    fontSize: 11.5,
    color: COLORS.primaryPurple,
    fontWeight: '700',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
});

export default VTACourseCard;
