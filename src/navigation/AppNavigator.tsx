import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import TabNavigator from './TabNavigator';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';
import CourseCompareScreen from '../screens/CourseCompareScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import SavedCoursesScreen from '../screens/SavedCoursesScreen';
import VTACoursesScreen from '../screens/VTACoursesScreen';
import NAITACoursesScreen from '../screens/NAITACoursesScreen';
import UoVTCoursesScreen from '../screens/UoVTCoursesScreen';
import SLIATECoursesScreen from '../screens/SLIATECoursesScreen';
import DTETCoursesScreen from '../screens/DTETCoursesScreen';
import NVTICoursesScreen from '../screens/NVTICoursesScreen';
import CGTTICoursesScreen from '../screens/CGTTICoursesScreen';
import NYSCCoursesScreen from '../screens/NYSCCoursesScreen';
import GovernmentInstitutionsScreen from '../screens/GovernmentInstitutionsScreen';
import CourseExplorerScreen from '../screens/CourseExplorerScreen';

const Stack = createNativeStackNavigator();
const NAV_STATE_KEY = 'EDUPATH_ACTIVE_SCREEN_STATE';

export const AppNavigator = () => {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const completed = window.localStorage.getItem('has_completed_onboarding');
      const savedNav = window.sessionStorage.getItem(NAV_STATE_KEY);
      if (completed === 'true' || savedNav) {
        return false;
      }
    }
    return true;
  });

  const [isReady, setIsReady] = useState<boolean>(Platform.OS !== 'web');
  const [initialState, setInitialState] = useState<any>();

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const saved = window.sessionStorage.getItem(NAV_STATE_KEY);
          if (saved) {
            setInitialState(JSON.parse(saved));
          }
        }
      } catch (err) {
        console.warn('Navigation state restore skipped:', err);
      } finally {
        setIsReady(true);
      }
    }
  }, []);

  if (!isReady) {
    return null;
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onFinish={() => {
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('has_completed_onboarding', 'true');
            } catch (e) {}
          }
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) => {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(state));
          } catch (e) {}
        }
      }}
    >
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
        <Stack.Screen name="CourseCompare" component={CourseCompareScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        <Stack.Screen name="SavedCourses" component={SavedCoursesScreen} />
        <Stack.Screen name="VTACourses" component={VTACoursesScreen} />
        <Stack.Screen name="NAITACourses" component={NAITACoursesScreen} />
        <Stack.Screen name="UoVTCourses" component={UoVTCoursesScreen} />
        <Stack.Screen name="SLIATECourses" component={SLIATECoursesScreen} />
        <Stack.Screen name="DTETCourses" component={DTETCoursesScreen} />
        <Stack.Screen name="NVTICourses" component={NVTICoursesScreen} />
        <Stack.Screen name="CGTTICourses" component={CGTTICoursesScreen} />
        <Stack.Screen name="NYSCCourses" component={NYSCCoursesScreen} />
        <Stack.Screen name="GovernmentInstitutions" component={GovernmentInstitutionsScreen} />
        <Stack.Screen name="CourseExplorer" component={CourseExplorerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
