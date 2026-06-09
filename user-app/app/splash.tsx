import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 flex-col items-center justify-center bg-[#1A0A00] px-6">
      {/* DOSHANIVARANA Wordmark */}
      <Animated.Text
        entering={FadeIn.duration(2500)}
        className="text-4xl font-bold text-primary mb-8 text-center"
        style={{ fontFamily: "System" }} // Ideally load 'Anek Devanagari' via expo-font
      >
        DOSHANIVARANA
      </Animated.Text>

      {/* Lotus/Diya Motif */}
      <Text className="text-6xl mb-6 opacity-80" style={{ color: '#9A1515' }}>
        🪔
      </Text>

      {/* Tagline */}
      <Animated.Text
        entering={FadeIn.duration(2500).delay(500)}
        className="text-sm italic"
        style={{ 
          fontFamily: "System",
          color: '#78716C',
        }}
      >
        Where Technology Meets Devotion
      </Animated.Text>
    </View>
  );
}
