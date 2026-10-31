import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course } from '../types';
import { SAMPLE_COURSES } from '../data/sampleCourses';

interface SavedCoursesContextType {
  savedCourseIds: string[];
  savedCourses: Course[];
  toggleSaveCourse: (courseId: string) => void;
  isCourseSaved: (courseId: string) => boolean;
  clearAllSaved: () => void;
}

const SavedCoursesContext = createContext<SavedCoursesContextType | undefined>(undefined);

export const SavedCoursesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedCourseIds, setSavedCourseIds] = useState<string[]>(['course-1', 'course-4']);

  const toggleSaveCourse = (courseId: string) => {
    setSavedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const isCourseSaved = (courseId: string) => savedCourseIds.includes(courseId);

  const clearAllSaved = () => setSavedCourseIds([]);

  const savedCourses = SAMPLE_COURSES.filter((c) => savedCourseIds.includes(c.id));

  return (
    <SavedCoursesContext.Provider
      value={{
        savedCourseIds,
        savedCourses,
        toggleSaveCourse,
        isCourseSaved,
        clearAllSaved,
      }}
    >
      {children}
    </SavedCoursesContext.Provider>
  );
};

export const useSavedCourses = (): SavedCoursesContextType => {
  const context = useContext(SavedCoursesContext);
  if (!context) {
    throw new Error('useSavedCourses must be used within a SavedCoursesProvider');
  }
  return context;
};

export default SavedCoursesContext;
