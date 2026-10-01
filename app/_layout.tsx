import "@/global.css";
import { ClerkProvider, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname } from "expo-router";
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { useEffect, useRef, type ReactNode } from "react";
import { posthog } from '@/libs/posthog';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.");
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function PostHogScreenTracker() {
  const pathname = usePathname();
  const analytics = usePostHog();

  useEffect(() => {
    analytics.screen(pathname);
  }, [analytics, pathname]);

  return null;
}

function PostHogIdentity({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!posthog || !isLoaded) {
      return;
    }

    if (!user) {
      identifiedUserId.current = undefined;
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    const personProperties: Record<string, string> = {};
    const email = user.primaryEmailAddress?.emailAddress;

    if (email) {
      personProperties.email = email;
    }

    if (user.fullName) {
      personProperties.name = user.fullName;
    }

    posthog.identify(user.id, { $set: personProperties });
    identifiedUserId.current = user.id;
  }, [isLoaded, user]);

  return children;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null;
  
  const routes = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogIdentity>
        {posthog ? (
          <PostHogProvider client={posthog}>
            <PostHogScreenTracker />
            {routes}
          </PostHogProvider>
        ) : routes}
      </PostHogIdentity>
    </ClerkProvider>
  );
}