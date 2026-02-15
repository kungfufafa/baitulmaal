import { Card, CardContent } from '@/components/ui/card';
import SectionHeader from '@/components/SectionHeader';
import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

interface DoaGridProps {
  onOpenDoa: () => void;
}

export default function DoaGrid({ onOpenDoa }: DoaGridProps) {
  return (
    <View className="px-4 py-4">
      <SectionHeader title="Kumpulan Doa" />
      <Pressable
        onPress={onOpenDoa}
        className="w-full active:opacity-80 web:transition-all web:duration-200 web:hover:scale-[1.02] web:hover:opacity-90"
      >
        <Card className="items-center bg-white/10 border-white/10 backdrop-blur-sm">
          <CardContent className="p-4 items-center">
            <Text className="text-3xl mb-2">🤲</Text>
            <Text className="text-foreground font-medium text-sm">Titip Doa Bersama</Text>
            <Text className="text-white/60 text-xs mt-1 text-center">
              Saling mendoakan dan mengaminkan antar jamaah
            </Text>
          </CardContent>
        </Card>
      </Pressable>
    </View>
  );
}
