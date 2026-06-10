// @ts-nocheck
import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useLanguage } from '../src/old_app/context/LanguageContext';

export default function WelcomeScreen() {
  const { t } = useLanguage();

  return (
    <View className="flex-1 flex-col bg-[#1A0A00] px-6">
      {/* Logo */}
      <View className="pt-12 pb-8 items-center">
        <Text
          className="text-2xl font-bold text-primary"
          style={{ fontFamily: 'System' }} // Would use 'Anek Devanagari' when custom fonts are loaded
        >
          DOSHANIVARANA
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 flex-col items-center justify-center pb-20">
        {/* Greeting */}
        <Text
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: 'System', color: '#F5F5F0' }}
        >
          {t('home.greeting')} 🙏
        </Text>

        {/* Subtitle */}
        <Text
          className="text-center text-base mb-6 max-w-sm"
          style={{ fontFamily: 'System', color: '#44403C' }}
        >
          {t('welcome.subtitle')}
        </Text>

        {/* Decorative Divider */}
        <View className="w-10 h-0.5 bg-primary mb-12" />

        {/* CTAs */}
        <View className="w-full max-w-sm space-y-4">
          <Link href="/login" asChild>
            <Pressable
              className="w-full py-4 rounded-xl bg-primary items-center justify-center active:bg-[#E05C10]"
            >
              <Text
                className="text-[#1A0A00] font-medium text-base"
                style={{ fontFamily: 'System' }}
              >
                {t('welcome.continueMobile')}
              </Text>
            </Pressable>
          </Link>

          <Link href="/login" asChild>
            <Pressable
              className="w-full py-4 mt-4 rounded-xl border-2 border-primary bg-transparent items-center justify-center active:bg-primary/5"
            >
              <Text
                className="text-primary font-medium text-base"
                style={{ fontFamily: 'System' }}
              >
                {t('common.signIn')}
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Terms */}
      <View className="pb-8 items-center">
        <Text className="text-center text-xs px-4" style={{ fontFamily: 'System', color: '#78716C' }}>
          {t('welcome.termsAgree')}
        </Text>
      </View>
    </View>
  );
}
