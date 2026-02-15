import { Text } from '@/components/ui/text';
import React, { type ReactNode } from 'react';
import { View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  rightElement?: ReactNode;
}

export default function SectionHeader({ title, rightElement }: SectionHeaderProps) {
  return (
    <View className="flex flex-row items-center justify-between mb-3">
      <View className="flex flex-row items-center gap-2">
        <View className="w-1 h-5 bg-primary rounded-full" />
        <Text className="text-foreground font-semibold">{title}</Text>
      </View>
      {rightElement}
    </View>
  );
}
