import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, AlertCircle, MessageSquare, Check, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { safeStorage } from '../../src/old_app/lib/storage';
import Constants from 'expo-constants';

// Get API base URL dynamically for local testing on web/simulator/device
const getApiBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return 'http://localhost:3001';
  }
  const ip = hostUri.split(':')[0];
  return `http://${ip}:3001`;
};

interface ChatMessage {
  sender: 'devotee' | 'admin';
  senderName: string;
  avatarText: string;
  time: string;
  text: string;
}

interface DevoteeQuery {
  id: string;
  bookingId: string;
  devoteeName: string;
  timeAgo: string;
  subject: string;
  snippet: string;
  status: 'Open' | 'Replied' | 'Closed';
  thread: ChatMessage[];
}

export default function SupportChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { bookingId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [activeQuery, setActiveQuery] = useState<DevoteeQuery | null>(null);
  const [inputText, setInputText] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const apiBaseUrl = getApiBaseUrl();

  // Get current logged-in user profile details
  const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
  const userMobile = userSession ? JSON.parse(userSession).mobile : '+91 98765 43216';

  const bookingsData = safeStorage.getItem('doshanivarana_bookings');
  const bookings = bookingsData ? JSON.parse(bookingsData) : [];
  const cleanMobile = userMobile.replace(/[^0-9]/g, '').slice(-10);
  const userBooking = bookings.find((b: any) => b.mobile && b.mobile.replace(/[^0-9]/g, '').slice(-10) === cleanMobile);
  const devoteeName = userBooking ? userBooking.devoteeName : 'Suresh Raina';

  // Fetch or locate the query thread
  const fetchThread = async (silent = false) => {
    try {
      const targetBooking = bookingId ? bookingId.toString() : 'BK-General';
      const res = await fetch(`${apiBaseUrl}/api/queries?devoteeName=${encodeURIComponent(devoteeName)}&bookingId=${targetBooking}`);
      
      if (res.ok) {
        const list: DevoteeQuery[] = await res.json();
        if (list.length > 0) {
          // If a thread exists for this booking / user, set it as the active thread
          setActiveQuery(list[0]);
          setErrorMsg(null);
        } else if (!activeQuery) {
          // No thread exists yet for this specific booking
          setActiveQuery(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch support thread:', err);
      if (!silent) setErrorMsg('Unable to connect to support server.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
    const interval = setInterval(() => {
      fetchThread(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Scroll to bottom on thread updates
  useEffect(() => {
    if (activeQuery) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeQuery?.thread?.length]);

  // Handle starting a new support ticket / sending first message
  const handleStartQuery = async () => {
    if (!newSubject.trim() || !inputText.trim()) return;
    setLoading(true);

    try {
      const targetBooking = bookingId ? bookingId.toString() : 'BK-General';
      const res = await fetch(`${apiBaseUrl}/api/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: targetBooking,
          devoteeName: devoteeName,
          subject: newSubject.trim(),
          text: inputText.trim(),
          avatarText: devoteeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        })
      });

      if (res.ok) {
        const created: DevoteeQuery = await res.json();
        setActiveQuery(created);
        setInputText('');
        setNewSubject('');
        setErrorMsg(null);
      } else {
        setErrorMsg('Failed to initiate query. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error starting conversation.');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a reply in an existing thread
  const handleSendReply = async () => {
    if (!inputText.trim() || !activeQuery) return;
    
    const textToSend = inputText.trim();
    setInputText(''); // Clear input early

    try {
      const res = await fetch(`${apiBaseUrl}/api/queries/${activeQuery.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'devotee',
          senderName: devoteeName,
          avatarText: devoteeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          text: textToSend
        })
      });

      if (res.ok) {
        const updated: DevoteeQuery = await res.json();
        setActiveQuery(updated);
        setErrorMsg(null);
      } else {
        setInputText(textToSend); // Restore text on fail
        setErrorMsg('Failed to send message. Please retry.');
      }
    } catch (err) {
      console.error(err);
      setInputText(textToSend);
      setErrorMsg('Network error sending message.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View 
        className="flex-row items-center px-6 pb-4 border-b border-border/40 bg-background"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl items-center justify-center bg-card/40 border border-border/40 active:bg-muted/40 mr-4"
        >
          <ArrowLeft size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'System' }}>
            {t('help.contactSupport')}
          </Text>
          <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
            {bookingId ? `Booking ID: ${bookingId}` : 'General Inquiry'}
          </Text>
        </View>
        {activeQuery && (
          <View className={`px-2.5 py-1 rounded-full ${
            activeQuery.status === 'Closed' ? 'bg-muted' : 'bg-green-500/10'
          }`}>
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${
              activeQuery.status === 'Closed' ? 'text-muted-foreground' : 'text-green-500'
            }`}>
              {activeQuery.status}
            </Text>
          </View>
        )}
      </View>

      {/* Main Panel */}
      <View className="flex-1 relative">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : errorMsg ? (
          <View className="flex-1 items-center justify-center p-6 space-y-3">
            <AlertCircle size={48} color="#EF4444" />
            <Text className="font-semibold text-lg text-foreground text-center">{errorMsg}</Text>
            <Pressable 
              onPress={() => { setLoading(true); fetchThread(); }}
              className="px-6 py-2.5 bg-primary rounded-xl"
            >
              <Text className="text-primary-foreground font-semibold">Retry Connection</Text>
            </Pressable>
          </View>
        ) : !activeQuery ? (
          /* NO THREAD YET - START A NEW QUERY FORM */
          <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1 space-y-6">
            <View className="items-center py-6">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <MessageSquare size={32} color="#F97316" />
              </View>
              <Text className="font-bold text-lg text-foreground text-center" style={{ fontFamily: 'System' }}>
                Ask the Temple PRO
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-1 px-4" style={{ fontFamily: 'System' }}>
                Have a question about your booking, prasad delivery, or live stream schedule? Open a query thread.
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                  Subject / Topic
                </Text>
                <TextInput
                  value={newSubject}
                  onChangeText={setNewSubject}
                  placeholder="e.g. Schedule delay, Rescheduling, Prasad package info"
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                  style={{ fontFamily: 'System' }}
                />
              </View>

              <View className="mt-4">
                <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                  Your Message
                </Text>
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Describe your query in detail..."
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground min-h-[120px]"
                  style={{ fontFamily: 'System' }}
                />
              </View>

              <Pressable
                onPress={handleStartQuery}
                disabled={!newSubject.trim() || !inputText.trim()}
                className={`w-full mt-6 py-4 rounded-xl items-center justify-center flex-row gap-2 ${
                  newSubject.trim() && inputText.trim() ? 'bg-primary active:bg-[#E05C10]' : 'bg-muted'
                }`}
              >
                <Text className={`font-semibold text-base ${
                  newSubject.trim() && inputText.trim() ? 'text-[#1A0A00]' : 'text-muted-foreground'
                }`} style={{ fontFamily: 'System' }}>
                  Submit Query
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          /* ACTIVE CHAT THREAD */
          <View className="flex-1">
            <ScrollView 
              ref={scrollViewRef}
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              className="flex-1 bg-muted/10"
            >
              {/* Query Subject Header in chat */}
              <View className="bg-card border border-border rounded-2xl p-4 mb-6 items-center">
                <Text className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                  Query Topic
                </Text>
                <Text className="text-base font-bold text-foreground text-center" style={{ fontFamily: 'System' }}>
                  {activeQuery.subject}
                </Text>
              </View>

              {/* Chat Thread Bubbles */}
              {activeQuery.thread.map((msg, index) => {
                const isDevotee = msg.sender === 'devotee';
                return (
                  <View 
                    key={index} 
                    className={`flex-row items-end mb-4 max-w-[85%] ${
                      isDevotee ? 'self-end justify-end' : 'self-start'
                    }`}
                  >
                    {!isDevotee && (
                      <View className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center mr-2">
                        <Text className="text-xs font-bold text-primary">RP</Text>
                      </View>
                    )}
                    <View className="flex-col gap-1">
                      <View className={`flex-row items-center gap-1.5 mb-1 ${isDevotee ? 'justify-end' : ''}`}>
                        <Text className="text-[10px] text-muted-foreground font-semibold">{msg.senderName}</Text>
                        <Text className="text-[10px] text-muted-foreground/40">•</Text>
                        <Text className="text-[10px] text-muted-foreground/60">{msg.time}</Text>
                      </View>
                      <View className={`p-4.5 rounded-2xl ${
                        isDevotee 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-card border border-border text-foreground rounded-tl-none'
                      }`}>
                        <Text 
                          className={`text-sm leading-relaxed font-semibold ${
                            isDevotee ? 'text-[#1A0A00]' : 'text-foreground'
                          }`}
                        >
                          {msg.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Bottom Composer */}
            {activeQuery.status === 'Closed' ? (
              <View className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border items-center justify-center">
                <Text className="text-sm text-muted-foreground font-medium text-center" style={{ fontFamily: 'System' }}>
                  This query thread is closed. If you have another question, please start a new ticket.
                </Text>
              </View>
            ) : (
              <View 
                className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border flex-row items-center gap-3"
                style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 16 }}
              >
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type message..."
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  style={{ fontFamily: 'System' }}
                  maxLength={500}
                />
                <Pressable
                  onPress={handleSendReply}
                  disabled={!inputText.trim()}
                  className={`w-12 h-12 rounded-xl items-center justify-center ${
                    inputText.trim() ? 'bg-primary active:bg-[#E05C10]' : 'bg-muted'
                  }`}
                >
                  <Send size={18} color={inputText.trim() ? '#1A0A00' : '#78716C'} />
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
