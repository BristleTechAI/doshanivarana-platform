import { useEffect } from 'react';
import { Stack } from "expo-router";
import "../global.css";
import { ThemeProvider } from "../src/old_app/context/ThemeContext";
import { LanguageProvider } from "../src/old_app/context/LanguageContext";
import { firestoreProvider as firestore } from "../src/lib/firebaseProvider";
import { processSystemEvent } from "../src/lib/notificationGenerator";

function AppContent() {
  useEffect(() => {
    // Listen for PENDING system events and process them in the background
    const unsubscribe = firestore().collection('systemEvents')
      .where('status', '==', 'PENDING')
      .onSnapshot((snapshot: any) => {
        if (snapshot) {
          snapshot.forEach((doc: any) => {
            console.log('[SystemEvents Listener] Processing event:', doc.id);
            processSystemEvent(doc.id).catch((err: any) => {
              console.error('[SystemEvents Listener] Failed to process:', doc.id, err);
            });
          });
        }
      }, (err: any) => {
        console.error('[SystemEvents Listener] Subscription error:', err);
      });

    return () => unsubscribe();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="calendar" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

