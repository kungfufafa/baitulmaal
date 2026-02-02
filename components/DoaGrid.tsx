import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

interface DoaGridProps {
  onOpenDoa: (type: string) => void;
}

export default function DoaGrid({ onOpenDoa }: DoaGridProps) {
  const doaItems = [
    { type: 'pagi', emoji: '🌅', label: 'Doa Pagi' },
    { type: 'petang', emoji: '🌆', label: 'Doa Petang' },
    { type: 'tidur', emoji: '🌙', label: 'Doa Tidur' },
    { type: 'makan', emoji: '🍽️', label: 'Doa Makan' },
  ];

  return (
    <View className="px-4 py-4">
      <View className="flex flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 bg-primary rounded-full" />
        <Text className="text-foreground font-semibold">Kumpulan Doa</Text>
      </View>
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {doaItems.map((item) => (
          <Pressable
            key={item.type}
            onPress={() => onOpenDoa(item.type)}
            className="w-[48%] active:opacity-80 web:transition-all web:duration-200 web:hover:scale-[1.02] web:hover:opacity-90"
          >
            <Card className="items-center bg-white/10 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 items-center">
                <Text className="text-3xl mb-2">{item.emoji}</Text>
                <Text className="text-foreground font-medium text-sm">{item.label}</Text>
              </CardContent>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
