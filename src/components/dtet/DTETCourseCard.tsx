import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DTETCourse } from '../../types';
import { COLORS } from '../../constants/colors';
import { Badge } from '../common/Badge';

interface DTETCourseCardProps {
  course: DTETCourse;
  onPress: () => void;
  isSinhala?: boolean;
}

const LOCAL_FALLBACK = require('../../../assets/welcome_hero.png');

export const DTETCourseCard: React.FC<DTETCourseCardProps> = ({
  course,
  onPress,
  isSinhala,
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const getNVQVariant = (level: string) => {
    if (level.includes('Level 5') || level.includes('Level 6')) {
      return 'purple';
    }
    if (level.includes('Level 4')) {
      return 'warning';
    }
    return 'blue';
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.cardTouch}>
        {/* Cover Image Banner */}
        <View style={styles.imageContainer}>
          <Image
            source={!imgFailed && course.coverImage ? { uri: course.coverImage } : LOCAL_FALLBACK}
            onError={() => setImgFailed(true)}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.badgeOverlay}>
            <View style={styles.leftBadgesRow}>
              <Badge label={course.nvqLevel} variant={getNVQVariant(course.nvqLevel)} />
              <Badge label={course.qualificationType} variant="blue" />
            </View>
            <View style={styles.rightTagBadge}>
              <Text style={styles.rightTagText}>DTET Network</Text>
            </View>
          </View>
        </View>

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
            {/* Duration */}
            {course.duration ? (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={COLORS.secondaryText} style={styles.metaIcon} />
                <Text style={styles.metaText}>{course.duration}</Text>
              </View>
            ) : null}

            {/* Colleges Location */}
            {course.trainingColleges && course.trainingColleges.length > 0 ? (
              <View style={styles.metaRow}>
                <Ionicons name="business-outline" size={14} color={COLORS.secondaryText} style={styles.metaIcon} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {course.trainingColleges.length === 1
                    ? course.trainingColleges[0]
                    : `Conducted at ${course.trainingColleges.length} Colleges of Technology`}
                </Text>
              </View>
            ) : null}

            {/* Study Mode */}
            {course.studyMode ? (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.secondaryText} style={styles.metaIcon} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {course.studyMode}
                </Text>
              </View>
            ) : null}

            {/* Course Fee */}
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
              <Text style={styles.institutionTagText}>DTET Verified • Est. 1893</Text>
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
    height: 130,
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
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 21,
    marginBottom: 8,
  },
  metaList: {
    gap: 4.5,
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
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
});
