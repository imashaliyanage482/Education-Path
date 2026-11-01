import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Badge } from '../components/common/Badge';
import {
  Course,
  Institution,
  QualificationLevel,
  StudyField,
  StudyMode,
  GovernmentInstitutionCategory,
} from '../types';
import { CourseService, InstitutionService } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { cleanImageUrl } from '../data/allUnifiedCourses';

const { width } = Dimensions.get('window');

const INSTITUTION_LOCAL_LOGOS: Record<string, any> = {
  UoVT: require('../../assets/institutes/uovt_logo.png'),
  SLIATE: require('../../assets/institutes/sliate_logo.png'),
  DTET: require('../../assets/institutes/dtet_logo.png'),
  VTA: require('../../assets/institutes/vta_logo.png'),
  NVTI: require('../../assets/institutes/nvti_logo.png'),
  NAITA: require('../../assets/institutes/naita_logo.png'),
  CGTTI: require('../../assets/institutes/cgtti_logo.png'),
  NYSC: require('../../assets/institutes/nysc_logo.png'),
};

const DEFAULT_COURSE_COVER = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80';

interface AdminPanelScreenProps {
  navigation: any;
}

const STATUTORY_CATEGORIES: GovernmentInstitutionCategory[] = [
  'Vocational Universities',
  'Advanced Technological Institutes',
  'Technical Colleges',
  'Vocational Training Centres',
  'Apprenticeship Institutes',
  'Engineering Training Institutes',
  'Youth Training Institutes',
];

const QUALIFICATION_LEVELS: QualificationLevel[] = [
  'Degree',
  'Higher Diploma',
  'Diploma',
  'Foundation',
  'Certificate',
  'Postgraduate Diploma',
  "Master's",
  'Professional Qualification',
];

const STUDY_FIELDS: StudyField[] = [
  'Information Technology',
  'Medicine & Healthcare',
  'Business & Management',
  'Engineering & Technology',
  'Law & Legal Studies',
  'Accounting & Finance',
];

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isAdminAuthenticated, adminUser, token, logout } = useAdminAuth();

  // Active Management Tab: 'institutions' | 'courses'
  const [activeTab, setActiveTab] = useState<'institutions' | 'courses'>('institutions');

  // Loading States
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data Stores
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  // Search Queries
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  // Course Form Modal & Editing State
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Course Form Fields
  const [courseName, setCourseName] = useState('');
  const [courseSinhalaName, setCourseSinhalaName] = useState('');
  const [courseInstitutionName, setCourseInstitutionName] = useState('');
  const [courseQualType, setCourseQualType] = useState<QualificationLevel>('Certificate');
  const [courseNvqLevel, setCourseNvqLevel] = useState('NVQ Level 4');
  const [courseStudyField, setCourseStudyField] = useState<StudyField>('Engineering & Technology');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseTotalFee, setCourseTotalFee] = useState('');
  const [courseStudyMode, setCourseStudyMode] = useState<StudyMode>('Full-time');
  const [courseCoverImage, setCourseCoverImage] = useState('');
  const [courseOverview, setCourseOverview] = useState('');
  const [courseSinhalaOverview, setCourseSinhalaOverview] = useState('');
  const [courseRequirements, setCourseRequirements] = useState('');
  const [courseSkills, setCourseSkills] = useState('');
  const [courseCareers, setCourseCareers] = useState('');
  const [courseDistrict, setCourseDistrict] = useState('');
  const [courseAwardingBody, setCourseAwardingBody] = useState('');
  const [courseWebsite, setCourseWebsite] = useState('');

  // Institution Form Modal & Editing State
  const [institutionModalVisible, setInstitutionModalVisible] = useState(false);
  const [editingInstitutionId, setEditingInstitutionId] = useState<string | null>(null);

  // Institution Form Fields
  const [instName, setInstName] = useState('');
  const [instShortName, setInstShortName] = useState('');
  const [instCategory, setInstCategory] = useState<GovernmentInstitutionCategory>('Vocational Training Centres');
  const [instLogo, setInstLogo] = useState('');
  const [instDescription, setInstDescription] = useState('');
  const [instLocation, setInstLocation] = useState('');
  const [instWebsite, setInstWebsite] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instPhone, setInstPhone] = useState('');
  const [instIsVerified, setInstIsVerified] = useState(true);

  // Route Guard Check
  useEffect(() => {
    if (!isAdminAuthenticated || !adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      Alert.alert(
        'Access Denied',
        'Administrator authentication required to access this portal.',
        [{ text: 'OK', onPress: () => navigation.replace('AdminLogin') }]
      );
    }
  }, [isAdminAuthenticated, adminUser]);

  const loadData = async () => {
    setLoadingCourses(true);
    setLoadingInstitutions(true);
    try {
      const [cData, iData] = await Promise.all([
        CourseService.getAllCourses(),
        InstitutionService.getAllInstitutions(),
      ]);
      setCourses(cData);
      setInstitutions(iData);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoadingCourses(false);
      setLoadingInstitutions(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated]);

  // Handle Logout
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to securely log out of the Administrator Panel?') : true;
      if (confirmed) {
        logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
      return;
    }

    Alert.alert(
      'Admin Logout',
      'Are you sure you want to securely log out of the Administrator Panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
      ]
    );
  };

  // -------------------------------------------------------------------------
  // INSTITUTION MANAGEMENT HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenNewInstitution = () => {
    setEditingInstitutionId(null);
    setInstName('');
    setInstShortName('');
    setInstCategory('Vocational Training Centres');
    setInstLogo('');
    setInstDescription('');
    setInstLocation('');
    setInstWebsite('');
    setInstEmail('');
    setInstPhone('');
    setInstIsVerified(true);
    setInstitutionModalVisible(true);
  };

  const handleOpenEditInstitution = (inst: Institution) => {
    setEditingInstitutionId(inst.id);
    setInstName(inst.name || '');
    setInstShortName(inst.shortName || '');
    setInstCategory(inst.category || 'Vocational Training Centres');
    setInstLogo(inst.logo || '');
    setInstDescription(inst.description || '');
    setInstLocation(inst.location || '');
    setInstWebsite(inst.website || '');
    setInstEmail(inst.email || '');
    setInstPhone(inst.contactNumber || '');
    setInstIsVerified(inst.isVerified !== false);
    setInstitutionModalVisible(true);
  };

  const handleSaveInstitution = async () => {
    if (!instName.trim() || !instShortName.trim()) {
      Alert.alert('Validation Error', 'Institution Name and Short Name are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Institution> = {
        name: instName.trim(),
        shortName: instShortName.trim(),
        category: instCategory,
        logo: instLogo.trim() || undefined,
        description: instDescription.trim(),
        location: instLocation.trim(),
        website: instWebsite.trim(),
        email: instEmail.trim(),
        contactNumber: instPhone.trim(),
        isVerified: instIsVerified,
      };

      if (editingInstitutionId) {
        await InstitutionService.updateInstitution(editingInstitutionId, payload, token || undefined);
        Alert.alert('Updated', `Institution "${instShortName}" was updated successfully.`);
      } else {
        await InstitutionService.createInstitution(payload, token || undefined);
        Alert.alert('Created', `Institution "${instShortName}" added to the system.`);
      }

      setInstitutionModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Could not save institution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInstitution = async (id: string, name: string) => {
    const executeDelete = async () => {
      try {
        setSubmitting(true);
        await InstitutionService.deleteInstitution(id, token || undefined);
        if (Platform.OS === 'web') {
          window.alert(`Institution "${name}" deleted.`);
        } else {
          Alert.alert('Deleted', `Institution "${name}" removed.`);
        }
        await loadData();
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err.message || 'Failed to delete institution.');
        } else {
          Alert.alert('Error', err.message || 'Failed to delete institution.');
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm(`Are you sure you want to delete institution "${name}"?`) : true;
      if (confirmed) {
        await executeDelete();
      }
    } else {
      Alert.alert(
        'Confirm Deletion',
        `Are you sure you want to remove the institution "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: executeDelete,
          },
        ]
      );
    }
  };

  // -------------------------------------------------------------------------
  // COURSE MANAGEMENT HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenNewCourse = () => {
    setEditingCourseId(null);
    setCourseName('');
    setCourseSinhalaName('');
    setCourseInstitutionName(institutions[0]?.name || '');
    setCourseQualType('Certificate');
    setCourseNvqLevel('NVQ Level 4');
    setCourseStudyField('Engineering & Technology');
    setCourseDuration('');
    setCourseTotalFee('');
    setCourseStudyMode('Full-time');
    setCourseCoverImage('');
    setCourseOverview('');
    setCourseSinhalaOverview('');
    setCourseRequirements('');
    setCourseSkills('');
    setCourseCareers('');
    setCourseDistrict('');
    setCourseAwardingBody('');
    setCourseWebsite('');
    setCourseModalVisible(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseName(course.name || '');
    setCourseSinhalaName(course.sinhalaName || '');
    setCourseInstitutionName(course.institutionName || '');
    setCourseQualType(course.qualificationType || 'Certificate');
    setCourseNvqLevel(course.nvqLevel || 'NVQ Level 4');
    setCourseStudyField(course.studyField || 'Engineering & Technology');
    setCourseDuration(course.duration || '');
    setCourseTotalFee(course.fees?.totalFeeLKR !== undefined ? course.fees.totalFeeLKR.toString() : '');
    setCourseStudyMode(course.studyMode?.[0] || 'Full-time');
    setCourseCoverImage(course.coverImage || '');
    setCourseOverview(course.overview || '');
    setCourseSinhalaOverview(course.sinhalaOverview || '');
    setCourseRequirements(course.entryRequirements?.olRequirement?.details || '');
    setCourseSkills(course.skillsGained ? course.skillsGained.join(', ') : '');
    setCourseCareers(course.careerOpportunities ? course.careerOpportunities.join(', ') : '');
    setCourseDistrict(course.district || '');
    setCourseAwardingBody(course.awardingBody || course.institutionName || '');
    setCourseWebsite(course.officialWebsite || '');
    setCourseModalVisible(true);
  };

  const handleSaveCourse = async () => {
    if (!courseName.trim() || !courseInstitutionName.trim()) {
      Alert.alert('Validation Error', 'Course Name and Institution Name are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Course> = {
        name: courseName.trim(),
        sinhalaName: courseSinhalaName.trim() || undefined,
        institutionName: courseInstitutionName.trim(),
        qualificationType: courseQualType,
        nvqLevel: courseNvqLevel !== 'Non-NVQ' ? courseNvqLevel : undefined,
        qualificationAwarded: courseNvqLevel !== 'Non-NVQ' ? `${courseQualType} (${courseNvqLevel})` : courseQualType,
        studyField: courseStudyField,
        duration: courseDuration.trim(),
        studyMode: [courseStudyMode],
        teachingLanguage: ['English', 'Sinhala'],
        coverImage: cleanImageUrl(courseCoverImage) || undefined,
        overview: courseOverview.trim() || `${courseName} offered by ${courseInstitutionName}.`,
        sinhalaOverview: courseSinhalaOverview.trim() || undefined,
        fees: {
          totalFeeLKR: Number(courseTotalFee) || 0,
          installmentAvailable: true,
          scholarshipAvailable: Number(courseTotalFee) === 0,
        },
        entryRequirements: {
          olRequirement: { details: courseRequirements.trim() },
        },
        skillsGained: courseSkills.trim() ? courseSkills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        careerOpportunities: courseCareers.trim() ? courseCareers.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        district: courseDistrict.trim() || undefined,
        awardingBody: courseAwardingBody.trim() || courseInstitutionName.trim(),
        officialWebsite: courseWebsite.trim() || undefined,
        officialApplyLink: courseWebsite.trim() || undefined,
      };

      if (editingCourseId) {
        await CourseService.updateCourse(editingCourseId, payload, token || undefined);
        Alert.alert('Updated', `Course "${courseName}" was updated successfully.`);
      } else {
        await CourseService.createCourse(payload, token || undefined);
        Alert.alert('Created', `Course "${courseName}" successfully created.`);
      }

      setCourseModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Could not save course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    const executeDelete = async () => {
      try {
        setSubmitting(true);
        await CourseService.deleteCourse(id, token || undefined);
        if (Platform.OS === 'web') {
          window.alert(`Course "${name}" deleted.`);
        } else {
          Alert.alert('Deleted', `Course "${name}" deleted.`);
        }
        await loadData();
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err.message || 'Failed to delete course.');
        } else {
          Alert.alert('Error', err.message || 'Failed to delete course.');
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm(`Are you sure you want to delete course "${name}"?`) : true;
      if (confirmed) {
        await executeDelete();
      }
    } else {
      Alert.alert(
        'Confirm Deletion',
        `Are you sure you want to delete course "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: executeDelete,
          },
        ]
      );
    }
  };

  // Filtered lists
  const filteredInstitutions = useMemo(() => {
    const q = institutionSearch.toLowerCase().trim();
    if (!q) return institutions;
    return institutions.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.shortName.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [institutions, institutionSearch]);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.toLowerCase().trim();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.institutionName.toLowerCase().includes(q) ||
        (c.nvqLevel && c.nvqLevel.toLowerCase().includes(q))
    );
  }, [courses, courseSearch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Top Admin Navigation Bar */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 38) : 8, Platform.OS === 'android' ? 38 : 0) + 10 }]}>
        <View style={styles.adminProfileRow}>
          <View style={styles.adminAvatarBox}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.primaryPurple} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.adminTitleText}>Admin Dashboard</Text>
              <Badge label={adminUser?.role || 'ADMIN'} variant="purple" />
            </View>
            <Text style={styles.adminEmailText}>Authorized Session • Chief Administrator</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.viewAppBtn}
              onPress={() => navigation.navigate('MainTabs')}
              activeOpacity={0.8}
            >
              <Ionicons name="apps-outline" size={15} color={COLORS.white} />
              <Text style={styles.viewAppText}>View App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={15} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Selector: Only 2 Admin Features */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'institutions' && styles.tabItemActive]}
            onPress={() => setActiveTab('institutions')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business"
              size={16}
              color={activeTab === 'institutions' ? COLORS.white : COLORS.secondaryText}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'institutions' && styles.tabItemTextActive,
              ]}
            >
              1. Institution Management ({institutions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'courses' && styles.tabItemActive]}
            onPress={() => setActiveTab('courses')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="book"
              size={16}
              color={activeTab === 'courses' ? COLORS.white : COLORS.secondaryText}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'courses' && styles.tabItemTextActive,
              ]}
            >
              2. Course Management ({courses.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {activeTab === 'institutions' ? (
        // =====================================================================
        // INSTITUTION MANAGEMENT VIEW
        // =====================================================================
        <View style={styles.contentContainer}>
          <View style={styles.controlRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={16} color={COLORS.secondaryText} />
              <TextInput
                placeholder="Search institutions..."
                placeholderTextColor={COLORS.secondaryText}
                value={institutionSearch}
                onChangeText={setInstitutionSearch}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={handleOpenNewInstitution}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color={COLORS.white} />
              <Text style={styles.addNewButtonText}>Add Institution</Text>
            </TouchableOpacity>
          </View>

          {loadingInstitutions ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={COLORS.primaryPurple} />
              <Text style={styles.loadingText}>Loading registered institutions...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
              {filteredInstitutions.map((inst) => {
                const logoSource = inst.logo ? { uri: inst.logo } : INSTITUTION_LOCAL_LOGOS[inst.shortName];

                return (
                  <View key={inst.id} style={styles.itemCard}>
                    <View style={styles.itemHeaderRow}>
                      {logoSource ? (
                        <View style={styles.adminCardLogoBox}>
                          <Image source={logoSource} style={styles.adminCardLogoImg} resizeMode="contain" />
                        </View>
                      ) : (
                        <View style={styles.itemIconCircle}>
                          <Ionicons name="business-outline" size={20} color={COLORS.primaryPurple} />
                        </View>
                      )}
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.itemNameText}>{inst.name}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                          <Badge label={inst.shortName} variant="purple" />
                          <Badge label={inst.category} variant="blue" />
                          {inst.isVerified && <Badge label="Verified" variant="success" />}
                        </View>
                      </View>
                    </View>

                    {inst.location && (
                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={13} color={COLORS.secondaryText} />
                        <Text style={styles.metaText}>{inst.location}</Text>
                      </View>
                    )}

                    {inst.website && (
                      <View style={styles.metaRow}>
                        <Ionicons name="globe-outline" size={13} color={COLORS.secondaryText} />
                        <Text style={styles.metaText}>{inst.website}</Text>
                      </View>
                    )}

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.editActionBtn}
                        onPress={() => handleOpenEditInstitution(inst)}
                      >
                        <Ionicons name="pencil" size={13} color={COLORS.primaryPurple} />
                        <Text style={styles.editActionText}>Edit Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteActionBtn}
                        onPress={() => handleDeleteInstitution(inst.id || (inst as any)._id, inst.name)}
                      >
                        <Ionicons name="trash-outline" size={13} color="#EF4444" />
                        <Text style={styles.deleteActionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 30 }} />
            </ScrollView>
          )}
        </View>
      ) : (
        // =====================================================================
        // COURSE MANAGEMENT VIEW
        // =====================================================================
        <View style={styles.contentContainer}>
          <View style={styles.controlRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={16} color={COLORS.secondaryText} />
              <TextInput
                placeholder="Search courses..."
                placeholderTextColor={COLORS.secondaryText}
                value={courseSearch}
                onChangeText={setCourseSearch}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={handleOpenNewCourse}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color={COLORS.white} />
              <Text style={styles.addNewButtonText}>Add Course</Text>
            </TouchableOpacity>
          </View>

          {loadingCourses ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={COLORS.primaryPurple} />
              <Text style={styles.loadingText}>Loading courses...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
              {filteredCourses.map((c) => (
                <View key={c.id} style={styles.itemCard}>
                  <View style={styles.itemHeaderRow}>
                    <View style={styles.adminCourseCardThumbBox}>
                      <Image
                        source={{ uri: c.coverImage || DEFAULT_COURSE_COVER }}
                        style={styles.adminCourseCardThumb}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.itemNameText}>{c.name}</Text>
                      {c.sinhalaName && (
                        <Text style={styles.itemSinhalaText}>{c.sinhalaName}</Text>
                      )}
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <Badge label={c.qualificationType} variant="blue" />
                        {c.nvqLevel && <Badge label={c.nvqLevel} variant="warning" />}
                      </View>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="business-outline" size={13} color={COLORS.secondaryText} />
                    <Text style={styles.metaText}>{c.institutionName}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={13} color={COLORS.secondaryText} />
                    <Text style={styles.metaText}>{c.duration}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="cash-outline" size={13} color="#059669" />
                    <Text style={[styles.metaText, { color: '#059669', fontWeight: '700' }]}>
                      {c.fees?.totalFeeLKR === 0
                        ? 'Free Training (Subsidized)'
                        : `LKR ${c.fees?.totalFeeLKR?.toLocaleString()}`}
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editActionBtn}
                      onPress={() => handleOpenEditCourse(c)}
                    >
                      <Ionicons name="pencil" size={13} color={COLORS.primaryPurple} />
                      <Text style={styles.editActionText}>Edit Course</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteActionBtn}
                      onPress={() => handleDeleteCourse(c.id || (c as any)._id, c.name)}
                    >
                      <Ionicons name="trash-outline" size={13} color="#EF4444" />
                      <Text style={styles.deleteActionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={{ height: 30 }} />
            </ScrollView>
          )}
        </View>
      )}

      {/* =================================================================== */}
      {/* MODAL: INSTITUTION FORM (CREATE / EDIT)                             */}
      {/* =================================================================== */}
      <Modal
        visible={institutionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInstitutionModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>
                  {editingInstitutionId ? 'Edit Institution' : 'Add New Institution'}
                </Text>
                <Text style={styles.modalHeaderSub}>
                  National Education & Vocational Directory
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setInstitutionModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.darkNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Institution Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. University of Vocational Technology"
                  placeholderTextColor="#94A3B8"
                  value={instName}
                  onChangeText={setInstName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Short Name / Acronym *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. UoVT, SLIATE, DTET, NVTI"
                  placeholderTextColor="#94A3B8"
                  value={instShortName}
                  onChangeText={setInstShortName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Institution Logo / Image URL</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://.../logo.png"
                  placeholderTextColor="#94A3B8"
                  value={instLogo}
                  onChangeText={setInstLogo}
                />
                {instLogo.trim().length > 0 && (
                  <View style={styles.previewBox}>
                    <Text style={styles.previewLabel}>Logo Preview:</Text>
                    <Image source={{ uri: instLogo.trim() }} style={styles.previewImage} resizeMode="contain" />
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Government Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                  {STATUTORY_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.choicePill, instCategory === cat && styles.choicePillActive]}
                      onPress={() => setInstCategory(cat)}
                    >
                      <Text style={[styles.choicePillText, instCategory === cat && styles.choicePillTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Headquarters / Location</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Colombo, Sri Lanka"
                  placeholderTextColor="#94A3B8"
                  value={instLocation}
                  onChangeText={setInstLocation}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Official Website URL</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://..."
                  placeholderTextColor="#94A3B8"
                  value={instWebsite}
                  onChangeText={setInstWebsite}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Official Email Address</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="info@institution.lk"
                  placeholderTextColor="#94A3B8"
                  value={instEmail}
                  onChangeText={setInstEmail}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Contact Telephone Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+94 11 ..."
                  placeholderTextColor="#94A3B8"
                  value={instPhone}
                  onChangeText={setInstPhone}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Overview & Objectives</Text>
                <TextInput
                  style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Brief introduction to the institution..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={instDescription}
                  onChangeText={setInstDescription}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleSaveInstitution}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingInstitutionId ? 'Save Institution Changes' : 'Create Institution'}
                  </Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL: COURSE FORM (CREATE / EDIT)                                  */}
      {/* =================================================================== */}
      <Modal
        visible={courseModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCourseModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>
                  {editingCourseId ? 'Edit Course Record' : 'Add New Course'}
                </Text>
                <Text style={styles.modalHeaderSub}>
                  Publish to EduPath Course Directory
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCourseModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.darkNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course Name (English) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Higher National Diploma in Information Technology"
                  placeholderTextColor="#94A3B8"
                  value={courseName}
                  onChangeText={setCourseName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course Name (Sinhala)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. තොරතුරු තාක්ෂණ උසස් ජාතික ඩිප්ලෝමාව"
                  placeholderTextColor="#94A3B8"
                  value={courseSinhalaName}
                  onChangeText={setCourseSinhalaName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course Cover Image URL</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Paste image address (Unsplash, Direct URL, or Google image link)"
                  placeholderTextColor="#94A3B8"
                  value={courseCoverImage}
                  onChangeText={(val) => setCourseCoverImage(cleanImageUrl(val) || val)}
                />
                {courseCoverImage.trim().length > 0 && (
                  <View style={styles.previewBox}>
                    <Text style={styles.previewLabel}>Cover Image Preview:</Text>
                    <Image
                      source={{ uri: cleanImageUrl(courseCoverImage) }}
                      style={styles.previewCoverImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Conducting Institution *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                  {['UoVT', 'SLIATE', 'DTET', 'VTA', 'NVTI', 'NAITA', 'CGTTI', 'NYSC'].map((instShort) => (
                    <TouchableOpacity
                      key={instShort}
                      style={[
                        styles.choicePill,
                        courseInstitutionName.toLowerCase().includes(instShort.toLowerCase()) && styles.choicePillActive,
                      ]}
                      onPress={() => {
                        const matched = institutions.find((i) => i.shortName.toLowerCase() === instShort.toLowerCase());
                        setCourseInstitutionName(matched ? matched.name : instShort);
                      }}
                    >
                      <Text
                        style={[
                          styles.choicePillText,
                          courseInstitutionName.toLowerCase().includes(instShort.toLowerCase()) && styles.choicePillTextActive,
                        ]}
                      >
                        {instShort}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. SLIATE / VTA / NAITA..."
                  placeholderTextColor="#94A3B8"
                  value={courseInstitutionName}
                  onChangeText={setCourseInstitutionName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Qualification Level</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {QUALIFICATION_LEVELS.map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.choicePill, courseQualType === lvl && styles.choicePillActive]}
                      onPress={() => setCourseQualType(lvl)}
                    >
                      <Text style={[styles.choicePillText, courseQualType === lvl && styles.choicePillTextActive]}>
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>NVQ Qualification Level</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['NVQ Level 3', 'NVQ Level 4', 'NVQ Level 5', 'NVQ Level 6', 'NVQ Level 7', 'Non-NVQ'].map((nvq) => (
                    <TouchableOpacity
                      key={nvq}
                      style={[styles.choicePill, courseNvqLevel === nvq && styles.choicePillActive]}
                      onPress={() => setCourseNvqLevel(nvq)}
                    >
                      <Text style={[styles.choicePillText, courseNvqLevel === nvq && styles.choicePillTextActive]}>
                        {nvq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Study Field</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {STUDY_FIELDS.map((field) => (
                    <TouchableOpacity
                      key={field}
                      style={[styles.choicePill, courseStudyField === field && styles.choicePillActive]}
                      onPress={() => setCourseStudyField(field)}
                    >
                      <Text style={[styles.choicePillText, courseStudyField === field && styles.choicePillTextActive]}>
                        {field}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course Duration</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 1 Year / 3.5 Years"
                  placeholderTextColor="#94A3B8"
                  value={courseDuration}
                  onChangeText={setCourseDuration}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Total Course Fee (LKR) — Set 0 for Free/Subsidized</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 0 (Free) or 50000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={courseTotalFee}
                  onChangeText={setCourseTotalFee}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Awarding Body / Certification Agency</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. University of Vocational Technology / TVEC"
                  placeholderTextColor="#94A3B8"
                  value={courseAwardingBody}
                  onChangeText={setCourseAwardingBody}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>District / Training Location</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Islandwide / Colombo / Kandy"
                  placeholderTextColor="#94A3B8"
                  value={courseDistrict}
                  onChangeText={setCourseDistrict}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Key Skills Gained (Comma-separated)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Software Development, Database Design, Problem Solving"
                  placeholderTextColor="#94A3B8"
                  value={courseSkills}
                  onChangeText={setCourseSkills}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Career Opportunities (Comma-separated)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Software Engineer, Systems Analyst, IT Executive"
                  placeholderTextColor="#94A3B8"
                  value={courseCareers}
                  onChangeText={setCourseCareers}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course Overview (English)</Text>
                <TextInput
                  style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Comprehensive description of the curriculum and objectives..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={courseOverview}
                  onChangeText={setCourseOverview}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course Overview (Sinhala)</Text>
                <TextInput
                  style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="පාඨමාලා විස්තරය සහ ඉලක්කගත ප්‍රතිඵල..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={courseSinhalaOverview}
                  onChangeText={setCourseSinhalaOverview}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Entry Requirements</Text>
                <TextInput
                  style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="e.g. Passed G.C.E. (O/L) with 6 passes including Mathematics."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={courseRequirements}
                  onChangeText={setCourseRequirements}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Official Application Portal Link</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://..."
                  placeholderTextColor="#94A3B8"
                  value={courseWebsite}
                  onChangeText={setCourseWebsite}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleSaveCourse}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingCourseId ? 'Save Course Changes' : 'Publish Course'}
                  </Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminPanelScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  adminProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  adminTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  adminEmailText: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  viewAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 9,
    gap: 4,
  },
  viewAppText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 4,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.softGray,
    borderRadius: 10,
    padding: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryPurple,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },
  tabItemTextActive: {
    color: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.softGray,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.darkNavy,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  addNewButtonText: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: '800',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.secondaryText,
  },
  listScroll: {
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  adminCardLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 3,
  },
  adminCardLogoImg: {
    width: '100%',
    height: '100%',
  },
  adminCourseCardThumbBox: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adminCourseCardThumb: {
    width: '100%',
    height: '100%',
  },
  previewBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  previewCoverImage: {
    width: '100%',
    height: 110,
    borderRadius: 8,
  },
  itemNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  itemSinhalaText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 10,
    paddingTop: 8,
    gap: 8,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  editActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: 30,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  modalHeaderSub: {
    fontSize: 11.5,
    color: COLORS.secondaryText,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    padding: 18,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: COLORS.darkNavy,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  choicePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  choicePillActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  choicePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  choicePillTextActive: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
