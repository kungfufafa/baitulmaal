import { Text } from '@/components/ui/text';
import { Slide } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

interface InfoSliderProps {
  slides: Slide[];
  loading?: boolean;
}

const fallbackSlide: Slide = {
  label: '📰 Info & Inspirasi',
  content: 'Belum ada informasi terbaru dari backend.',
  source: '',
};

export default React.memo(function InfoSlider({ slides, loading = false }: InfoSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideItems = slides.length > 0 ? slides : [fallbackSlide];
  const activeSlide = slideItems[currentSlide] ?? slideItems[0];

  useEffect(() => {
    setCurrentSlide(0);
  }, [slideItems.length]);

  useEffect(() => {
    if (slideItems.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slideItems.length]);

  return (
    <View className="px-4 py-4">
      {/* Outer Container: Handles Shadow */}
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          backgroundColor: 'transparent', // iOS shadow needs this to be transparent if content provides bg
          borderRadius: 16, // rounded-xl
        }}
      >
        {/* Inner Container: Handles Clipping & Border Radius */}
        <View
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            minHeight: 140,
          }}
        >
          <LinearGradient
            colors={['#065f46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}
          >
            <View className="relative z-10">
              <Text className="text-primary text-sm font-medium mb-1">
                {activeSlide.label}
              </Text>
              <Text className="text-white text-sm leading-relaxed">
                {loading && slides.length === 0 ? 'Memuat informasi...' : activeSlide.content}{' '}
                <Text className="text-emerald-300 text-xs">
                  {activeSlide.source}
                </Text>
              </Text>
            </View>
            <Text className="absolute top-4 right-4 text-4xl opacity-20">🕌</Text>
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {slideItems.map((slide, index) => (
                <TouchableOpacity
                  key={`slide-${index}-${slide.label}`}
                  onPress={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-primary opacity-100' : 'bg-white/40'
                    }`}
                />
              ))}
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
});
