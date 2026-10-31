import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Course } from '../types';
import { CourseService, ALL_COMBINED_COURSES } from '../services/api';

/**
 * Custom hook that keeps the course catalog synchronized with live MongoDB Atlas data.
 * Automatically re-fetches when the screen comes into focus.
 */
export const useLiveCourses = (): Course[] => {
  const [courses, setCourses] = useState<Course[]>(ALL_COMBINED_COURSES);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      CourseService.getAllCourses()
        .then((data) => {
          if (data && data.length > 0 && isMounted) {
            setCourses(data);
          }
        })
        .catch((err) => {
          console.warn('Failed to refresh live courses from MongoDB Atlas:', err);
        });
      return () => {
        isMounted = false;
      };
    }, [])
  );

  return courses;
};
