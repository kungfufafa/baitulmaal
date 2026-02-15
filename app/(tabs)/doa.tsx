import ScreenShell from '@/components/ScreenShell';
import SocialPrayerFeed from '@/components/SocialPrayerFeed';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { usePostMemberPrayer } from '@/hooks/useBaitulMaal';
import { useQueryClient } from '@tanstack/react-query';
import { Href, useRouter } from 'expo-router';
import { AMBER_400, EMERALD_900 } from '@/constants/colors';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

const MIN_PRAYER_LENGTH = 5;

export default function DoaScreen() {
    const [content, setContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const postPrayerMutation = usePostMemberPrayer();

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await queryClient.refetchQueries({ queryKey: ['member-prayers'] });
        } finally {
            setIsRefreshing(false);
        }
    }, [queryClient]);

    const handleSubmitPrayer = () => {
        if (!user) {
            router.push('/(auth)/login' as Href);
            return;
        }

        const trimmedContent = content.trim();
        if (trimmedContent.length < MIN_PRAYER_LENGTH) {
            setError(`Isi doa minimal ${MIN_PRAYER_LENGTH} karakter.`);
            return;
        }

        setError(null);
        postPrayerMutation.mutate(
            { content: trimmedContent, isAnonymous },
            {
                onSuccess: () => {
                    setContent('');
                    setIsAnonymous(true);
                },
                onError: () => {
                    setError('Gagal mengirim doa. Silakan coba lagi.');
                },
            }
        );
    };

    return (
        <ScreenShell title="🤲 Titip Doa Bersama" scrollable={false}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={(
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={AMBER_400}
                        colors={[AMBER_400]}
                    />
                )}
            >
                <View className="bg-white/10 rounded-xl p-4 border border-white/10 mb-4">
                    <Text className="text-white/90 text-sm mb-3 font-poppins">
                        Titipkan doa Anda, lalu jamaah lain bisa mengaminkan bersama.
                    </Text>

                    <TextInput
                        value={content}
                        onChangeText={setContent}
                        placeholder="Tuliskan doa Anda di sini..."
                        placeholderTextColor="rgba(255,255,255,0.45)"
                        multiline
                        maxLength={500}
                        textAlignVertical="top"
                        className="min-h-[110px] rounded-xl border border-white/20 bg-emerald-950/40 p-3 text-white"
                    />
                    <Text className="text-white/40 text-xs text-right mt-1">{content.length}/500</Text>

                    <View className="flex-row items-center justify-between mt-3">
                        <Pressable
                            onPress={() => setIsAnonymous((prev) => !prev)}
                            className={`px-3 py-2 rounded-full border ${isAnonymous ? 'bg-white/10 border-white/20' : 'bg-amber-400 border-amber-400'}`}
                        >
                            <Text className={`text-xs font-medium ${isAnonymous ? 'text-white' : 'text-emerald-900'}`}>
                                {isAnonymous ? 'Anonim Aktif' : 'Publik'}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleSubmitPrayer}
                            disabled={postPrayerMutation.isPending}
                            className={`px-4 py-2 rounded-full ${postPrayerMutation.isPending ? 'bg-amber-400/60' : 'bg-amber-400'}`}
                        >
                            {postPrayerMutation.isPending ? (
                                <ActivityIndicator size="small" color={EMERALD_900} />
                            ) : (
                                <Text className="text-emerald-900 text-sm font-semibold">Kirim Doa</Text>
                            )}
                        </Pressable>
                    </View>

                    {error && (
                        <Text className="text-amber-300 text-xs mt-3">{error}</Text>
                    )}
                </View>

                <SocialPrayerFeed showSectionHeader={false} showWriteButton={false} className="px-0 py-0 mb-0" />
            </ScrollView>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    scrollContent: { paddingBottom: 120 },
});
