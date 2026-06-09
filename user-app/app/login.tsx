import { useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Lock } from 'lucide-react-native';
import { useLanguage } from '../src/old_app/context/LanguageContext';
import { safeStorage } from '../src/old_app/lib/storage';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1: Mobile Number, 2: OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const otpInputRef = useRef<TextInput>(null);

  const handleSendOtp = () => {
    if (mobileNumber.length !== 10) {
      setError(t('login.errorPhone'));
      return;
    }
    setError('');
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      // Auto-focus OTP input in next tick
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError(t('login.errorOtp'));
      return;
    }
    setError('');
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Save logged in user session
      safeStorage.setItem('doshanivarana_logged_in_user', JSON.stringify({ mobile: `+91 ${mobileNumber}` }));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
        window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
      }
      // Go to setup screen (Deity Selection)
      router.replace('/setup');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#1A0A00]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 }}>
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable
            onPress={() => step === 2 ? setStep(1) : router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center bg-[#2D0A2E] border border-primary/20"
          >
            <ArrowLeft size={20} color="#F97316" />
          </Pressable>
        </View>

        {/* Brand Header */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'System' }}>
            DOSHANIVARANA
          </Text>
          <Text className="text-sm text-center text-[#78716C]" style={{ fontFamily: 'System' }}>
            {t('login.brandSubtitle')}
          </Text>
        </View>

        {step === 1 ? (
          <View className="flex-1 justify-between">
            <View className="space-y-6">
              <View className="mb-6">
                <Text className="text-2xl font-bold mb-2 text-[#F5F5F0]" style={{ fontFamily: 'System' }}>
                  {t('login.signInMobile')}
                </Text>
                <Text className="text-sm text-[#78716C]" style={{ fontFamily: 'System' }}>
                  {t('login.enterPhoneDesc')}
                </Text>
              </View>

              {/* Mobile Input */}
              <View className="bg-[#2D0A2E] border border-primary/20 rounded-xl flex-row items-center px-4 py-3 mb-4">
                <Phone size={20} color="#F97316" className="mr-3" />
                <Text className="text-base text-[#F5F5F0] mr-2" style={{ fontFamily: 'System' }}>
                  +91
                </Text>
                <TextInput
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder={t('login.enterPhonePlaceholder')}
                  placeholderTextColor="#78716C"
                  value={mobileNumber}
                  onChangeText={(text) => {
                    setMobileNumber(text.replace(/[^0-9]/g, ''));
                    if (error) setError('');
                  }}
                  className="flex-1 text-base text-[#F5F5F0]"
                  style={{ fontFamily: 'System' }}
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
                  mobileNumber.length === 10 && !loading ? 'text-[#1A0A00]' : 'text-muted-foreground'
                }`}
                style={{ fontFamily: 'System' }}
              >
                {loading ? t('login.sendingOtp') : t('login.sendOtp')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1 justify-between">
            <View className="space-y-6">
              <View className="mb-6">
                <Text className="text-2xl font-bold mb-2 text-[#F5F5F0]" style={{ fontFamily: 'System' }}>
                  {t('login.verifyOtp')}
                </Text>
                <Text className="text-sm text-[#78716C]" style={{ fontFamily: 'System' }}>
                  {t('login.otpSentDesc').replace('{number}', mobileNumber)}
                </Text>
              </View>

              {/* OTP Input */}
              <View className="bg-[#2D0A2E] border border-primary/20 rounded-xl flex-row items-center px-4 py-3 mb-4">
                <Lock size={20} color="#F97316" className="mr-3" />
                <TextInput
                  ref={otpInputRef}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder={t('login.enterOtpPlaceholder')}
                  placeholderTextColor="#78716C"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, ''));
                    if (error) setError('');
                  }}
                  className="flex-1 text-base text-[#F5F5F0] tracking-[4px]"
                  style={{ fontFamily: 'System' }}
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
                  otp.length === 6 && !loading ? 'text-[#1A0A00]' : 'text-muted-foreground'
                }`}
                style={{ fontFamily: 'System' }}
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
