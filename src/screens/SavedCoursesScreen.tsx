import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { CourseCard } from '../components/course/CourseCard';
import { Button } from '../components/common/Button';
import { useSavedCourses } from '../context/SavedCoursesContext';
import { useTranslation } from '../context/LanguageContext';

interface SavedCoursesScreenProps {
  navigation: any;
}

export const SavedCoursesScreen: React.FC<SavedCoursesScreenProps> = ({ navigation }) => {
  const { t, isSinhala } = useTranslation();
  const { savedCourses, clearAllSaved, toggleSaveCourse } = useSavedCourses();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={isSinhala ? 'සුරකින ලද පාඨමාලා' : 'Saved Courses'}
        subtitle={
          isSinhala
            ? `පාඨමාලා ${savedCourses.length} ක් සුරැකී ඇත`
            : `${savedCourses.length} courses bookmarked`
        }
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
        rightAction={
          savedCourses.length > 0 ? (
            <TouchableOpacity onPress={clearAllSaved} style={styles.clearBtn} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>{isSinhala ? 'සියල්ල ඉවත් කරන්න' : 'Clear All'}</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.container}>
        {savedCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="bookmark-outline" size={44} color={COLORS.primaryPurple} />
            </View>
            <Text style={styles.emptyTitle}>
              {isSinhala ? 'තවම කිසිදු පාඨමාලාවක් සුරැකී නැත' : 'No Saved Courses Yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isSinhala
                ? 'ඔබ කැමති පාඨමාලා පසුව පහසුවෙන් සොයාගැනීමට Bookmark කර තබාගත හැක.'
                : 'Bookmark your favorite courses from Course Explorer or Course Details to review them anytime.'}
            </Text>
            <Button
              title={isSinhala ? 'පාඨමාලා ගවේෂණය කරන්න' : 'Explore Courses'}
              variant="primary"
              onPress={() => navigation.navigate('ExploreTab', { screen: 'CourseExplorer' })}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <FlatList
            data={savedCourses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
                onCompareToggle={() => toggleSaveCourse(item.id)}
                isCompared={true}
              />
            )}
          />
        )}
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
  listPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 19,
  },
});

export default SavedCoursesScreen;
