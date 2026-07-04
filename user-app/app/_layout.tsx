import { useEffect } from 'react';
import { Stack } from "expo-router";
import "../global.css";
import { ThemeProvider } from "../src/old_app/context/ThemeContext";
import { LanguageProvider } from "../src/old_app/context/LanguageContext";
import { firestoreProvider as firestore } from "../src/lib/firebaseProvider";
import { processSystemEvent } from "../src/lib/notificationGenerator";

function AppContent() {
  useEffect(() => {
    // Track event IDs we've already dispatched in this session to prevent
    // duplicate processing while Firestore catches up and changes the status
    const dispatched = new Set<string>();

    const unsubscribe = firestore().collection('systemEvents')
      .where('status', '==', 'PENDING')
      .onSnapshot((snapshot: any) => {
        if (!snapshot) return;

        // Only process documents that were just added to the result set
        const changes = snapshot.docChanges
          ? snapshot.docChanges()
          : snapshot.docs.map((d: any) => ({ type: 'added', doc: d }));

        changes.forEach((change: any) => {
          if (change.type !== 'added') return;
          const docId: string = change.doc.id;
          if (dispatched.has(docId)) return; // already sent to processor this session
          dispatched.add(docId);

          processSystemEvent(docId).catch((err: any) => {
            console.error('[SystemEvents] Failed:', docId, err);
            dispatched.delete(docId); // allow retry if it truly failed before updating Firestore
          });
        });
      }, (err: any) => {
        console.error('[SystemEvents] Subscription error:', err);
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

