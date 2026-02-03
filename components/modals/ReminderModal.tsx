import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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
  const [pickerDate, setPickerDate] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      const nextTime = reminderTime || '';
      setTime(nextTime);
      setPickerDate(timeToDate(nextTime));
    }
  }, [visible, reminderTime]);

  const handleSave = () => {
    if (time) {
      onSave(time);
      onClose();
    }
  };

  const timeToDate = (value: string) => {
    const now = new Date();
    const [hourRaw, minuteRaw] = value.split(':');
    const hour = Number.parseInt(hourRaw || '', 10);
    const minute = Number.parseInt(minuteRaw || '', 10);
    if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
      now.setHours(hour, minute, 0, 0);
    }
    return now;
  };

  const formatTime = (date: Date) => {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') return;
    const nextDate = selected ?? pickerDate;
    setPickerDate(nextDate);
    setTime(formatTime(nextDate));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  if (Platform.OS === 'web') {
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
          <Button
            onPress={handleSave}
            disabled={!time}
            className={cn('w-full h-12', !time && 'opacity-50')}
          >
            <Text className="text-emerald-900 font-semibold text-base">Simpan Pengingat</Text>
          </Button>
        </BottomSheetFooter>
      </BottomSheet>
    );
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={['40%']}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      )}
      backgroundStyle={{ backgroundColor: '#064e3b' }}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
    >
      <BottomSheetView className="flex-1">
        <BottomSheetHeader>
          <BottomSheetTitle>
            ⏰ Atur Pengingat Ngaji
          </BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetContent>
          <View className="mb-4">
            <Text className="text-emerald-300 text-sm mb-2">Waktu Pengingat</Text>
            {Platform.OS === 'ios' ? (
              <View className="bg-white/10 rounded-xl px-2 py-2">
                <DateTimePicker
                  value={pickerDate}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={handleTimeChange}
                />
              </View>
            ) : (
              <Button
                onPress={() => setShowPicker(true)}
                variant="outline"
                className="w-full border-white/20 bg-white/10"
              >
                <Text className="text-foreground text-base">
                  {time || 'Pilih Waktu'}
                </Text>
              </Button>
            )}
            {Platform.OS === 'android' && showPicker && (
              <DateTimePicker
                value={pickerDate}
                mode="time"
                display="default"
                is24Hour
                onChange={handleTimeChange}
              />
            )}
          </View>
        </BottomSheetContent>

        <BottomSheetFooter>
          <Button
            onPress={handleSave}
            disabled={!time}
            className={cn('w-full h-12', !time && 'opacity-50')}
          >
            <Text className="text-emerald-900 font-semibold text-base">Simpan Pengingat</Text>
          </Button>
        </BottomSheetFooter>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
