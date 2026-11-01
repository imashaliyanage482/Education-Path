import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { LanguageProvider } from './src/context/LanguageContext';
import { SavedCoursesProvider } from './src/context/SavedCoursesContext';
import { AdminAuthProvider } from './src/context/AdminAuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SavedCoursesProvider>
          <AdminAuthProvider>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <AppNavigator />
          </AdminAuthProvider>
        </SavedCoursesProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
