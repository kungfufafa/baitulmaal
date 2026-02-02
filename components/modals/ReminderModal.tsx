import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
  reminderTime: string | null;
}

export default React.memo(function ReminderModal({
  visible,
  onClose,
  onSave,
  reminderTime,
}: ReminderModalProps) {
  const [time, setTime] = useState(reminderTime || '');

  const handleSave = () => {
    if (time) {
      onSave(time);
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <BottomSheet open={visible} onOpenChange={handleOpenChange} snapPoints={['40%']}>
      <BottomSheetHeader>
        <BottomSheetTitle>
          ⏰ Atur Pengingat Ngaji
        </BottomSheetTitle>
      </BottomSheetHeader>

      <BottomSheetContent>
        <View className="mb-4">
          <Text className="text-emerald-300 text-sm mb-2">Waktu Pengingat</Text>
          <Input
            value={time}
            onChangeText={setTime}
            placeholder="HH:MM"
            className="w-full bg-white/10 border-white/20 text-white text-lg"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </BottomSheetContent>

      <BottomSheetFooter>
        <Pressable
          onPress={handleSave}
          disabled={!time}
          className={cn('w-full rounded-xl overflow-hidden', !time && 'opacity-50')}
        >
          <LinearGradient
            colors={['#d4af37', '#f4d03f', '#d4af37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl py-3"
          >
            <Text className="text-center text-emerald-900 font-semibold">
              Simpan Pengingat
            </Text>
          </LinearGradient>
        </Pressable>
      </BottomSheetFooter>
    </BottomSheet>
  );
});
