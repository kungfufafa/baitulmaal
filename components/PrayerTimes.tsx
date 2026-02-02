import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { prayers } from '@/constants';
import { formatTimeDifference, getNextPrayer } from '@/lib/formatters';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export default React.memo(function PrayerTimes() {
  const [nextPrayer, setNextPrayer] = useState(getNextPrayer());

  useEffect(() => {
    const timer = setInterval(() => {
      setNextPrayer(getNextPrayer());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="px-4 py-4">
      <View className="flex flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 bg-primary rounded-full" />
        <Text className="text-foreground font-semibold">Waktu Sholat</Text>
      </View>
      <Card className="bg-white/10 border-white/10 backdrop-blur-sm">
        <CardContent className="p-4">
          <View className="grid grid-cols-5 gap-2 flex-row justify-between">
            {prayers.map((prayer) => (
              <View key={prayer.name} className="p-2 items-center">
                <Text className="text-emerald-300 text-xs mb-1 text-center">
                  {prayer.name}
                </Text>
                <Text className="text-foreground font-semibold text-sm text-center">
                  {prayer.time}
                </Text>
              </View>
            ))}
          </View>
          <View className="mt-3 pt-3 border-t border-white/10 items-center">
            <Text className="text-emerald-300 text-xs">Sholat berikutnya</Text>
            <Text className="text-primary font-semibold">
              {nextPrayer.prayer.name} dalam {formatTimeDifference(nextPrayer.hours, nextPrayer.minutes)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
});
