import BackgroundPattern from '@/components/BackgroundPattern';
import Header from '@/components/Header';
import { Text } from '@/components/ui/text';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenShellProps {
  children: React.ReactNode;
  /** Show full Header component (logo + dates) */
  showHeader?: boolean;
  /** Simple centered title (used instead of full Header) */
  title?: string;
  scrollable?: boolean;
  contentContainerStyle?: object;
}

export default React.memo(function ScreenShell({
  children,
  showHeader = false,
  title,
  scrollable = true,
  contentContainerStyle = { paddingBottom: 100 },
}: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-emerald-900" edges={['top']}>
      <BackgroundPattern />
      <View className="flex-1 px-4">
        {showHeader && <Header />}
        {title && (
          <Text className="text-xl font-bold text-white text-center mb-4 font-poppins pt-2">
            {title}
          </Text>
        )}
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={contentContainerStyle}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>
    </SafeAreaView>
  );
});
