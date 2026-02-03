import ScreenShell from '@/components/ScreenShell';
import { useQuran } from '@/contexts/QuranContext';
import { loadSurahList, SurahSummary } from '@/lib/quran';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function QuranScreen() {
    const router = useRouter();
    const { progress } = useQuran();
    const [surahs, setSurahs] = useState<SurahSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await loadSurahList();
                if (!isMounted) return;
                setSurahs(result.data);
            } catch (err) {
                if (!isMounted) return;
                setError('Gagal memuat daftar surah');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <ScreenShell title="📖 Al-Quran" scrollable={false}>
            <View className="gap-2 flex-1">
                {loading && (
                    <Text className="text-emerald-300 text-xs mb-2">Memuat daftar surah...</Text>
                )}
                {!loading && error && (
                    <Text className="text-amber-300 text-xs mb-2">{error}</Text>
                )}
                <FlatList
                    data={surahs}
                    keyExtractor={(item) => item.number.toString()}
                    contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
                    style={{ flex: 1 }}
                    renderItem={({ item }) => {
                        const isActive = item.number === progress.surah;
                        return (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/(tabs)/quran/[surah]',
                                    params: { surah: item.number },
                                })}
                                className={`flex flex-row items-center gap-3 p-3 rounded-xl ${isActive ? 'bg-amber-400/20' : 'bg-white/5'
                                    }`}
                            >
                                <View
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-400' : 'bg-white/10'
                                        }`}
                                >
                                    <Text
                                        className={`font-bold text-sm font-poppins ${isActive ? 'text-emerald-900' : 'text-white'
                                            }`}
                                    >
                                        {item.number}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-medium font-poppins">
                                        {item.latinName || item.name}
                                    </Text>
                                    <Text className="text-emerald-300 text-xs font-poppins">
                                        {item.ayatCount} Ayat
                                    </Text>
                                </View>
                                {isActive && (
                                    <Text className="text-amber-400">✓</Text>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </ScreenShell>
    );
}
