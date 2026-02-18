import ScreenShell from '@/components/ScreenShell';
import { Text } from '@/components/ui/text';
import { useArticle, useArticles } from '@/hooks/useBaitulMaal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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

const normalizeArticleContent = (value?: string) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

export default function ArticleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; slug?: string | string[] }>();
  const articleId = typeof params.id === 'string' ? params.id : '';
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const {
    data: articleBySlug,
    isLoading: isLoadingArticleBySlug,
    refetch: refetchArticleBySlug,
  } = useArticle(slug, Boolean(slug));
  const { data: articles, isLoading: isLoadingArticles, refetch: refetchArticles } = useArticles();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchArticles(),
        slug ? refetchArticleBySlug() : Promise.resolve(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchArticleBySlug, refetchArticles, slug]);

  const article = useMemo(() => {
    if (articleBySlug) {
      return articleBySlug;
    }

    if (!articles?.length) {
      return null;
    }
    return (
      articles.find((item) => {
        if (slug && item.slug === slug) {
          return true;
        }

        if (articleId && item.id === articleId) {
          return true;
        }

        return false;
      }) ?? null
    );
  }, [articleBySlug, articleId, articles, slug]);

  const contentText = useMemo(() => {
    if (!article) {
      return '';
    }
    return normalizeArticleContent(article.content || article.excerpt || '');
  }, [article]);

  const isLoading = isLoadingArticles || (Boolean(slug) && isLoadingArticleBySlug);

  return (
    <ScreenShell title="📰 Detail Artikel" scrollable={false}>
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
        <View className="mb-4">
          <Pressable
            onPress={() => router.back()}
            className="self-start flex-row items-center gap-2 px-3 py-2 rounded-full bg-white/10"
          >
            <MaterialCommunityIcons name="arrow-left" size={16} color="white" />
            <Text className="text-white/90 text-xs">Kembali</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#fbbf24" size="large" className="mt-10" />
        ) : !article ? (
          <View className="bg-white/10 rounded-xl p-4 border border-white/10">
            <Text className="text-white/80 text-sm mb-3">
              Artikel tidak ditemukan atau sudah tidak tersedia.
            </Text>
            <Pressable
              onPress={() => router.replace('/content/news' as any)}
              className="self-start px-3 py-2 rounded-lg bg-amber-400"
            >
              <Text className="text-emerald-900 text-xs font-semibold">Kembali ke daftar artikel</Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-white/10 rounded-2xl border border-white/10 overflow-hidden">
            {article.thumbnailUrl ? (
              <Image
                source={{ uri: article.thumbnailUrl }}
                className="w-full h-56 bg-white/5"
                resizeMode="cover"
              />
            ) : null}

            <View className="p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <Text className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">
                  Berita & Artikel
                </Text>
              </View>

              <Text className="text-foreground font-semibold text-lg leading-7 mb-2">
                {article.title}
              </Text>

              <View className="flex-row items-center gap-1 mb-4">
                <MaterialCommunityIcons name="clock-outline" size={13} color="rgba(255,255,255,0.5)" />
                <Text className="text-white/50 text-[11px]">
                  {toRelativeTime(article.publishedAt)}
                </Text>
              </View>

              <Text className="text-white/85 text-sm leading-6">
                {contentText || article.excerpt || 'Konten artikel belum tersedia.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}
