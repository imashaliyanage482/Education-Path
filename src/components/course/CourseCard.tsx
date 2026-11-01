import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../types';
import { COLORS } from '../../constants/colors';
import { Badge } from '../common/Badge';
import { formatCurrencyLKR } from '../../utils/formatters';
import { useTranslation } from '../../context/LanguageContext';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  onCompareToggle?: () => void;
  isCompared?: boolean;
}

const LOCAL_FALLBACK_IMAGE = require('../../../assets/welcome_hero.png');

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  onCompareToggle,
  isCompared = false,
}) => {
  const { t, isSinhala } = useTranslation();
  const [imgFailed, setImgFailed] = React.useState(false);

  const displayName = isSinhala && course.sinhalaName ? course.sinhalaName : course.name;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.cardTouch}>
        {/* Course Cover Image & Badges */}
        <View style={styles.imageContainer}>
          <Image
            source={!imgFailed && course.coverImage ? { uri: course.coverImage } : LOCAL_FALLBACK_IMAGE}
            onError={() => setImgFailed(true)}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          
          <View style={styles.topBadgeRow}>
            <Badge label={course.qualificationType} variant="purple" />
            {onCompareToggle && (
              <TouchableOpacity
                onPress={onCompareToggle}
                style={[styles.compareButton, isCompared && styles.compareButtonActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isCompared ? 'checkbox' : 'add-circle-outline'}
                  size={16}
                  color={isCompared ? COLORS.white : COLORS.primaryPurple}
                />
                <Text style={[styles.compareText, isCompared && styles.compareTextActive]}>
                  {isCompared ? t('compare') : t('addToCompare')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Course Info Content */}
        <View style={styles.contentContainer}>
          {/* Institution Row */}
          <View style={styles.institutionRow}>
            <Ionicons name="school-outline" size={14} color={COLORS.primaryPurple} />
            <Text style={styles.institutionText} numberOfLines={1}>
              {course.institutionName}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {displayName}
          </Text>

          {/* Quick Specs: Duration & Study Mode */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Ionicons name="time-outline" size={13} color={COLORS.secondaryText} />
              <Text style={styles.specText} numberOfLines={1}>
                {course.duration.split('(')[0].trim()}
              </Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Ionicons name="laptop-outline" size={13} color={COLORS.secondaryText} />
              <Text style={styles.specText} numberOfLines={1}>
                {course.studyMode.join(', ')}
              </Text>
            </View>
          </View>

          {/* Footer: Fee & Action */}
          <View style={styles.footerRow}>
            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>{t('totalFee')}</Text>
              <Text style={styles.feeAmount}>{formatCurrencyLKR(course.fees.totalFeeLKR)}</Text>
            </View>

            <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
              <Text style={styles.viewDetailsText}>{t('viewDetails')}</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primaryPurple} />
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
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  cardTouch: {
    width: '100%',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.softLavender,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 27, 46, 0.1)',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compareButtonActive: {
    backgroundColor: COLORS.primaryPurple,
  },
  compareText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginLeft: 4,
  },
  compareTextActive: {
    color: COLORS.white,
  },
  contentContainer: {
    padding: 14,
  },
  institutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  institutionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryPurple,
    marginLeft: 6,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkNavy,
    lineHeight: 21,
    marginBottom: 10,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  specText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginLeft: 5,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
  },
  feeContainer: {
    flex: 1,
  },
  feeLabel: {
    fontSize: 10,
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginTop: 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginRight: 4,
  },
});

export default CourseCard;
