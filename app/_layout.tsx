import { DonationProvider } from '@/contexts/DonationContext';
import { PaymentSheetProvider } from '@/contexts/PaymentSheetContext';
import { QuranProvider } from '@/contexts/QuranContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
import GlobalPaymentSheet from '@/components/GlobalPaymentSheet';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Amiri: Amiri_400Regular,
    Amiri_Bold: Amiri_700Bold,
    Poppins: Poppins_400Regular,
    Poppins_Light: Poppins_300Light,
    Poppins_Medium: Poppins_500Medium,
    Poppins_SemiBold: Poppins_600SemiBold,
    Poppins_Bold: Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <DonationProvider>
            <PaymentSheetProvider>
              <QuranProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <SafeAreaProvider>
                    <View className="flex-1 bg-emerald-900">
                      <BackgroundPattern />
                      <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      </Stack>
                      <StatusBar style="light" />
                      <PortalHost />
                      <GlobalPaymentSheet />
                    </View>
                  </SafeAreaProvider>
                </ThemeProvider>
              </QuranProvider>
            </PaymentSheetProvider>
          </DonationProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
