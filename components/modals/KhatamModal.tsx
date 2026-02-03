import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface KhatamModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function KhatamModal({ visible, onClose }: KhatamModalProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(translateY);
      translateY.value = 0;
    }
    return () => {
      cancelAnimation(translateY);
      translateY.value = 0;
    };
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <BottomSheet open={visible} onOpenChange={handleOpenChange} snapPoints={['60%']}>
      <BottomSheetHeader className="items-center">
        <Animated.View style={animatedStyle}>
          <Text className="text-6xl mb-4 text-center">🎉</Text>
        </Animated.View>
        <Text className="text-2xl font-bold text-amber-400 mb-2 text-center font-amiri">
          ما شاء الله
        </Text>
        <BottomSheetTitle className="text-xl font-bold text-white mb-4 text-center">
          Selamat Khatam Al-Quran!
        </BottomSheetTitle>
      </BottomSheetHeader>

      <BottomSheetContent>
        <Text className="text-emerald-300 mb-6 leading-relaxed text-center">
          Semoga Allah SWT menerima amal ibadah Anda dan memberikan keberkahan dalam hidup. Anda telah
          menyelesaikan 30 Juz Al-Quran. Alhamdulillah!
        </Text>

        <View className="bg-white/10 rounded-xl p-4 mb-6">
          <Text className="text-amber-400 font-amiri text-lg mb-2 text-center">
            اللَّهُمَّ ارْحَمْنِى بِالْقُرْآنِ
          </Text>
          <Text className="text-emerald-200 text-sm text-center">
            Ya Allah, rahmatilah aku dengan Al-Quran
          </Text>
        </View>
      </BottomSheetContent>

      <BottomSheetFooter>
        <Pressable onPress={onClose} className="w-full rounded-xl overflow-hidden">
          <LinearGradient
            colors={['#d4af37', '#f4d03f', '#d4af37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl py-3"
          >
            <Text className="text-center text-emerald-900 font-semibold">
              Alhamdulillah
            </Text>
          </LinearGradient>
        </Pressable>
      </BottomSheetFooter>
    </BottomSheet>
  );
}
