import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { SAMPLE_PATHWAYS } from '../data/samplePathways';
import { CareerPathway } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface CareerPathwaysScreenProps {
  navigation: any;
  route: any;
}

export const CareerPathwaysScreen: React.FC<CareerPathwaysScreenProps> = ({ navigation, route }) => {
  const { t, isSinhala } = useTranslation();
  const selectedPathwayId = route.params?.selectedPathwayId;

  const [activePathway, setActivePathway] = useState<CareerPathway>(
    SAMPLE_PATHWAYS.find((p) => p.id === selectedPathwayId) || SAMPLE_PATHWAYS[0]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={t('pathwaysTitle')}
        subtitle={t('pathwaysSubtitle')}
        showLanguageToggle={true}
      />

      <View style={styles.container}>
        {/* Pathway Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContainer}
        >
          {SAMPLE_PATHWAYS.map((p) => {
            const isActive = activePathway.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setActivePathway(p)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {isSinhala ? p.careerTitleSinhala : p.careerTitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Pathway Details & Visual Milestones Timeline */}
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {/* Header Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.badgeRow}>
              <Badge label={activePathway.field} variant="blue" />
              <View style={styles.durationPill}>
                <Ionicons name="time-outline" size={12} color={COLORS.primaryPurple} />
                <Text style={styles.durationPillText}>{activePathway.estimatedTotalYears}</Text>
              </View>
            </View>

            <Text style={styles.overviewTitle}>
              {isSinhala ? activePathway.careerTitleSinhala : activePathway.careerTitle}
            </Text>
            <Text style={styles.overviewText}>
              {isSinhala ? activePathway.overviewSinhala : activePathway.overview}
            </Text>

            {activePathway.averageStartingSalaryLKR && (
              <View style={styles.salaryRow}>
                <Ionicons name="trending-up" size={16} color={COLORS.success} />
                <Text style={styles.salaryLabel}>Expected Compensation:</Text>
                <Text style={styles.salaryValue}>{activePathway.averageStartingSalaryLKR}</Text>
              </View>
            )}

            {activePathway.alternativePathsSummary && (
              <View style={styles.alternativeBox}>
                <Ionicons name="git-branch-outline" size={16} color={COLORS.primaryPurple} />
                <Text style={styles.alternativeText}>
                  {activePathway.alternativePathsSummary}
                </Text>
              </View>
            )}
          </View>

          {/* Visual Milestone Timeline */}
          <Text style={styles.timelineSectionTitle}>{t('milestones')}</Text>

          <View style={styles.timelineList}>
            {activePathway.milestones.map((milestone, index) => {
              const isLast = index === activePathway.milestones.length - 1;
              return (
                <View key={milestone.stepNumber} style={styles.timelineItem}>
                  {/* Left Column: Number and Connector line */}
                  <View style={styles.leftCol}>
                    <View style={styles.nodeCircle}>
                      <Text style={styles.nodeText}>{milestone.stepNumber}</Text>
                    </View>
                    {!isLast && <View style={styles.nodeLine} />}
                  </View>

                  {/* Right Column: Milestone Details Card */}
                  <View style={styles.milestoneCard}>
                    <View style={styles.milestoneHeader}>
                      <Badge label={milestone.qualificationLevel} variant="purple" />
                      <Text style={styles.milestoneDuration}>{milestone.durationApprox}</Text>
                    </View>

                    <Text style={styles.milestoneTitle}>
                      {isSinhala ? milestone.titleSinhala : milestone.title}
                    </Text>
                    <Text style={styles.milestoneDesc}>
                      {isSinhala ? milestone.descriptionSinhala : milestone.description}
                    </Text>

                    {milestone.alternativeRoute && (
                      <View style={styles.routeBox}>
                        <Ionicons name="swap-horizontal" size={13} color={COLORS.modernBlue} />
                        <Text style={styles.routeBoxText}>
                          {t('alternativeRoute')}: {milestone.alternativeRoute}
                        </Text>
                      </View>
                    )}

                    {milestone.sampleCourses && milestone.sampleCourses.length > 0 && (
                      <View style={styles.sampleCoursesRow}>
                        <Text style={styles.sampleCourseLabel}>{t('relatedCourses')}:</Text>
                        {milestone.sampleCourses.map((c, cIdx) => (
                          <View key={cIdx} style={styles.courseChip}>
                            <Ionicons name="school-outline" size={11} color={COLORS.primaryPurple} />
                            <Text style={styles.courseChipText}>{c}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.softGray,
  },
  tabsScroll: {
    backgroundColor: COLORS.white,
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.softGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },
  tabButtonTextActive: {
    color: COLORS.white,
  },
  contentScroll: {
    flex: 1,
    padding: 20,
  },
  overviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryPurple,
    marginLeft: 4,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  overviewText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 19,
    marginBottom: 12,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  salaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkNavy,
    marginLeft: 6,
    marginRight: 4,
  },
  salaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.success,
  },
  alternativeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.softLavender,
    padding: 10,
    borderRadius: 10,
  },
  alternativeText: {
    fontSize: 12,
    color: COLORS.primaryPurple,
    lineHeight: 17,
    marginLeft: 6,
    flex: 1,
  },
  timelineSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 14,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  leftCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  nodeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  nodeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D1C4E9',
    marginTop: 4,
    marginBottom: 4,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneDuration: {
    fontSize: 11,
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 4,
  },
  milestoneDesc: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
    marginBottom: 8,
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  routeBoxText: {
    fontSize: 11,
    color: COLORS.modernBlue,
    marginLeft: 6,
    flex: 1,
  },
  sampleCoursesRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  sampleCourseLabel: {
    fontSize: 10,
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  courseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  courseChipText: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CareerPathwaysScreen;
