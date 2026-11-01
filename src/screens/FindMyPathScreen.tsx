import React, { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { useTranslation } from '../context/LanguageContext';
import { SAMPLE_COURSES } from '../data/sampleCourses';
import { NAITA_VERIFIED_COURSES } from '../data/naitaData';
import { CourseService } from '../services/api';
import { Course, NAITACourse } from '../types';

interface FindMyPathScreenProps {
  navigation: any;
}

type EducationLevel = 'OL_COMPLETED' | 'AL_COMPLETED' | 'NVQ_CERTIFIED' | 'GRADE_8_10';
type GradeType = 'Credit (C+)' | 'Simple Pass (S)' | 'None / Pending';
type ALStreamType = 'Technology' | 'Physical Science (Maths)' | 'Biological Science' | 'Commerce' | 'Arts';
type TargetCredentialType = 'NVQ Certificate' | 'Diploma' | 'Higher Diploma' | 'Degree';

interface EvaluatedCourse {
  id: string;
  name: string;
  sinhalaName?: string;
  authority: string;
  category: string;
  nvqLevel: string;
  qualificationType: string;
  duration: string;
  trainingCentre: string;
  district: string;
  fee: string;
  coverImage?: string;
  isEligible: boolean;
  ineligibleReason: string;
  ineligibleReasonSi: string;
  recommendationSi: string;
  type: 'vta' | 'naita' | 'general';
}

export const FindMyPathScreen: React.FC<FindMyPathScreenProps> = ({ navigation }) => {
  const { isSinhala } = useTranslation();

  // Form States - ALL NULL INITIALLY (NO AUTO-FILL)
  const [eduLevel, setEduLevel] = useState<EducationLevel | null>(null);
  const [olMaths, setOlMaths] = useState<GradeType | null>(null);
  const [olEnglish, setOlEnglish] = useState<GradeType | null>(null);
  const [olScience, setOlScience] = useState<GradeType | null>(null);
  const [olTotalPasses, setOlTotalPasses] = useState<'6+' | '5' | '<5' | null>(null);

  const [alStream, setAlStream] = useState<ALStreamType | null>(null);
  const [alPasses, setAlPasses] = useState<'3' | '2' | '1' | '0' | null>(null);

  const [existingNVQ, setExistingNVQ] = useState<'None' | 'NVQ 2' | 'NVQ 3' | 'NVQ 4' | null>(null);

  // Optional filter states - NULL by default (no 'All' chips)
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [targetQual, setTargetQual] = useState<TargetCredentialType | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [resultFilterTab, setResultFilterTab] = useState<'ALL' | 'ELIGIBLE' | 'NOT_ELIGIBLE'>('ELIGIBLE');
  const [liveCourses, setLiveCourses] = useState<Course[]>(SAMPLE_COURSES);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      CourseService.getAllCourses().then((data) => {
        if (data && data.length > 0 && isMounted) {
          setLiveCourses(data);
        }
      }).catch(() => {});
      return () => { isMounted = false; };
    }, [])
  );

  // Actual course fields matching EduPath catalog
  const FIELD_OPTIONS = [
    { id: 'Engineering', label: 'Engineering & Technology', labelSi: 'ඉංජිනේරු සහ තාක්ෂණවේදය' },
    { id: 'ICT', label: 'Information Technology (ICT & Computing)', labelSi: 'තොරතුරු තාක්ෂණය (ICT)' },
    { id: 'Automobile', label: 'Automobile Repair & Maintenance', labelSi: 'මෝටර් රථ අලුත්වැඩියාව හා නඩත්තුව' },
    { id: 'Construction', label: 'Building & Civil Construction', labelSi: 'ගොඩනැගිලි හා සිවිල් ඉදිකිරීම්' },
    { id: 'Electrical', label: 'Electrical & Electronic Engineering', labelSi: 'විදුලි හා ඉලෙක්ට්‍රොනික' },
    { id: 'Health', label: 'Health, Nursing & Social Care', labelSi: 'සෞඛ්‍ය හා රෝගී සත්කාර' },
    { id: 'Hospitality', label: 'Hospitality, Tourism & Cookery', labelSi: 'හෝටල් සහ ආහාර පිසීම' },
    { id: 'Beauty', label: 'Hair, Beauty & Salon Management', labelSi: 'රූපලාවණ්‍ය හා කොණ්ඩා මෝස්තර' },
    { id: 'Business', label: 'Business & Secretarial Management', labelSi: 'ව්‍යාපාර හා කළමනාකරණය' },
    { id: 'Accounting', label: 'Accounting & Finance', labelSi: 'ගණකාධිකරණ හා මූල්‍ය' },
    { id: 'Design', label: 'Multimedia, Video & Design', labelSi: 'නිර්මාණකරණය හා බහුමාධ්‍ය' },
    { id: 'Agriculture', label: 'Agriculture & Plant Technology', labelSi: 'කෘෂිකර්මාන්තය' },
  ];

  // 4 Target Credentials requested by user (Apprenticeship removed)
  const TARGET_QUAL_OPTIONS: { id: TargetCredentialType; label: string; labelSi: string }[] = [
    { id: 'NVQ Certificate', label: 'NVQ Certificate (Level 3 / 4)', labelSi: 'NVQ සහතික පත්‍ර (Level 3 / 4)' },
    { id: 'Diploma', label: 'Diploma (NVQ Level 5 & 6)', labelSi: 'ඩිප්ලෝමා (NVQ Level 5 & 6)' },
    { id: 'Higher Diploma', label: 'Higher Diploma (HND)', labelSi: 'උසස් ජාතික ඩිප්ලෝමා (HND)' },
    { id: 'Degree', label: 'Degree (B.Tech - NVQ Level 7)', labelSi: 'උපාධි (B.Tech - NVQ Level 7)' },
  ];

  // Sri Lanka 25 administrative districts
  const DISTRICT_OPTIONS = [
    'Colombo',
    'Gampaha',
    'Kalutara',
    'Kandy',
    'Matale',
    'Nuwara Eliya',
    'Galle',
    'Matara',
    'Hambantota',
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Vavuniya',
    'Mullaitivu',
    'Batticaloa',
    'Ampara',
    'Trincomalee',
    'Kurunegala',
    'Puttalam',
    'Anuradhapura',
    'Polonnaruwa',
    'Badulla',
    'Monaragala',
    'Ratnapura',
    'Kegalle',
  ];

  // Helper to toggle optional selections
  const toggleField = (fieldId: string) => {
    setSelectedField((prev) => (prev === fieldId ? null : fieldId));
  };

  const toggleTargetQual = (qualId: TargetCredentialType) => {
    setTargetQual((prev) => (prev === qualId ? null : qualId));
  };

  const toggleDistrict = (dist: string) => {
    setSelectedDistrict((prev) => (prev === dist ? null : dist));
  };

  // Compile full course catalog
  const allRawCourses = useMemo(() => {
    const list: EvaluatedCourse[] = [];

    // 1. From live MongoDB courses (including UoVT, SLIATE, DTET, VTA, NVTI, CGTTI, NYSC)
    liveCourses.forEach((c: Course) => {
      let isEligible = true;
      let reason = '';
      let reasonSi = '';
      let recommendationSi = '';

      const isDegree = c.qualificationType === 'Degree';
      const isHND = c.qualificationType === 'Higher Diploma' || c.name.includes('HND');
      const isDiploma = c.qualificationType === 'Diploma' || (c.nvqLevel && (c.nvqLevel.includes('Level 5') || c.nvqLevel.includes('Level 6')));
      const isCertificate = c.qualificationType === 'Certificate' || (c.nvqLevel && (c.nvqLevel.includes('Level 3') || c.nvqLevel.includes('Level 4')));

      // DEGREE ELIGIBILITY CHECK
      if (isDegree) {
        if (eduLevel !== 'AL_COMPLETED' || alPasses !== '3') {
          if (existingNVQ !== 'NVQ 4') {
            isEligible = false;
            reason = 'Requires 3 passes in G.C.E. A/L or NVQ Level 5/6 Diploma.';
            reasonSi = 'මෙම උපාධි පාඨමාලාවට (Degree) ප්‍රවේශ වීමට උසස් පෙළ (A/L) විෂයයන් 3ක් සමත් වීම හෝ NVQ 5/6 ඩිප්ලෝමාවක් අනිවාර්ය වේ.';
            recommendationSi = 'උසස් පෙළ නැවත සමත් වීම හෝ පළමුව NVQ Level 5 ඩිප්ලෝමාවක් හැදෑරීමෙන් පසුව උපාධියට පිවිසිය හැක.';
          }
        }
      }
      // HIGHER DIPLOMA (HND) ELIGIBILITY CHECK
      else if (isHND) {
        if (eduLevel !== 'AL_COMPLETED' || (alPasses !== '3' && alPasses !== '2')) {
          isEligible = false;
          reason = 'Requires G.C.E. A/L passes and O/L passes with Maths & English.';
          reasonSi = 'මෙම උසස් ජාතික ඩිප්ලෝමාවට (HND) ප්‍රවේශ වීමට උසස් පෙළ (A/L) අවම වශයෙන් විෂයයන් 2ක් හෝ 3ක් සමත් වීම අවශ්‍ය වේ.';
          recommendationSi = 'A/L සමත් නොවූවේ නම්, සාමාන්‍ය පෙළ මත පදනම් වූ NVQ Level 3/4 සහතික පත්‍ර පාඨමාලාවකින් ආරම්භ කරන්න.';
        } else if (olMaths === 'None / Pending' || olEnglish === 'None / Pending') {
          isEligible = false;
          reason = 'Requires passes in G.C.E. O/L Mathematics and English.';
          reasonSi = 'මෙම HND පාඨමාලාවට සාමාන්‍ය පෙළ (O/L) ගණිතය සහ ඉංග්‍රීසි සමත් වීම අනිවාර්ය වේ.';
          recommendationSi = 'O/L ගණිතය හෝ ඉංග්‍රීසි විෂයය සම්පූර්ණ කර නැවත අයදුම් කරන්න.';
        }
      }
      // DIPLOMA (NVQ 5 & 6) ELIGIBILITY CHECK
      else if (isDiploma) {
        if (olTotalPasses === '<5') {
          isEligible = false;
          reason = 'Requires minimum 6 passes in G.C.E. O/L.';
          reasonSi = 'මෙම ඩිප්ලෝමා (Diploma) පාඨමාලාවට ප්‍රවේශ වීමට සාමාන්‍ය පෙළ විෂයන් 6ක් සමත් වීම අවශ්‍ය වේ.';
          recommendationSi = 'පළමුව NVQ Level 2/3 ප්‍රායෝගික පාඨමාලාවක් හදාරා NVQ හරහා ඩිප්ලෝමාවට යොමු වන්න.';
        } else if (olMaths === 'None / Pending') {
          isEligible = false;
          reason = 'Requires Credit pass in G.C.E. O/L Mathematics.';
          reasonSi = 'මෙම ඉංජිනේරු/තාක්ෂණික ඩිප්ලෝමාවට සාමාන්‍ය පෙළ ගණිතය විෂයය සමත් වීම අනිවාර්ය වේ.';
          recommendationSi = 'ගණිතය විෂයය සම්පූර්ණ කිරීමෙන් හෝ NVQ Level 4 සහතිකයෙන් පසුව ඩිප්ලෝමාවට සුදුසුකම් ලබයි.';
        }
      }
      // NVQ CERTIFICATE (LEVEL 3 & 4) ELIGIBILITY CHECK
      else if (isCertificate) {
        if (olTotalPasses === '<5' && eduLevel !== 'GRADE_8_10') {
          isEligible = false;
          reason = 'Requires G.C.E. O/L completed with passes.';
          reasonSi = 'මෙම NVQ Level 4 පාඨමාලාව සඳහා සාමාන්‍ය පෙළ (O/L) විභාගය සමත්ව තිබීම අවශ්‍ය වේ.';
          recommendationSi = 'අවම O/L සාමාර්ථ නොමැති නම්, Grade 8-10 මට්ටමේ ආධුනිකත්ව පාඨමාලාවකින් ආරම්භ කළ හැක.';
        }
      }

      // If eduLevel is Grade 8-10, can only join craft certificate
      if (eduLevel === 'GRADE_8_10') {
        if (isDegree || isHND || isDiploma) {
          isEligible = false;
          reason = 'Requires G.C.E. O/L or A/L completion.';
          reasonSi = 'මෙම උසස් පාඨමාලාව සඳහා 8-10 ශ්‍රේණි අධ්‍යාපනය ප්‍රමාණවත් නොවේ.';
          recommendationSi = 'පළමුව NVQ Level 2 හෝ 3 ප්‍රායෝගික වෘත්තීය සහතිකයකින් ආරම්භ කරන්න.';
        }
      }

      list.push({
        id: c.id,
        name: c.name,
        sinhalaName: c.sinhalaName,
        authority: c.institutionName,
        category: c.studyField,
        nvqLevel: c.nvqLevel || (isDegree ? 'NVQ Level 7' : isHND ? 'NVQ Level 6' : isDiploma ? 'NVQ Level 5' : 'NVQ Level 4'),
        qualificationType: c.qualificationType,
        duration: c.duration,
        trainingCentre: c.institutionName,
        district: c.district || 'All Districts',
        fee: c.fees.totalFeeLKR === 0 ? 'Free State Sponsored' : `Rs. ${c.fees.totalFeeLKR.toLocaleString()}`,
        coverImage: c.coverImage,
        isEligible,
        ineligibleReason: reason,
        ineligibleReasonSi: reasonSi,
        recommendationSi,
        type: 'general',
      });
    });

    // 2. From NAITA_VERIFIED_COURSES
    NAITA_VERIFIED_COURSES.forEach((n: NAITACourse) => {
      let isEligible = true;
      let reason = '';
      let reasonSi = '';
      let recommendationSi = '';

      const isDiploma = n.qualificationType === 'Diploma' || n.nvqLevel.includes('Level 6') || n.nvqLevel.includes('Level 5');

      if (isDiploma) {
        if (eduLevel === 'GRADE_8_10') {
          isEligible = false;
          reason = 'Requires G.C.E. A/L or High O/L passes.';
          reasonSi = 'මෙම NDES ඉංජිනේරු ඩිප්ලෝමාවට උසස් පෙළ (A/L) හෝ O/L සාමාර්ථ 6ක් අවශ්‍ය වේ.';
          recommendationSi = 'පළමුව NAITA ප්‍රායෝගික ආධුනිකත්ව සහතික පාඨමාලාවක් හදාරන්න.';
        } else if (olMaths === 'None / Pending') {
          isEligible = false;
          reason = 'Requires Credit pass in Mathematics.';
          reasonSi = 'මෙම ඩිප්ලෝමාව සඳහා සාමාන්‍ය පෙළ ගණිතය සමත් වීම අනිවාර්ය වේ.';
          recommendationSi = 'ගණිතය විෂයය සම්පූර්ණ කර නැවත අයදුම් කරන්න.';
        }
      }

      list.push({
        id: n.id,
        name: n.name,
        sinhalaName: n.sinhalaName,
        authority: `NAITA (${n.providerType})`,
        category: n.category,
        nvqLevel: n.nvqLevel,
        qualificationType: n.qualificationType === 'Apprenticeship' ? 'NVQ Certificate' : (n.qualificationType as any),
        duration: n.duration,
        trainingCentre: n.trainingCentre,
        district: n.district,
        fee: n.courseFee,
        coverImage: n.coverImage,
        isEligible,
        ineligibleReason: reason,
        ineligibleReasonSi: reasonSi,
        recommendationSi,
        type: 'naita',
      });
    });

    return list;
  }, [eduLevel, olMaths, olEnglish, olScience, olTotalPasses, alStream, alPasses, existingNVQ]);

  // Filter courses by optional filters (Field, Target Qual, District)
  const filteredCourses = useMemo(() => {
    return allRawCourses.filter((c) => {
      // 1. Field Filter (Optional)
      if (selectedField) {
        const cat = c.category.toLowerCase();
        const f = selectedField.toLowerCase();
        if (!cat.includes(f)) return false;
      }

      // 2. Target Credential Filter (Optional)
      if (targetQual) {
        if (targetQual === 'Degree') {
          if (c.qualificationType !== 'Degree' && !c.nvqLevel.includes('Level 7')) return false;
        } else if (targetQual === 'Higher Diploma') {
          if (c.qualificationType !== 'Higher Diploma' && !c.name.includes('HND')) return false;
        } else if (targetQual === 'Diploma') {
          if (c.qualificationType !== 'Diploma' && !c.nvqLevel.includes('Level 5') && !c.nvqLevel.includes('Level 6')) return false;
        } else if (targetQual === 'NVQ Certificate') {
          if (c.qualificationType !== 'Certificate' && c.qualificationType !== 'NVQ Certificate' && !c.nvqLevel.includes('Level 3') && !c.nvqLevel.includes('Level 4')) return false;
        }
      }

      // 3. District Filter (Optional)
      if (selectedDistrict) {
        if (!c.district.includes(selectedDistrict) && !c.district.includes('All')) {
          return false;
        }
      }

      return true;
    });
  }, [allRawCourses, selectedField, targetQual, selectedDistrict]);

  // Split into Eligible and Ineligible sets
  const eligibleCourses = useMemo(() => filteredCourses.filter((c) => c.isEligible), [filteredCourses]);
  const ineligibleCourses = useMemo(() => filteredCourses.filter((c) => !c.isEligible), [filteredCourses]);

  const displayedCourses = useMemo(() => {
    if (resultFilterTab === 'ELIGIBLE') return eligibleCourses;
    if (resultFilterTab === 'NOT_ELIGIBLE') return ineligibleCourses;
    return filteredCourses;
  }, [resultFilterTab, eligibleCourses, ineligibleCourses, filteredCourses]);

  const handleSubmit = () => {
    if (!eduLevel) {
      setValidationError(
        isSinhala
          ? 'කරුණාකර ඔබගේ ඉහළම අධ්‍යාපන මට්ටම (1. Highest Completed Education Level) තෝරන්න.'
          : 'Please select your highest completed education level.'
      );
      return;
    }

    if (eduLevel !== 'GRADE_8_10' && !olTotalPasses) {
      setValidationError(
        isSinhala
          ? 'කරුණාකර ඔබගේ සාමාන්‍ය පෙළ මුළු සාමාර්ථ සංඛ්‍යාව (Total O/L Passes) තෝරන්න.'
          : 'Please select your total O/L passes count.'
      );
      return;
    }

    setValidationError(null);
    setResultFilterTab('ELIGIBLE');
    setIsSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header
        title={isSinhala ? 'ඔබගේ මාවත සොයන්න' : 'Find Your Path'}
        subtitle={
          isSinhala
            ? 'සුදුසුකම් ඇතුළත් කර ගැලපෙන පාඨමාලා තෝරාගන්න'
            : 'Personalized Qualification & Career Assessment'
        }
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {!isSubmitted ? (
          /* ========================================================= */
          /* FORM VIEW - ALL FIELDS EMPTY BY DEFAULT (NO AUTO-FILL)    */
          /* ========================================================= */
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="school" size={24} color={COLORS.primaryPurple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formTitle}>
                  {isSinhala ? 'ශිෂ්‍ය සුදුසුකම් පෝරමය' : 'Student Qualification Form'}
                </Text>
                <Text style={styles.formSubtitle}>
                  {isSinhala
                    ? 'ඔබගේ නිවැරදි අධ්‍යාපන තොරතුරු තෝරන්න. කිසිදු ක්ෂේත්‍රයක් ස්වයංක්‍රීයව පුරවා නොමැත.'
                    : 'Select your actual completed qualifications below. No fields are pre-filled.'}
                </Text>
              </View>
            </View>

            {/* Validation Error Alert */}
            {validationError && (
              <View style={styles.validationErrorCard}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.validationErrorText}>{validationError}</Text>
              </View>
            )}

            {/* Step 1: Highest Education Level */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>
                {isSinhala ? '1. ඉහළම අධ්‍යාපන මට්ටම *' : '1. Highest Completed Education Level *'}
              </Text>
              <View style={styles.optionsWrap}>
                {[
                  { id: 'OL_COMPLETED', label: 'G.C.E. O/L Completed', labelSi: 'සාමාන්‍ය පෙළ (O/L)' },
                  { id: 'AL_COMPLETED', label: 'G.C.E. A/L Completed', labelSi: 'උසස් පෙළ (A/L)' },
                  { id: 'NVQ_CERTIFIED', label: 'NVQ Certified (Level 2/3)', labelSi: 'NVQ සහතිකලාභී' },
                  { id: 'GRADE_8_10', label: 'Grade 8 – 10 Completed', labelSi: '8 – 10 ශ්‍රේණි සමත්' },
                ].map((item) => {
                  const isSelected = eduLevel === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.pillOption, isSelected && styles.pillOptionActive]}
                      onPress={() => {
                        setEduLevel(item.id as EducationLevel);
                        setValidationError(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pillOptionText, isSelected && styles.pillOptionTextActive]}>
                        {isSinhala ? item.labelSi : item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step 2: O/L Subjects Breakdown (Show if not Grade 8-10) */}
            {eduLevel !== 'GRADE_8_10' && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>
                  {isSinhala ? '2. සාමාන්‍ය පෙළ (O/L) ප්‍රධාන විෂය සාමාර්ථ' : '2. G.C.E. (O/L) Core Subject Passes'}
                </Text>

                {/* Total Passes */}
                <View style={styles.subFieldRow}>
                  <Text style={styles.subFieldLabel}>
                    {isSinhala ? 'මුළු සාමාර්ථ සංඛ්‍යාව: *' : 'Total O/L Passes: *'}
                  </Text>
                  <View style={styles.gradeButtonsRow}>
                    {[
                      { id: '6+', label: '6 or more passes', labelSi: '6ක් හෝ ඊට වැඩි' },
                      { id: '5', label: '5 passes', labelSi: '5ක් සමත්' },
                      { id: '<5', label: 'Below 5', labelSi: '5කට අඩු' },
                    ].map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.gradeBtn, olTotalPasses === p.id && styles.gradeBtnActive]}
                        onPress={() => {
                          setOlTotalPasses(p.id as any);
                          setValidationError(null);
                        }}
                      >
                        <Text style={[styles.gradeBtnText, olTotalPasses === p.id && styles.gradeBtnTextActive]}>
                          {isSinhala ? p.labelSi : p.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Mathematics */}
                <View style={styles.subFieldRow}>
                  <Text style={styles.subFieldLabel}>
                    {isSinhala ? 'ගණිතය (Mathematics):' : 'Mathematics:'}
                  </Text>
                  <View style={styles.gradeButtonsRow}>
                    {['Credit (C+)', 'Simple Pass (S)', 'None / Pending'].map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.gradeBtn, olMaths === g && styles.gradeBtnActive]}
                        onPress={() => setOlMaths(olMaths === g ? null : (g as GradeType))}
                      >
                        <Text style={[styles.gradeBtnText, olMaths === g && styles.gradeBtnTextActive]}>
                          {g === 'Credit (C+)' ? 'C / B / A' : g === 'Simple Pass (S)' ? 'S Pass' : 'None'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* English */}
                <View style={styles.subFieldRow}>
                  <Text style={styles.subFieldLabel}>
                    {isSinhala ? 'ඉංග්‍රීසි (English):' : 'English:'}
                  </Text>
                  <View style={styles.gradeButtonsRow}>
                    {['Credit (C+)', 'Simple Pass (S)', 'None / Pending'].map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.gradeBtn, olEnglish === g && styles.gradeBtnActive]}
                        onPress={() => setOlEnglish(olEnglish === g ? null : (g as GradeType))}
                      >
                        <Text style={[styles.gradeBtnText, olEnglish === g && styles.gradeBtnTextActive]}>
                          {g === 'Credit (C+)' ? 'C / B / A' : g === 'Simple Pass (S)' ? 'S Pass' : 'None'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Science */}
                <View style={styles.subFieldRow}>
                  <Text style={styles.subFieldLabel}>
                    {isSinhala ? 'විද්‍යාව (Science):' : 'Science:'}
                  </Text>
                  <View style={styles.gradeButtonsRow}>
                    {['Credit (C+)', 'Simple Pass (S)', 'None / Pending'].map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.gradeBtn, olScience === g && styles.gradeBtnActive]}
                        onPress={() => setOlScience(olScience === g ? null : (g as GradeType))}
                      >
                        <Text style={[styles.gradeBtnText, olScience === g && styles.gradeBtnTextActive]}>
                          {g === 'Credit (C+)' ? 'C / B / A' : g === 'Simple Pass (S)' ? 'S Pass' : 'None'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Step 3: A/L Details (if AL Completed) */}
            {eduLevel === 'AL_COMPLETED' && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>
                  {isSinhala ? '3. උසස් පෙළ (A/L) විෂය ධාරාව සහ සාමාර්ථ' : '3. G.C.E. (A/L) Stream & Passes'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                  {[
                    'Technology',
                    'Physical Science (Maths)',
                    'Biological Science',
                    'Commerce',
                    'Arts',
                  ].map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[styles.pillOption, alStream === st && styles.pillOptionActive]}
                      onPress={() => setAlStream(alStream === st ? null : (st as ALStreamType))}
                    >
                      <Text style={[styles.pillOptionText, alStream === st && styles.pillOptionTextActive]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={[styles.subFieldRow, { marginTop: 10 }]}>
                  <Text style={styles.subFieldLabel}>
                    {isSinhala ? 'A/L සමත් විෂයයන් ගණන:' : 'A/L Subject Passes Count:'}
                  </Text>
                  <View style={styles.gradeButtonsRow}>
                    {['3', '2', '1', '0'].map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.gradeBtn, alPasses === p && styles.gradeBtnActive]}
                        onPress={() => setAlPasses(alPasses === p ? null : (p as any))}
                      >
                        <Text style={[styles.gradeBtnText, alPasses === p && styles.gradeBtnTextActive]}>
                          {p} Passes
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Step 4: Preferred Industry / Field (Optional - No 'All' Chip) */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>
                  {isSinhala ? '4. ඔබ කැමති ක්ෂේත්‍රය' : '4. Preferred Industry / Field'}
                </Text>
                <Text style={styles.optionalTag}>{isSinhala ? 'විකල්පයි (Optional)' : 'Optional'}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                {FIELD_OPTIONS.map((f) => {
                  const isSelected = selectedField === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.pillOption, isSelected && styles.pillOptionActive]}
                      onPress={() => toggleField(f.id)}
                    >
                      <Text style={[styles.pillOptionText, isSelected && styles.pillOptionTextActive]}>
                        {isSinhala ? f.labelSi : f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Step 5: Target Credential (NVQ Certificate, Diploma, Higher Diploma, Degree - No 'All') */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>
                  {isSinhala ? '5. අපේක්ෂිත සුදුසුකම් මට්ටම' : '5. Target Credential'}
                </Text>
                <Text style={styles.optionalTag}>{isSinhala ? 'විකල්පයි (Optional)' : 'Optional'}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                {TARGET_QUAL_OPTIONS.map((t) => {
                  const isSelected = targetQual === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.pillOption, isSelected && styles.pillOptionActive]}
                      onPress={() => toggleTargetQual(t.id)}
                    >
                      <Text style={[styles.pillOptionText, isSelected && styles.pillOptionTextActive]}>
                        {isSinhala ? t.labelSi : t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Step 6: Preferred District (Optional - No 'All' Chip) */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>
                  {isSinhala ? '6. ඔබගේ දිස්ත්‍රික්කය' : '6. Preferred District'}
                </Text>
                <Text style={styles.optionalTag}>{isSinhala ? 'විකල්පයි (Optional)' : 'Optional'}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                {DISTRICT_OPTIONS.map((d) => {
                  const isSelected = selectedDistrict === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.pillOption, isSelected && styles.pillOptionActive]}
                      onPress={() => toggleDistrict(d)}
                    >
                      <Text style={[styles.pillOptionText, isSelected && styles.pillOptionTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>
                {isSinhala
                  ? 'සුදුසුකම් අනුව ගැලපෙන පාඨමාලා බලන්න'
                  : 'Find My Matching Courses & Institutes'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ========================================================= */
          /* RESULTS VIEW - ELIGIBLE & INELIGIBLE CLEAR FEEDBACK      */
          /* ========================================================= */
          <View style={styles.resultsContainer}>
            {/* Results Header Card */}
            <View style={styles.resultsHeaderCard}>
              <View style={styles.resultsSummaryTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultsCountText}>
                    🎯 {eligibleCourses.length} {isSinhala ? 'පාඨමාලාවකට සුදුසුකම් සපුරා ඇත' : 'Programmes Qualified'}
                  </Text>
                  <Text style={styles.resultsSummarySub}>
                    {isSinhala
                      ? 'ඔබගේ O/L, A/L සහ අධ්‍යාපන සුදුසුකම් මත පදනම් වූ නිල තක්සේරුව:'
                      : 'Evaluation based strictly on your entered education qualifications:'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editFormBtn}
                  onPress={() => setIsSubmitted(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={14} color={COLORS.primaryPurple} />
                  <Text style={styles.editFormBtnText}>
                    {isSinhala ? 'වෙනස් කරන්න' : 'Edit Criteria'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Status Filter Tabs */}
              <View style={styles.resultFilterTabsRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, resultFilterTab === 'ALL' && styles.tabBtnActive]}
                  onPress={() => setResultFilterTab('ALL')}
                >
                  <Text style={[styles.tabBtnText, resultFilterTab === 'ALL' && styles.tabBtnTextActive]}>
                    {isSinhala ? `සියල්ල (${filteredCourses.length})` : `All (${filteredCourses.length})`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, resultFilterTab === 'ELIGIBLE' && styles.tabBtnActiveGreen]}
                  onPress={() => setResultFilterTab('ELIGIBLE')}
                >
                  <Text style={[styles.tabBtnText, resultFilterTab === 'ELIGIBLE' && styles.tabBtnTextActiveGreen]}>
                    {isSinhala ? `✓ සුදුසුකම් ඇති (${eligibleCourses.length})` : `✓ Eligible (${eligibleCourses.length})`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, resultFilterTab === 'NOT_ELIGIBLE' && styles.tabBtnActiveRed]}
                  onPress={() => setResultFilterTab('NOT_ELIGIBLE')}
                >
                  <Text style={[styles.tabBtnText, resultFilterTab === 'NOT_ELIGIBLE' && styles.tabBtnTextActiveRed]}>
                    {isSinhala ? `✕ සුදුසුකම් මදි (${ineligibleCourses.length})` : `✕ Not Eligible (${ineligibleCourses.length})`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Zero Eligible Notice Banner */}
            {eligibleCourses.length === 0 && (
              <View style={styles.zeroEligibleBanner}>
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.zeroEligibleTitle}>
                    {isSinhala
                      ? 'ඔබ සතු සුදුසුකම් අනුව සෘජු ප්‍රවේශය හිමි පාඨමාලා හමු නොවීය'
                      : 'No Direct Entry Available with Current Qualifications'}
                  </Text>
                  <Text style={styles.zeroEligibleDesc}>
                    {isSinhala
                      ? 'ඔබ තෝරාගත් මට්ටම සඳහා අවශ්‍ය අවම සාමාර්ථ සම්පූර්ණ වී නොමැත. කෙසේ වෙතත්, ඔබට NVQ Level 2/3 පදනම් පාඨමාලාවකින් ආරම්භ කර ඉදිරියට යා හැක.'
                      : 'You do not currently meet the official minimum criteria for these higher programmes. However, you can join NVQ Level 2/3 entry programmes as a stepping stone.'}
                  </Text>
                </View>
              </View>
            )}

            {/* Course Cards List */}
            {displayedCourses.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.courseMatchCard,
                  !c.isEligible && styles.courseMatchCardIneligible,
                ]}
              >
                {/* Status Badge Row */}
                <View style={styles.matchCardTop}>
                  <Badge label={c.nvqLevel} variant="purple" />
                  <Badge label={c.qualificationType} variant="blue" />

                  {c.isEligible ? (
                    <View style={styles.eligibleBadge}>
                      <Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
                      <Text style={styles.eligibleBadgeText}>
                        {isSinhala ? 'සුදුසුකම් සපුරා ඇත' : 'Eligible to Apply'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.ineligibleBadge}>
                      <Ionicons name="close-circle" size={13} color="#DC2626" />
                      <Text style={styles.ineligibleBadgeText}>
                        {isSinhala ? 'සුදුසුකම් නොගැලපේ' : 'Not Eligible'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Course Title */}
                <Text style={styles.matchCardCategory}>{c.category}</Text>
                <Text style={styles.matchCardTitle}>
                  {isSinhala && c.sinhalaName ? c.sinhalaName : c.name}
                </Text>

                {/* Ineligible Explanation Notice */}
                {!c.isEligible && (
                  <View style={styles.ineligibleNoticeBox}>
                    <View style={styles.ineligibleNoticeRow}>
                      <Ionicons name="warning-outline" size={16} color="#DC2626" />
                      <Text style={styles.ineligibleNoticeTitle}>
                        {isSinhala ? 'ඔබට මෙම පාඨමාලාව කළ නොහැක:' : 'Why you cannot take this course:'}
                      </Text>
                    </View>
                    <Text style={styles.ineligibleNoticeReason}>
                      {isSinhala ? c.ineligibleReasonSi : c.ineligibleReason}
                    </Text>
                    {c.recommendationSi ? (
                      <Text style={styles.ineligibleNoticeRec}>
                        💡 {isSinhala ? c.recommendationSi : 'Recommendation: Complete the necessary prerequisite qualification first.'}
                      </Text>
                    ) : null}
                  </View>
                )}

                {/* Course Metadata */}
                <View style={styles.matchMetaRow}>
                  <Text style={styles.matchMetaItem}>🏢 {c.authority}</Text>
                  <Text style={styles.matchMetaItem}>⏱️ {c.duration}</Text>
                  <Text style={styles.matchMetaItem}>📍 {c.district}</Text>
                  <Text style={[styles.matchMetaItem, { color: COLORS.primaryPurple, fontWeight: '700' }]}>
                    💰 {c.fee}
                  </Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.matchActionBtn,
                    !c.isEligible && styles.matchActionBtnDisabled,
                  ]}
                  onPress={() => {
                    if (c.type === 'vta') {
                      navigation.navigate('VTACourses');
                    } else if (c.type === 'naita') {
                      navigation.navigate('NAITACourses');
                    } else {
                      navigation.navigate('CourseDetails', { courseId: c.id });
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.matchActionBtnText}>
                    {c.isEligible
                      ? isSinhala ? 'විස්තර සහ අයදුම්පත් බලන්න' : 'Explore & Apply'
                      : isSinhala ? 'අවශ්‍ය සුදුසුකම් සවිස්තරව බලන්න' : 'View Minimum Requirements'}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.bottomBackBtn}
              onPress={() => setIsSubmitted(false)}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.primaryPurple} />
              <Text style={styles.bottomBackBtnText}>
                {isSinhala ? 'පෝරමය නැවත සංස්කරණය කරන්න' : 'Refine Qualifications Form'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FindMyPathScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.softGray,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  formSubtitle: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 2,
    lineHeight: 16,
  },
  validationErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  validationErrorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
    lineHeight: 16,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 8,
  },
  optionalTag: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondaryText,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPillsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  pillOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: COLORS.softGray,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  pillOptionActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  pillOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkNavy,
  },
  pillOptionTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  subFieldRow: {
    marginBottom: 10,
    backgroundColor: COLORS.softGray,
    padding: 10,
    borderRadius: 10,
  },
  subFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 6,
  },
  gradeButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  gradeBtnActive: {
    backgroundColor: COLORS.primaryPurple,
    borderColor: COLORS.primaryPurple,
  },
  gradeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },
  gradeBtnTextActive: {
    color: COLORS.white,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
    marginTop: 10,
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  resultsHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  resultsSummaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  resultsSummarySub: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 3,
    lineHeight: 16,
  },
  editFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.softLavender,
    borderRadius: 8,
    gap: 4,
    marginLeft: 8,
  },
  editFormBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  resultFilterTabsRow: {
    flexDirection: 'row',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryPurple,
  },
  tabBtnActiveGreen: {
    backgroundColor: '#059669',
  },
  tabBtnActiveRed: {
    backgroundColor: '#DC2626',
  },
  tabBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  tabBtnTextActive: {
    color: COLORS.white,
  },
  tabBtnTextActiveGreen: {
    color: COLORS.white,
  },
  tabBtnTextActiveRed: {
    color: COLORS.white,
  },
  zeroEligibleBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 14,
  },
  zeroEligibleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 4,
  },
  zeroEligibleDesc: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  courseMatchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  courseMatchCardIneligible: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  matchCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  eligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
    gap: 4,
  },
  eligibleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  ineligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
    gap: 4,
  },
  ineligibleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  matchCardCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  matchCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkNavy,
    lineHeight: 18,
    marginBottom: 8,
  },
  ineligibleNoticeBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  ineligibleNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ineligibleNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
  },
  ineligibleNoticeReason: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 15,
    marginBottom: 4,
  },
  ineligibleNoticeRec: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7F1D1D',
    lineHeight: 14,
  },
  matchMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  matchMetaItem: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  matchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  matchActionBtnDisabled: {
    backgroundColor: '#6B7280',
  },
  matchActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  bottomBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    marginTop: 6,
  },
  bottomBackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
});
