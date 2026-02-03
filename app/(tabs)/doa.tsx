import ScreenShell from '@/components/ScreenShell';
import { doaCollection } from '@/constants';
import { loadDoaByType } from '@/lib/doa';
import { DoaItem, DoaType } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const doaTypeLabels: Record<DoaType, string> = {
    pagi: 'Pagi',
    petang: 'Petang',
    tidur: 'Tidur',
    makan: 'Makan',
};

export default function DoaScreen() {
    const params = useLocalSearchParams<{ type?: string }>();
    const paramType = useMemo<DoaType>(() => {
        const raw = Array.isArray(params.type) ? params.type[0] : params.type;
        if (raw === 'pagi' || raw === 'petang' || raw === 'tidur' || raw === 'makan') {
            return raw;
        }
        return 'pagi';
    }, [params.type]);

    const [selectedType, setSelectedType] = useState<DoaType>(paramType);
    const [items, setItems] = useState<DoaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const doaTypes: DoaType[] = ['pagi', 'petang', 'tidur', 'makan'];

    useEffect(() => {
        setSelectedType(paramType);
    }, [paramType]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await loadDoaByType(selectedType);
                if (!isMounted) return;
                if (result.items.length > 0) {
                    setItems(result.items);
                } else {
                    setItems(doaCollection[selectedType]?.items ?? []);
                }
            } catch (err) {
                if (!isMounted) return;
                setError('Gagal memuat doa online, menampilkan offline');
                setItems(doaCollection[selectedType]?.items ?? []);
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
    }, [selectedType]);

    return (
        <ScreenShell title="🤲 Kumpulan Doa" scrollable={false}>
            <View className="flex-row gap-2 mb-4">
                {doaTypes.map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-full ${selectedType === type ? 'bg-amber-400' : 'bg-white/10'}`}
                    >
                        <Text className={`font-poppins text-sm ${selectedType === type ? 'text-emerald-900 font-medium' : 'text-white'}`}>
                            {doaTypeLabels[type]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-lg font-bold text-amber-400 mb-2 font-poppins">
                    {`Doa ${doaTypeLabels[selectedType]}`}
                </Text>
                {loading && (
                    <Text className="text-emerald-300 text-xs mb-3">Memuat doa...</Text>
                )}
                {!loading && error && (
                    <Text className="text-amber-300 text-xs mb-3">{error}</Text>
                )}
                <View className="gap-4">
                    {items.map((item, index) => (
                        <View key={index} className="bg-white/10 rounded-xl p-4">
                            {item.title && (
                                <Text className="text-foreground font-semibold text-sm mb-2 font-poppins">
                                    {item.title}
                                </Text>
                            )}
                            <Text className="text-amber-400 text-xl text-right leading-loose mb-3 font-amiri">
                                {item.arabic}
                            </Text>
                            <Text className="text-emerald-200 text-sm italic mb-2 font-poppins">
                                {item.latin}
                            </Text>
                            <Text className="text-white text-sm font-poppins">{item.arti}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ScreenShell>
    );
}
