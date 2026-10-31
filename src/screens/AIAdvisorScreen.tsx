import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { ChatMessage, Course, CareerPathway } from '../types';
import { AIService } from '../services/api';
import { useTranslation } from '../context/LanguageContext';

interface AIAdvisorScreenProps {
  navigation: any;
}

export const AIAdvisorScreen: React.FC<AIAdvisorScreenProps> = ({ navigation }) => {
  const { t, language, isSinhala } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initial welcome message
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome-1',
      sender: 'assistant',
      text: t('aiGreeting'),
      timestamp: new Date(),
      quickActions: [
        { label: t('actionFindCourses'), actionType: 'find_courses', payload: 'find software or computing courses' },
        { label: t('actionCheckQualifications'), actionType: 'check_qualifications', payload: 'how to check O/L and A/L qualifications' },
        { label: t('actionExplorePathways'), actionType: 'explore_pathways', payload: 'how to become a doctor or engineer in Sri Lanka' },
        { label: t('actionCompareCourses'), actionType: 'compare_courses', payload: 'compare IT degrees' },
      ],
    };
    setMessages([welcomeMsg]);
  }, [language]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const botResponse = await AIService.processUserQuery(query, language);
      setMessages((prev) => [...prev, botResponse]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  const handleQuickAction = (action: { label: string; actionType: string; payload?: string }) => {
    if (action.actionType === 'find_courses') {
      navigation.navigate('ExploreTab', { screen: 'CourseExplorer' });
    } else if (action.actionType === 'check_qualifications') {
      navigation.navigate('MyPathTab', { screen: 'QualificationChecker' });
    } else if (action.actionType === 'explore_pathways') {
      navigation.navigate('MyPathTab', { screen: 'CareerPathways' });
    } else if (action.actionType === 'compare_courses') {
      navigation.navigate('CourseCompare', { courseIds: ['course-1', 'course-2'] });
    } else if (action.payload) {
      handleSend(action.payload);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={t('aiTitle')}
        subtitle={t('aiSubtitle')}
        showLanguageToggle={true}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Grounding Notice */}
          <View style={styles.groundingNotice}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primaryPurple} />
            <Text style={styles.groundingText}>{t('aiDisclaimerNotice')}</Text>
          </View>

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.userMessageRow : styles.botMessageRow,
                ]}
              >
                {!isUser && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="sparkles" size={16} color={COLORS.white} />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
                    {msg.text}
                  </Text>

                  {/* Grounded Course Recommendations */}
                  {msg.suggestedCourses && msg.suggestedCourses.length > 0 && (
                    <View style={styles.suggestedCoursesBox}>
                      <Text style={styles.suggestedTitle}>
                        {isSinhala ? 'තහවුරු කළ පාඨමාලා නිර්දේශ:' : 'Verified Course Citations:'}
                      </Text>
                      {msg.suggestedCourses.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={styles.courseCitationCard}
                          onPress={() => navigation.navigate('CourseDetails', { courseId: c.id })}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="school" size={14} color={COLORS.primaryPurple} />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.citationName} numberOfLines={1}>
                              {isSinhala && c.sinhalaName ? c.sinhalaName : c.name}
                            </Text>
                            <Text style={styles.citationInst}>{c.institutionName}</Text>
                          </View>
                          <Ionicons name="arrow-forward" size={14} color={COLORS.primaryPurple} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Grounded Pathway Recommendations */}
                  {msg.suggestedPathways && msg.suggestedPathways.length > 0 && (
                    <View style={styles.suggestedCoursesBox}>
                      <Text style={styles.suggestedTitle}>
                        {isSinhala ? 'අධ්‍යාපනික මාවත:' : 'Suggested Career Pathway:'}
                      </Text>
                      {msg.suggestedPathways.map((p) => (
                        <TouchableOpacity
                          key={p.id}
                          style={styles.courseCitationCard}
                          onPress={() =>
                            navigation.navigate('MyPathTab', {
                              screen: 'CareerPathways',
                              params: { selectedPathwayId: p.id },
                            })
                          }
                          activeOpacity={0.8}
                        >
                          <Ionicons name="git-network" size={14} color={COLORS.modernBlue} />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.citationName} numberOfLines={1}>
                              {isSinhala ? p.careerTitleSinhala : p.careerTitle}
                            </Text>
                            <Text style={styles.citationInst}>{p.estimatedTotalYears}</Text>
                          </View>
                          <Ionicons name="arrow-forward" size={14} color={COLORS.modernBlue} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Quick Action Buttons */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <View style={styles.quickActionsContainer}>
                      {msg.quickActions.map((action, aIdx) => (
                        <TouchableOpacity
                          key={aIdx}
                          style={styles.quickActionPill}
                          onPress={() => handleQuickAction(action)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.quickActionText}>{action.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={[styles.messageRow, styles.botMessageRow]}>
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={16} color={COLORS.white} />
              </View>
              <View style={[styles.bubble, styles.botBubble, { paddingVertical: 12 }]}>
                <ActivityIndicator size="small" color={COLORS.primaryPurple} />
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Chat Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('aiInputPlaceholder')}
            placeholderTextColor={COLORS.secondaryText}
            multiline={true}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.softGray,
  },
  groundingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  groundingText: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
    lineHeight: 15,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.primaryPurple,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.white,
  },
  botText: {
    color: COLORS.darkNavy,
  },
  suggestedCoursesBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  suggestedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  courseCitationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softGray,
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  citationName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  citationInst: {
    fontSize: 10,
    color: COLORS.primaryPurple,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  quickActionPill: {
    backgroundColor: COLORS.softLavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DAFC',
  },
  quickActionText: {
    fontSize: 11,
    color: COLORS.primaryPurple,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.softGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.darkNavy,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 80,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
    elevation: 0,
  },
});

export default AIAdvisorScreen;
