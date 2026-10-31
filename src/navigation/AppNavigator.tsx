import React, { useState } from 'react';
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

export const AppNavigator = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onFinish={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <NavigationContainer>
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
