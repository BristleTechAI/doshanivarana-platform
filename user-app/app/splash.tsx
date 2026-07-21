// @ts-nocheck
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useLanguage } from '../src/old_app/context/LanguageContext';
import { useTheme } from '../src/old_app/context/ThemeContext';

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    // Navigate to welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 flex-col items-center justify-center bg-background px-6">
      {/* DOSHANIVARANA Logo */}
      <Animated.View entering={FadeIn.duration(2000)} className="items-center justify-center mb-6">
        <Image
          source={require('../assets/logo.png')}
          style={{ width: 220, height: 220 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text
        entering={FadeIn.duration(2500).delay(500)}
        className="text-sm italic"
        style={{ 
          fontFamily: "System",
          color: theme === 'dark' ? '#A8A29E' : '#78716C',
        }}
      >
        {t('welcome.tagline')}
      </Animated.Text>
    </View>
  );
}
