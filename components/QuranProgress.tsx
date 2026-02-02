import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { surahList } from '@/constants';
import { QuranProgress as QuranProgressType } from '@/types';
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

Animated.addWhitelistedUIProps({ strokeDashoffset: true });

interface QuranProgressProps {
  progress: QuranProgressType;
  onPressContinue: () => void;
  onPressReminder: () => void;
  reminderTime: string | null;
}

export default React.memo(function QuranProgress({
  progress,
  onPressContinue,
  onPressReminder,
  reminderTime,
}: QuranProgressProps) {
  const percent = Math.round((progress.juz / 30) * 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (circumference * percent) / 100;

  const currentSurah = surahList.find((s) => s.juz === progress.juz);

  return (
    <View className="px-4 py-4">
      <View className="flex flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 bg-primary rounded-full" />
        <Text className="text-foreground font-semibold">Progress Ngaji Al-Quran</Text>
      </View>
      <Card className="bg-white/10 border-white/10 backdrop-blur-sm">
        <CardContent className="p-5">
          <View className="flex flex-row items-center gap-4">
            <View className="relative">
              <Svg width={96} height={96} viewBox="0 0 96 96">
                <Circle
                  cx={48}
                  cy={48}
                  r={40}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={8}
                />
                <Circle
                  cx={48}
                  cy={48}
                  r={40}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </Svg>
              <View className="absolute inset-0 items-center justify-center">
                <View className="text-center">
                  <Text className="text-foreground font-bold text-lg">{percent}%</Text>
                  <Text className="text-emerald-300 text-xs text-center">Khatam</Text>
                </View>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium mb-1">
                Juz {progress.juz} / 30
              </Text>
              <Text className="text-emerald-300 text-sm mb-3">
                Surah: {currentSurah?.name || 'Al-Fatihah'}
              </Text>
              <Button
                onPress={onPressContinue}
                className="bg-primary"
                size="sm"
              >
                <Text className="text-emerald-900 font-semibold text-sm">📖 Lanjutkan Ngaji</Text>
              </Button>
            </View>
          </View>
          <View className="mt-4 pt-4 border-t border-white/10">
            <View className="flex flex-row items-center justify-between">
              <View>
                <Text className="text-emerald-300 text-xs">Pengingat Ngaji</Text>
                <Text className="text-foreground font-medium">
                  {reminderTime || 'Belum diatur'}
                </Text>
              </View>
              <Button
                variant="outline"
                size="sm"
                onPress={onPressReminder}
                className="bg-white/10 border-0"
              >
                <Text className="text-white text-xs">⏰ Atur Pengingat</Text>
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
});
