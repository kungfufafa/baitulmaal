import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DonationProvider } from '@/contexts/DonationContext';
import { QuranProvider } from '@/contexts/QuranContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ReanimatedLogLevel, configureReanimatedLogger } from 'react-native-reanimated';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initNotifications } from '@/lib/notifications';

import {
  Amiri_400Regular,
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import BackgroundPattern from '@/components/BackgroundPattern';
import { Platform, Text as RNText, TextInput as RNTextInput, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

if (Platform.OS === 'android') {
  const MutableText = RNText as unknown as { defaultProps?: Record<string, unknown> };
  const textDefaults = MutableText.defaultProps ?? {};
  MutableText.defaultProps = {
    ...textDefaults,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };

  const MutableTextInput = RNTextInput as unknown as { defaultProps?: Record<string, unknown> };
  const textInputDefaults = MutableTextInput.defaultProps ?? {};
  MutableTextInput.defaultProps = {
    ...textInputDefaults,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  }));
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    Amiri: Amiri_400Regular,
    Amiri_Bold: Amiri_700Bold,
    Poppins: Poppins_400Regular,
    Poppins_Light: Poppins_300Light,
    Poppins_Medium: Poppins_500Medium,
    Poppins_SemiBold: Poppins_600SemiBold,
    Poppins_Bold: Poppins_700Bold,
  });

  useEffect(() => {
    initNotifications();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (error) {
    if (__DEV__) console.error('Error loading fonts:', error);
    // Continue rendering with system fonts
  }

  if (!loaded && !error) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <DonationProvider>
              <QuranProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <SafeAreaProvider>
                    <View className="flex-1 bg-emerald-900">
                      <BackgroundPattern />
                      <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' }, headerShown: false }}>
                        <Stack.Screen name="content" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="donation" />
                      </Stack>
                      <StatusBar style="light" />
                      <PortalHost />
                    </View>
                  </SafeAreaProvider>
                </ThemeProvider>
              </QuranProvider>
            </DonationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
