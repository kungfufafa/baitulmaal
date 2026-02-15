import ScreenShell from '@/components/ScreenShell';
import { Text } from '@/components/ui/text';
import { useArticles } from '@/hooks/useBaitulMaal';
import { Article } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, View } from 'react-native';

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

export default function ContentNewsScreen() {
  const router = useRouter();
  const { data: articles, isLoading, refetch } = useArticles();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleArticlePress = (article: Article) => {
    router.push({
      pathname: '/content/article',
      params: {
        id: article.id,
        slug: article.slug || undefined,
      },
    });
  };

  return (
    <ScreenShell title="📰 Berita & Artikel" scrollable={false}>
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
            {articles?.map((article) => (
              <Pressable
                key={article.id}
                onPress={() => handleArticlePress(article)}
                className="bg-white/10 rounded-xl p-4 border border-white/5 active:bg-white/15"
              >
                <View className="flex-row gap-3">
                  {article.thumbnailUrl ? (
                    <Image
                      source={{ uri: article.thumbnailUrl }}
                      className="w-20 h-20 rounded-lg bg-white/5"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-lg bg-white/5 border border-white/10 items-center justify-center">
                      <MaterialCommunityIcons name="image-outline" size={20} color="rgba(255,255,255,0.5)" />
                    </View>
                  )}

                  <View className="flex-1">
                    <View className="flex-row items-start gap-2 mb-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                      <Text className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">
                        Artikel
                      </Text>
                    </View>
                    <Text className="text-foreground font-semibold font-poppins text-sm leading-5 mb-2" numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text className="text-white/60 text-xs leading-4" numberOfLines={2}>
                      {article.excerpt}
                    </Text>
                    <Text className="text-white/40 text-[10px] mt-2">
                      {toRelativeTime(article.publishedAt)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {!articles?.length && (
              <View className="bg-white/10 rounded-xl p-4 border border-white/5">
                <Text className="text-white/70 text-sm">Belum ada artikel tersedia.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}
