import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';

interface ActivityCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  location: string;
}

export default React.memo(function ActivityCard({
  emoji,
  title,
  subtitle,
  location,
}: ActivityCardProps) {
  return (
    <Card className="bg-white/10 border-white/10">
      <CardContent className="p-4 flex-row items-center gap-3">
        <View className="w-14 h-14 rounded-lg bg-emerald-600 flex items-center justify-center">
          <Text className="text-2xl">{emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-medium text-sm">{title}</Text>
          <Text className="text-emerald-300 text-xs">{subtitle}</Text>
          <Text className="text-primary text-xs mt-1">
            📍 {location}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
});
