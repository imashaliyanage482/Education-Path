import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminLoginScreenProps {
  navigation: any;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ navigation }) => {
  const { login, loading, isAdminAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigation.replace('AdminPanel');
    }
  }, [isAdminAuthenticated]);

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both administrator email and password.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigation.replace('AdminPanel');
    } else {
      setErrorMessage(res.error || 'Invalid administrator credentials. Access denied.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Return Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.darkNavy} />
              <Text style={styles.backButtonText}>Return to Public App</Text>
            </TouchableOpacity>
          </View>

          {/* Security Emblem & Header */}
          <View style={styles.headerBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={36} color={COLORS.primaryPurple} />
            </View>
            <Text style={styles.portalTitle}>EduPath Management</Text>
            <Text style={styles.portalSubtitle}>
              Secure Administrator Authentication
            </Text>
            <View style={styles.securityBadge}>
              <Ionicons name="lock-closed" size={12} color="#10B981" />
              <Text style={styles.securityBadgeText}>Protected Admin Access Only</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Administrator Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color={COLORS.secondaryText} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter administrator email..."
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Secure Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={18} color={COLORS.secondaryText} style={styles.inputIcon} />
                <TextInput
                  placeholder="••••••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.secondaryText}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
                  <Text style={styles.loginButtonText}>Sign In to Admin Panel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdminLoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 38, 38) + 16 : 20,
    paddingBottom: 20,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.softGray,
  },
  topBar: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  backButtonText: {
    color: COLORS.darkNavy,
    fontSize: 13,
    fontWeight: '600',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2DAFC',
    marginBottom: 14,
  },
  portalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkNavy,
    letterSpacing: 0.3,
  },
  portalSubtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12.5,
    flex: 1,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: COLORS.darkNavy,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
