import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PaymentCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  bgColor?: string;
  iconBgColor?: string;
}

export default React.memo(function PaymentCard({
  title,
  subtitle,
  icon,
  onPress,
  bgColor = 'bg-white/10',
  iconBgColor = 'bg-amber-400/20',
}: PaymentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80 web:transition-all web:duration-200 web:hover:scale-[1.02] web:hover:opacity-90"
    >
      <Card className={cn("border-white/10", bgColor)}>
        <CardContent className="p-4">
          <View className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", iconBgColor)}>
            {icon}
          </View>
          <Text className="text-foreground font-semibold text-sm">{title}</Text>
          <Text className="text-emerald-300 text-xs mt-1">{subtitle}</Text>
        </CardContent>
      </Card>
    </Pressable>
  );
});

export function ZakatIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth={2}>
      <Path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Svg>
  );
}

export function InfakIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2}>
      <Path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </Svg>
  );
}

export function SedekahIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth={2}>
      <Path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97-3.833-8-6.86-8-10a4 4 0 017.5-2 4 4 0 017.5 2c0 3.14-3.03 6.167-8 10z" />
    </Svg>
  );
}
