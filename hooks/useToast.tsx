import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Text } from '@/components/ui/text';

interface ToastState {
  visible: boolean;
  message: string;
  icon: string;
}

interface ToastOptions {
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    icon: '✓',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string, icon: string = '✓', options?: ToastOptions) => {
    const duration = options?.duration ?? 3000;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setToast({ visible: true, message, icon });
    fadeAnim.setValue(0);
    slideAnim.setValue(-50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast((prev) => ({ ...prev, visible: false }));
        timeoutRef.current = null;
      });
    }, duration);
  }, [fadeAnim, slideAnim]);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -50, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  }, [fadeAnim, slideAnim]);

  const ToastComponent = toast.visible ? (
    <View className="absolute top-20 left-0 right-0 z-50 items-center pointer-events-none">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View
          style={{ backgroundColor: '#111827' }}
          className="px-6 py-3 rounded-xl flex flex-row items-center gap-2 shadow-lg"
        >
          <Text className="text-white">{toast.icon}</Text>
          <Text className="text-white font-poppins">{toast.message}</Text>
        </View>
      </Animated.View>
    </View>
  ) : null;

  return {
    showToast,
    hideToast,
    ToastComponent,
  };
}
