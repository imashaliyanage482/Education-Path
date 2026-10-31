import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useTranslation } from '../context/LanguageContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FindMyPathScreen from '../screens/FindMyPathScreen';
import QualificationCheckerScreen from '../screens/QualificationCheckerScreen';
import CareerPathwaysScreen from '../screens/CareerPathwaysScreen';
import AIAdvisorScreen from '../screens/AIAdvisorScreen';
import GovernmentInstitutionsScreen from '../screens/GovernmentInstitutionsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// My Path Sub-Stack
const MyPathStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FindMyPath" component={FindMyPathScreen} />
      <Stack.Screen name="GovernmentInstitutions" component={GovernmentInstitutionsScreen} />
      <Stack.Screen name="QualificationChecker" component={QualificationCheckerScreen} />
      <Stack.Screen name="CareerPathways" component={CareerPathwaysScreen} />
    </Stack.Navigator>
  );
};

export const TabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primaryPurple,
        tabBarInactiveTintColor: COLORS.secondaryText,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: COLORS.shadowColor,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyPathTab') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'AITab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          }

          return (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: t('tabHome') }}
      />
      <Tab.Screen
        name="MyPathTab"
        component={MyPathStack}
        options={{ tabBarLabel: t('tabMyPath') }}
      />
      <Tab.Screen
        name="AITab"
        component={AIAdvisorScreen}
        options={{ tabBarLabel: t('tabAI') }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeIconWrapper: {
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
  },
});

export default TabNavigator;
