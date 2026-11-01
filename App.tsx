import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/context/LanguageContext';
import { SavedCoursesProvider } from './src/context/SavedCoursesContext';
import { AdminAuthProvider } from './src/context/AdminAuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
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
