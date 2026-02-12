import ScreenShell from '@/components/ScreenShell';
import { Article, Video } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, View, Linking, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useVideos, useArticles } from '@/hooks/useBaitulMaal';

type Tab = 'video' | 'news';

export default function ContentScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('video');
    
    const { data: videos, isLoading: isLoadingVideos } = useVideos();
    const { data: articles, isLoading: isLoadingArticles } = useArticles();

    const handleVideoPress = (video: Video) => {
        // Mock navigation or open youtube
        if (video.youtubeId) {
            Linking.openURL(`https://www.youtube.com/watch?v=${video.youtubeId}`);
        }
    };

    const handleArticlePress = (article: Article) => {
        // Mock navigation to detail
        console.log('Open article', article.slug);
    };

    return (
        <ScreenShell title="📚 Inspirasi & Berita" scrollable={false}>
            <View className="flex-row mb-4 bg-white/10 p-1 rounded-xl">
                <Pressable
                    onPress={() => setActiveTab('video')}
                    className={cn(
                        "flex-1 py-2 items-center rounded-lg transition-all",
                        activeTab === 'video' ? "bg-amber-400 shadow-sm" : "bg-transparent"
                    )}
                >
                    <Text className={cn(
                        "font-medium font-poppins text-sm",
                        activeTab === 'video' ? "text-emerald-900" : "text-white/70"
                    )}>
                        Video Kajian
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('news')}
                    className={cn(
                        "flex-1 py-2 items-center rounded-lg transition-all",
                        activeTab === 'news' ? "bg-amber-400 shadow-sm" : "bg-transparent"
                    )}
                >
                    <Text className={cn(
                        "font-medium font-poppins text-sm",
                        activeTab === 'news' ? "text-emerald-900" : "text-white/70"
                    )}>
                        Berita & Artikel
                    </Text>
                </Pressable>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: 100 }}
                className="flex-1"
            >
                {activeTab === 'video' ? (
                    isLoadingVideos ? (
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
                                            <View className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30">
                                                <MaterialCommunityIcons name="play" size={24} color="white" />
                                            </View>
                                        </View>
                                        <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs">
                                            <Text className="text-white text-[10px] font-medium">12:30</Text>
                                        </View>
                                    </View>
                                    <View className="p-4">
                                        <Text className="text-amber-400 font-semibold font-poppins text-lg leading-6 mb-2">
                                            {video.title}
                                        </Text>
                                        <Text className="text-white/70 font-poppins text-xs leading-5 line-clamp-2" numberOfLines={2}>
                                            {video.description}
                                        </Text>
                                        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                            <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.5)" />
                                            <Text className="text-white/50 text-[10px]">
                                                {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true, locale: id })}
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )
                ) : (
                    isLoadingArticles ? (
                        <ActivityIndicator color="#fbbf24" size="large" className="mt-10" />
                    ) : (
                        <View className="gap-4">
                            {articles?.map((article) => (
                                <Pressable 
                                    key={article.id}
                                    onPress={() => handleArticlePress(article)}
                                    className="bg-white/10 rounded-xl p-4 border border-white/5 active:bg-white/15"
                                >
                                    <View className="flex-row gap-4">
                                        <Image 
                                            source={{ uri: article.thumbnailUrl }} 
                                            className="w-24 h-24 rounded-lg bg-white/5"
                                            resizeMode="cover"
                                        />
                                        <View className="flex-1 justify-between py-1">
                                            <View>
                                                <View className="flex-row items-center gap-1 mb-1">
                                                    <View className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                    <Text className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">
                                                        Artikel
                                                    </Text>
                                                </View>
                                                <Text className="text-foreground font-semibold font-poppins text-sm leading-5 mb-1" numberOfLines={2}>
                                                    {article.title}
                                                </Text>
                                                <Text className="text-white/60 text-xs leading-4" numberOfLines={2}>
                                                    {article.excerpt}
                                                </Text>
                                            </View>
                                            <Text className="text-white/40 text-[10px] mt-2">
                                                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: id })}
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )
                )}
            </ScrollView>
        </ScreenShell>
    );
}
