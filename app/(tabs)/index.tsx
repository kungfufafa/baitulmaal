import BackgroundPattern from '@/components/BackgroundPattern';
import DoaGrid from '@/components/DoaGrid';
import Header from '@/components/Header';
import InfoSlider from '@/components/InfoSlider';
import KhatamModal from '@/components/modals/KhatamModal';
import ReminderModal from '@/components/modals/ReminderModal';
import PaymentCard, { InfakIcon, SedekahIcon, ZakatIcon } from '@/components/PaymentCard';
import PrayerTimes from '@/components/PrayerTimes';
import QuranProgress from '@/components/QuranProgress';
import SectionHeader from '@/components/SectionHeader';
import { Text } from '@/components/ui/text';
import { AMBER_400, EMERALD_900 } from '@/constants/colors';
import { useQuran } from '@/contexts/QuranContext';
import { useArticles, useVideos } from '@/hooks/useBaitulMaal';
import { useToast } from '@/hooks/useToast';
import { Article, PaymentCategory, Slide, Video } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const toTimestamp = (value: string) => {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

const stripHtmlTags = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const truncateText = (value: string, maxLength = 90) => {
    if (value.length <= maxLength) {
        return value;
    }
    return `${value.slice(0, maxLength).trim()}...`;
};

const toRelativeTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'baru saja';
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
};

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { showToast, ToastComponent } = useToast();
    const { progress, reminderTime, setReminderTime } = useQuran();
    const { data: articles, isLoading: isLoadingArticles, refetch: refetchArticles } = useArticles();
    const { data: videos, isLoading: isLoadingVideos, refetch: refetchVideos } = useVideos();

    const [khatamModalVisible, setKhatamModalVisible] = useState(false);
    const [reminderModalVisible, setReminderModalVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const tabBarInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 28 : 12);
    const tabBarHeight = (Platform.OS === 'ios' ? 60 : 56) + tabBarInset;
    const homeBottomPadding = tabBarHeight + 32;

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([refetchArticles(), refetchVideos()]);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchArticles, refetchVideos]);

    const headerSlides = useMemo<Slide[]>(() => {
        const articleSlides = (articles ?? []).map((article) => {
            const summary = article.excerpt?.trim() || stripHtmlTags(article.content);
            return {
                label: '📰 Berita & Artikel',
                content: truncateText(summary || article.title, 95),
                source: toRelativeTime(article.publishedAt),
                publishedAt: article.publishedAt,
            };
        });

        const videoSlides = (videos ?? []).map((video) => ({
            label: '🎥 Video Kajian',
            content: truncateText(video.description?.trim() || video.title, 95),
            source: toRelativeTime(video.publishedAt),
            publishedAt: video.publishedAt,
        }));

        return [...articleSlides, ...videoSlides]
            .slice()
            .sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt))
            .slice(0, 5)
            .map(({ label, content, source }) => ({ label, content, source }));
    }, [articles, videos]);

    const latestVideos = useMemo(() => {
        return (videos ?? [])
            .slice()
            .sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt))
            .slice(0, 3);
    }, [videos]);

    const latestArticles = useMemo(() => {
        return (articles ?? [])
            .slice()
            .sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt))
            .slice(0, 3);
    }, [articles]);

    const handleOpenPayment = (category: PaymentCategory) => {
        router.push({
            pathname: '/donation/flow',
            params: { category },
        });
    };

    const handleOpenVideo = (video: Video) => {
        if (video.youtubeId) {
            Linking.openURL(`https://www.youtube.com/watch?v=${video.youtubeId}`);
            return;
        }
        router.push('/content/videos');
    };

    const handleOpenArticle = (article: Article) => {
        router.push({
            pathname: '/content/article',
            params: {
                id: article.id,
                slug: article.slug || undefined,
            },
        });
    };

    const handleCloseKhatamModal = () => {
        setKhatamModalVisible(false);
    };

    const handleSaveReminder = async (time: string) => {
        const result = await setReminderTime(time);
        if (result.ok) {
            showToast(`Pengingat ngaji diatur pukul ${time}`, '⏰');
        } else {
            showToast(result.message ?? 'Gagal mengatur pengingat', '⚠️');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
            <BackgroundPattern />
            <View className="flex-1">
                <Header />

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: homeBottomPadding }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={AMBER_400}
                            colors={[AMBER_400]}
                        />
                    }
                >
                    <View className="w-full">
                        <InfoSlider slides={headerSlides} loading={isLoadingArticles || isLoadingVideos} />

                        <View className="px-4 py-2">
                            <SectionHeader title="Zakat, Infak, Sedekah" />
                            <View className="flex-row gap-3 mb-3">
                                <View className="flex-1 min-w-0">
                                    <PaymentCard
                                        title="Bayar Zakat"
                                        subtitle="Maal, Fitrah, Profesi"
                                        icon={<ZakatIcon />}
                                        onPress={() => handleOpenPayment('zakat')}
                                    />
                                </View>
                                <View className="flex-1 min-w-0">
                                    <PaymentCard
                                        title="Infak"
                                        subtitle="Umum, Kemanusiaan"
                                        icon={<InfakIcon />}
                                        onPress={() => handleOpenPayment('infak')}
                                        iconBgColor="bg-emerald-400/20"
                                    />
                                </View>
                            </View>
                            <PaymentCard
                                title="Sedekah"
                                subtitle="Jariyah, Umum"
                                icon={<SedekahIcon />}
                                onPress={() => handleOpenPayment('sedekah')}
                                iconBgColor="bg-rose-400/20"
                            />
                        </View>

                        <View className="px-4 py-4">
                            <SectionHeader
                                title="Video Kajian"
                                rightElement={
                                    <Pressable
                                        onPress={() => router.push('/content/videos')}
                                        className="flex-row items-center gap-1 bg-white/5 px-2 py-1 rounded-full"
                                    >
                                        <Text className="text-amber-400 text-xs">Lihat Semua</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={12} color={AMBER_400} />
                                    </Pressable>
                                }
                            />
                            <View className="gap-3">
                                {isLoadingVideos && latestVideos.length === 0 && (
                                    <View className="py-6 items-center">
                                        <ActivityIndicator size="small" color={AMBER_400} />
                                    </View>
                                )}

                                {!isLoadingVideos && latestVideos.length === 0 && (
                                    <View className="bg-white/10 border border-white/10 rounded-xl p-4">
                                        <Text className="text-white/80 text-sm">Belum ada konten video dari backend.</Text>
                                    </View>
                                )}

                                {latestVideos.map((video) => (
                                    <Pressable
                                        key={video.id}
                                        onPress={() => handleOpenVideo(video)}
                                        className="bg-white/10 border border-white/10 rounded-xl p-3 active:bg-white/15"
                                    >
                                        <View className="flex-row gap-3">
                                            <Image
                                                source={{ uri: video.thumbnailUrl }}
                                                className="w-24 h-16 rounded-lg bg-white/5"
                                                resizeMode="cover"
                                            />
                                            <View className="flex-1">
                                                <Text className="text-foreground font-semibold text-sm leading-5 mb-1" numberOfLines={2}>
                                                    {video.title}
                                                </Text>
                                                <Text className="text-white/60 text-xs leading-4" numberOfLines={2}>
                                                    {video.description}
                                                </Text>
                                                <View className="flex-row items-center gap-1 mt-2">
                                                    <MaterialCommunityIcons name="clock-outline" size={12} color="rgba(255,255,255,0.5)" />
                                                    <Text className="text-white/50 text-[10px]">
                                                        {toRelativeTime(video.publishedAt)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View className="px-4 py-2">
                            <SectionHeader
                                title="Berita & Artikel"
                                rightElement={
                                    <Pressable
                                        onPress={() => router.push('/content/news')}
                                        className="flex-row items-center gap-1 bg-white/5 px-2 py-1 rounded-full"
                                    >
                                        <Text className="text-amber-400 text-xs">Lihat Semua</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={12} color={AMBER_400} />
                                    </Pressable>
                                }
                            />
                            <View className="gap-3">
                                {isLoadingArticles && latestArticles.length === 0 && (
                                    <View className="py-6 items-center">
                                        <ActivityIndicator size="small" color={AMBER_400} />
                                    </View>
                                )}

                                {!isLoadingArticles && latestArticles.length === 0 && (
                                    <View className="bg-white/10 border border-white/10 rounded-xl p-4">
                                        <Text className="text-white/80 text-sm">Belum ada berita/artikel dari backend.</Text>
                                    </View>
                                )}

                                {latestArticles.map((article) => (
                                    <Pressable
                                        key={article.id}
                                        onPress={() => handleOpenArticle(article)}
                                        className="bg-white/10 border border-white/10 rounded-xl p-3 active:bg-white/15"
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
                                                <View className="flex-row items-center gap-2 mb-1">
                                                    <View className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                    <Text className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">
                                                        Artikel
                                                    </Text>
                                                </View>
                                                <Text className="text-foreground font-semibold text-sm leading-5 mb-1" numberOfLines={2}>
                                                    {article.title}
                                                </Text>
                                                <Text className="text-white/60 text-xs leading-4" numberOfLines={2}>
                                                    {article.excerpt?.trim() || truncateText(stripHtmlTags(article.content), 72)}
                                                </Text>
                                                <Text className="text-white/45 text-[10px] mt-2">
                                                    {toRelativeTime(article.publishedAt)}
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <PrayerTimes />

                        <QuranProgress
                            progress={progress}
                            onPressContinue={() => router.push({
                                pathname: '/(tabs)/quran/[surah]',
                                params: { surah: progress.surah, ayat: progress.ayat },
                            })}
                            onPressReminder={() => setReminderModalVisible(true)}
                            reminderTime={reminderTime}
                        />

                        <DoaGrid onOpenDoa={() => {
                            router.push('/(tabs)/doa');
                        }} />

                        <View className="px-4 py-2 mb-4">
                            <View className="bg-white/10 border border-white/10 rounded-xl p-4">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <View className="w-1 h-5 bg-primary rounded-full" />
                                    <Text className="text-foreground font-semibold">Titip Doa Bersama</Text>
                                </View>
                                <Text className="text-white/80 text-sm leading-5 mb-3">
                                    Detail doa jamaah dipusatkan di halaman Doa agar Beranda tetap ringkas.
                                </Text>
                                <Pressable
                                    onPress={() => router.push('/(tabs)/doa')}
                                    className="self-start flex-row items-center gap-2 px-3 py-2 rounded-lg bg-amber-400"
                                >
                                    <MaterialCommunityIcons name="heart-outline" size={16} color={EMERALD_900} />
                                    <Text className="text-emerald-900 text-xs font-semibold">Buka Halaman Doa</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <ReminderModal
                    visible={reminderModalVisible}
                    onClose={() => setReminderModalVisible(false)}
                    onSave={handleSaveReminder}
                    reminderTime={reminderTime}
                    tabBarAware
                />

                <KhatamModal
                    visible={khatamModalVisible}
                    onClose={handleCloseKhatamModal}
                />

                {ToastComponent}
            </View>
        </SafeAreaView>
    );
}
