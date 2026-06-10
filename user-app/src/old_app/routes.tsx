import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { Home } from "./pages/Home";
import { Poojas } from "./pages/Poojas";
import { Bookings } from "./pages/Bookings";
import { Temples } from "./pages/Temples";
import { Profile } from "./pages/Profile";
import { SplashScreen } from "./pages/SplashScreen";
import { WelcomeScreen } from "./pages/WelcomeScreen";
import { ProfileSetup } from "./pages/ProfileSetup";
import { PoojaDetail } from "./pages/PoojaDetail";
import { BookingFlow } from "./pages/BookingFlow";
import { BookingConfirmation } from "./pages/BookingConfirmation";
import { PoojaJourney } from "./pages/PoojaJourney";
import { LiveStream } from "./pages/LiveStream";
import { HinduCalendar } from "./pages/HinduCalendar";
import { Notifications } from "./pages/Notifications";
import { TempleDetail } from "./pages/TempleDetail";
import { DeliveryTracker } from "./pages/DeliveryTracker";
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Wrapper component that provides context to all routes
function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/splash",
    element: (
      <RootLayout>
        <SplashScreen />
      </RootLayout>
    ),
  },
  {
    path: "/welcome",
    element: (
      <RootLayout>
        <WelcomeScreen />
      </RootLayout>
    ),
  },
  {
    path: "/setup",
    element: (
      <RootLayout>
        <ProfileSetup />
      </RootLayout>
    ),
  },
  {
    path: "/",
    element: (
      <RootLayout>
        <AppLayout />
      </RootLayout>
    ),
    children: [
      { index: true, Component: Home },
      { path: "poojas", Component: Poojas },
      { path: "pooja/:id", Component: PoojaDetail },
      { path: "booking/:id", Component: BookingFlow },
      { path: "bookings", Component: Bookings },
      { path: "booking-confirmation/:id", Component: BookingConfirmation },
      { path: "journey/:id", Component: PoojaJourney },
      { path: "live/:id", Component: LiveStream },
      { path: "delivery/:id", Component: DeliveryTracker },
      { path: "temples", Component: Temples },
      { path: "temple/:id", Component: TempleDetail },
      { path: "calendar", Component: HinduCalendar },
      { path: "profile", Component: Profile },
      { path: "notifications", Component: Notifications },
      { path: "*", element: <div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="text-center"><h1 className="text-2xl font-bold mb-2">Page Not Found</h1><p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p><a href="/" className="text-primary hover:underline">Go back home</a></div></div> },
    ],
  },
]);