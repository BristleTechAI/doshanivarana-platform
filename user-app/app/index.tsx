import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirection is deferred to the next tick after component mounts,
    // ensuring the Expo Router navigation context is fully initialized.
    const timer = setTimeout(() => {
      router.replace('/splash');
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  return <View style={{ flex: 1, backgroundColor: '#1A0A00' }} />;
}


