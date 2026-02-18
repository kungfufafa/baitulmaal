import ScreenShell from '@/components/ScreenShell';
import { Text } from '@/components/ui/text';
import { useVideos } from '@/hooks/useBaitulMaal';
import { Video } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';

const toRelativeTime = (value?: string) => {
  if (!value) {
    return 'baru saja';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'baru saja';
  }

  return formatDistanceToNow(date, { addSuffix: true, locale: id });
};

export default function ContentVideosScreen() {
  const { data: videos, isLoading, refetch } = useVideos();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleVideoPress = useCallback(async (video: Video) => {
    if (!video.youtubeId) {
      return;
    }

    const url = `https://www.youtube.com/watch?v=${video.youtubeId}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Tidak dapat membuka video', 'Perangkat tidak mendukung membuka tautan YouTube.');
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      if (__DEV__) console.warn('Failed to open video URL', error);
      Alert.alert('Gagal membuka video', 'Silakan coba lagi.');
    }
  }, []);

  return (
    <ScreenShell title="🎥 Video Kajian" scrollable={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#fbbf24"
            colors={['#fbbf24']}
          />
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#fbbf24" size="large" className="mt-10" />
        ) : (
          <View className="gap-4">
            {videos?.map((video) => (
              <Pressable
                key={video.id}
                onPress={() => handleVideoPress(video)}
                className="bg-white/10 rounded-xl overflow-hidden border border-white/5 active:bg-white/15"
              >
                <View className="h-48 relative">
                  <Image
                    source={{ uri: video.thumbnailUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/30 items-center justify-center">
                    <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/30">
                      <MaterialCommunityIcons name="play" size={24} color="white" />
                    </View>
                  </View>
                </View>
                <View className="p-4">
                  <Text className="text-amber-400 font-semibold font-poppins text-lg leading-6 mb-2">
                    {video.title}
                  </Text>
                  <Text className="text-white/70 font-poppins text-xs leading-5" numberOfLines={2}>
                    {video.description}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.5)" />
                    <Text className="text-white/50 text-[10px]">
                      {toRelativeTime(video.publishedAt)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {!videos?.length && (
              <View className="bg-white/10 rounded-xl p-4 border border-white/5">
                <Text className="text-white/70 text-sm">Belum ada video tersedia.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}
