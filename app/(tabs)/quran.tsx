import ScreenShell from '@/components/ScreenShell';
import { useQuran } from '@/contexts/QuranContext';
import { loadSurahList, SurahSummary } from '@/lib/quran';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface SurahRowProps {
    item: SurahSummary;
    isActive: boolean;
    onPress: (surahNumber: number) => void;
}

const SurahRow = React.memo(function SurahRow({ item, isActive, onPress }: SurahRowProps) {
    return (
        <TouchableOpacity
            onPress={() => onPress(item.number)}
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
                {isActive && (
                    <View className="flex-row items-center gap-2 mt-1">
                        <MaterialCommunityIcons name="bookmark" size={14} color="#fbbf24" />
                        <Text className="text-amber-400 text-xs font-poppins">Terakhir dibaca</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});

export default function QuranScreen() {
    const router = useRouter();
    const { progress } = useQuran();
    const [surahs, setSurahs] = useState<SurahSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleOpenSurah = useCallback((surahNumber: number) => {
        router.push({
            pathname: '/(tabs)/quran/[surah]',
            params: { surah: surahNumber },
        });
    }, [router]);

    const renderSurahItem = useCallback(({ item }: { item: SurahSummary }) => {
        const isActive = item.number === progress.surah;
        return (
            <SurahRow
                item={item}
                isActive={isActive}
                onPress={handleOpenSurah}
            />
        );
    }, [handleOpenSurah, progress.surah]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await loadSurahList();
                if (!isMounted) return;
                setSurahs(result.data);
            } catch {
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
                    initialNumToRender={12}
                    maxToRenderPerBatch={12}
                    windowSize={7}
                    removeClippedSubviews
                    updateCellsBatchingPeriod={50}
                    renderItem={renderSurahItem}
                />
            </View>
        </ScreenShell>
    );
}
