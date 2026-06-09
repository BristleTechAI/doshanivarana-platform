import { Stack } from "expo-router";
import "../global.css";
import { ThemeProvider } from "../src/old_app/context/ThemeContext";
import { LanguageProvider } from "../src/old_app/context/LanguageContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="setup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="calendar" options={{ headerShown: false }} />
        </Stack>
      </LanguageProvider>
    </ThemeProvider>
  );
}

