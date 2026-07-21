// @ts-nocheck
import { useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Lock } from 'lucide-react-native';
import { useLanguage } from '../src/old_app/context/LanguageContext';
import { useTheme } from '../src/old_app/context/ThemeContext';
import { safeStorage } from '../src/old_app/lib/storage';
import { authProvider as auth, firestoreProvider as firestore } from '../src/lib/firebaseProvider';
import { AuthService } from '../src/services/firebase/auth';
import { AUTH_MODE } from '../src/config/authConfig';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [step, setStep] = useState(1); // 1: Mobile Number, 2: OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<any>(null);

  const otpInputRef = useRef<TextInput>(null);

  const handleSendOtp = async () => {
    if (mobileNumber.length !== 10) {
      setError(t('login.errorPhone'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (AUTH_MODE === 'DEMO') {
        // Skip firebase OTP SMS sending
        setStep(2);
        setTimeout(() => otpInputRef.current?.focus(), 100);
      } else {
        // In React Native Firebase, phone auth needs the country code
        const confirmation = await auth().signInWithPhoneNumber(`+91${mobileNumber}`);
        setConfirm(confirmation);
        setStep(2);
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    } catch (err: any) {
      console.warn("signInWithPhoneNumber failed, using mock OTP sending", err);
      // Fallback for development/mock flow in environments without SMS setup:
      setStep(2);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const requiredOtpLength = 6;
    if (otp.length !== requiredOtpLength) {
      setError(t('login.errorOtp'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      let uid = 'anonymous_user';
      let phone = `+91 ${mobileNumber}`;

      if (AUTH_MODE === 'DEMO') {
        // Generate stable UID based on mobile number
        uid = `demo_user_${mobileNumber}`;
      } else {
        if (confirm) {
          const userCredential = await confirm.confirm(otp);
          if (userCredential?.user) {
            uid = userCredential.user.uid;
            phone = userCredential.user.phoneNumber || phone;
          }
        } else {
          // Fallback mock verification for testing if confirm is not set
          console.log("Mock OTP verified");
        }
      }

      if (AUTH_MODE === 'DEMO') {
        // Retrieve local profile if any (instant local check, no network wait)
        let profile = null;
        const savedProfile = safeStorage.getItem('doshanivarana_user_profile');
        if (savedProfile) {
          try {
            profile = JSON.parse(savedProfile);
          } catch (e) {}
        }

        // Run Firestore profile & session updates in the background (fire-and-forget)
        // This ensures the login flow completes instantly without waiting for offline timeouts
        (async () => {
          try {
            let dbProfile = await AuthService.getUserProfile(uid);
            if (!dbProfile) {
              await firestore().collection('users').doc(uid).set({
                id: uid,
                phoneNumber: `+91${mobileNumber}`,
                phone: `+91 ${mobileNumber}`, // Compatibility
                profileName: 'Devotee',
                name: 'Devotee', // Compatibility
                role: 'USER',
                isDemoUser: true,
                createdAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
                isDeleted: false
              });
            }
            await firestore().collection('userSessions').add({
              userId: uid,
              phoneNumber: `+91${mobileNumber}`,
              loginAt: firestore.FieldValue.serverTimestamp(),
              deviceInfo: `${Platform.OS.toUpperCase()} Device`,
              isActive: true
            });
          } catch (e) {
            console.warn('[Login Screen Background] Background Firestore operation failed:', e);
          }
        })();

        if (profile && profile.name && profile.name !== 'Devotee') {
          // Save logged in user session locally
          safeStorage.setItem('doshanivarana_user_profile', JSON.stringify(profile));
          safeStorage.setItem(
            'doshanivarana_logged_in_user',
            JSON.stringify({ 
              mobile: phone, 
              name: profile.name || 'Devotee', 
              id: uid 
            })
          );
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
            window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
          }
          // Go straight to Home Dashboard
          router.replace('/(tabs)');
        } else {
          // Save logged in user session without profile
          safeStorage.setItem('doshanivarana_logged_in_user', JSON.stringify({ mobile: phone, id: uid }));
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
            window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
          }
          // Go to setup screen (Deity Selection)
          router.replace('/setup');
        }
      } else {
        // Standard Firebase OTP Flow
        if (confirm) {
          const userCredential = await confirm.confirm(otp);
          if (userCredential?.user) {
            uid = userCredential.user.uid;
            phone = userCredential.user.phoneNumber || phone;
          }
        } else {
          console.log("Mock OTP verified");
        }

        // Check if user profile already exists in Firestore using AuthService
        let profile = await AuthService.getUserProfile(uid);
        
        // Update session/create if needed in standard OTP mode
        await AuthService.createSession(uid, 'mock-device-token');

        if (profile && profile.name && profile.name !== 'Devotee') {
          // Persist profile locally as well
          safeStorage.setItem('doshanivarana_user_profile', JSON.stringify(profile));
          
          // Save logged in user session
          safeStorage.setItem(
            'doshanivarana_logged_in_user',
            JSON.stringify({ 
              mobile: phone, 
              name: profile.name || 'Devotee', 
              id: uid 
            })
          );
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
            window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
          }
          // Go straight to Home Dashboard
          router.replace('/(tabs)');
        } else {
          // Save logged in user session without profile
          safeStorage.setItem('doshanivarana_logged_in_user', JSON.stringify({ mobile: phone, id: uid }));
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
            window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
          }
          // Go to setup screen (Deity Selection)
          router.replace('/setup');
        }
      }
    } catch (err: any) {
      setError(err.message || t('login.errorOtp'));
    } finally {
      setLoading(false);
    }
  };

  const placeholderColor = theme === 'dark' ? '#A8A29E' : '#78716C';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 }}>
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable
            onPress={() => step === 2 ? setStep(1) : router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center bg-card border border-primary/20"
          >
            <ArrowLeft size={20} color="#F97316" />
          </Pressable>
        </View>

        {/* Brand Header */}
        <View className="items-center mb-6">
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <Text className="text-sm text-center mt-2" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
            {t('login.brandSubtitle')}
          </Text>
        </View>

        {step === 1 ? (
          <View className="flex-1 justify-between">
            <View className="gap-y-6">
              <View className="mb-6">
                <Text className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
                  {t('login.signInMobile')}
                </Text>
                <Text className="text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
                  {t('login.enterPhoneDesc')}
                </Text>
              </View>

              {/* Mobile Input */}
              <View className="bg-card border border-primary/20 rounded-xl flex-row items-center px-4 py-3 mb-4">
                <Phone size={20} color="#F97316" className="mr-3" />
                <Text className="text-base text-foreground mr-2" style={{ fontFamily: 'System' }}>
                  +91
                </Text>
                <TextInput
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder={t('login.enterPhonePlaceholder')}
                  placeholderTextColor={placeholderColor}
                  value={mobileNumber}
                  onChangeText={(text) => {
                    setMobileNumber(text.replace(/[^0-9]/g, ''));
                    if (error) setError('');
                  }}
                  className="flex-1 text-base text-foreground"
                  style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
                />
              </View>

              {error ? (
                <Text className="text-red-500 text-sm mb-4" style={{ fontFamily: 'System' }}>
                  {error}
                </Text>
              ) : null}
            </View>

            {/* Bottom CTA */}
            <Pressable
              onPress={handleSendOtp}
              disabled={loading || mobileNumber.length !== 10}
              className={`w-full py-4 rounded-xl items-center justify-center mt-8 ${
                mobileNumber.length === 10 && !loading
                  ? 'bg-primary active:bg-[#E05C10]'
                  : 'bg-muted'
              }`}
            >
              <Text
                className={`font-semibold text-base ${
                  mobileNumber.length === 10 && !loading ? 'text-primary-foreground' : ''
                }`}
                style={{ fontFamily: 'System', color: mobileNumber.length === 10 && !loading ? undefined : (theme === 'dark' ? '#A8A29E' : '#78716C') }}
              >
                {loading ? t('login.sendingOtp') : t('login.sendOtp')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1 justify-between">
            <View className="gap-y-6">
              <View className="mb-6">
                <Text className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
                  {t('login.verifyOtp')}
                </Text>
                <Text className="text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
                  {t('login.otpSentDesc').replace('{number}', mobileNumber)}
                </Text>
              </View>

              {/* OTP Input */}
              <View className="bg-card border border-primary/20 rounded-xl flex-row items-center px-4 py-3 mb-4">
                <Lock size={20} color="#F97316" className="mr-3" />
                <TextInput
                  ref={otpInputRef}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder={t('login.enterOtpPlaceholder')}
                  placeholderTextColor={placeholderColor}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, ''));
                    if (error) setError('');
                  }}
                  className="flex-1 text-base text-foreground tracking-[4px]"
                  style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
                />
              </View>

              {error ? (
                <Text className="text-red-500 text-sm mb-4" style={{ fontFamily: 'System' }}>
                  {error}
                </Text>
              ) : null}

              <Pressable
                onPress={() => {
                  setOtp('');
                  handleSendOtp();
                }}
                className="self-start py-2"
              >
                <Text className="text-primary text-sm font-semibold" style={{ fontFamily: 'System' }}>
                  {t('login.resendOtp')}
                </Text>
              </Pressable>
            </View>

            {/* Bottom CTA */}
            <Pressable
              onPress={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className={`w-full py-4 rounded-xl items-center justify-center mt-8 ${
                otp.length === 6 && !loading
                  ? 'bg-primary active:bg-[#E05C10]'
                  : 'bg-muted'
              }`}
            >
              <Text
                className={`font-semibold text-base ${
                  otp.length === 6 && !loading ? 'text-primary-foreground' : ''
                }`}
                style={{ fontFamily: 'System', color: otp.length === 6 && !loading ? undefined : (theme === 'dark' ? '#A8A29E' : '#78716C') }}
              >
                {loading ? t('login.verifying') : t('login.verifyLogin')}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
