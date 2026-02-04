import Logo from '@/components/Logo';
import { Text } from '@/components/ui/text';
import { formatDate, formatHijriDate } from '@/lib/formatters';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export default React.memo(function Header() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <View className="px-4 py-3 flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-3 flex-1 min-w-0 pr-2">
          <View className="w-10 h-10 relative">
            <Logo />
          </View>
          <View className="min-w-0">
            <Text className="text-lg font-bold text-foreground font-poppins leading-tight" numberOfLines={1}>
              Baitul Maal
            </Text>
            <Text className="text-xs text-muted-foreground font-poppins leading-none mt-0.5" numberOfLines={1}>
              Amanah dalam Berbagi
            </Text>
          </View>
        </View>
        <View className="items-end flex-shrink" style={{ maxWidth: '48%' }}>
          <Text className="text-sm text-primary font-medium font-poppins text-right" numberOfLines={1} ellipsizeMode="tail">
            {formatHijriDate(date)}
          </Text>
          <Text
            className="text-xs text-muted-foreground font-poppins mt-1 text-right"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {formatDate(date)}
          </Text>
        </View>
      </View>
    </View>
  );
});
