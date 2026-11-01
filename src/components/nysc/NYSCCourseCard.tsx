import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NYSCCourse } from '../../types';
import { COLORS } from '../../constants/colors';
import { Badge } from '../common/Badge';

interface NYSCCourseCardProps {
  course: NYSCCourse;
  onPress: () => void;
  isSinhala?: boolean;
}

const LOCAL_FALLBACK = require('../../../assets/welcome_hero.png');

export const NYSCCourseCard: React.FC<NYSCCourseCardProps> = ({
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
              <Text style={styles.rightTagText}>{course.ageLimit || 'Youth 18-29'}</Text>
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
                <Text style={styles.metaText} numberOfLines={1}>{course.duration}</Text>
              </View>
            ) : null}

            {/* Centers Location */}
            {course.trainingCenters && course.trainingCenters.length > 0 ? (
              <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={14} color={COLORS.secondaryText} style={styles.metaIcon} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {course.trainingCenters.length === 1
                    ? course.trainingCenters[0]
                    : `Conducted at ${course.trainingCenters.length} District Youth Centres`}
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
              <Ionicons name="shield-checkmark" size={14} color="#BE185D" />
              <Text style={styles.institutionTagText}>NYSC Verified • Act No. 69</Text>
            </View>

            <TouchableOpacity style={styles.detailsBtn} onPress={onPress} activeOpacity={0.75}>
              <Text style={styles.detailsBtnText}>
                {isSinhala ? 'විස්තර බලන්න' : 'Course Details'}
              </Text>
              <Ionicons name="arrow-forward" size={13} color="#BE185D" />
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
    borderColor: '#ECECF2',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTouch: {
    borderRadius: 16,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1E1B2E',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.88,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  leftBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  rightTagBadge: {
    backgroundColor: '#BE185D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rightTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  content: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BE185D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 8,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryText,
    backgroundColor: COLORS.softGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  courseName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 23,
    marginBottom: 10,
  },
  metaList: {
    gap: 6,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 6,
    width: 16,
  },
  metaText: {
    fontSize: 12.5,
    color: COLORS.secondaryText,
    flex: 1,
    fontWeight: '500',
  },
  feeHighlightText: {
    fontSize: 12.5,
    color: '#059669',
    fontWeight: '700',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  institutionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  institutionTagText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BE185D',
  },
});
