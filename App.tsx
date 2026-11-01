import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { LanguageProvider } from './src/context/LanguageContext';
import { SavedCoursesProvider } from './src/context/SavedCoursesContext';
import { AdminAuthProvider } from './src/context/AdminAuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    Font.loadAsync({
      ...Ionicons.font,
    }).catch((err) => {
      console.warn('Icon font preloading note:', err);
    });
  }, []);

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
