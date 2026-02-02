import ScreenShell from '@/components/ScreenShell';
import { doaCollection } from '@/constants';
import { DoaType } from '@/types';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const doaTypeLabels: Record<DoaType, string> = {
    pagi: 'Pagi',
    petang: 'Petang',
    tidur: 'Tidur',
    makan: 'Makan',
};

export default function DoaScreen() {
    const [selectedType, setSelectedType] = useState<DoaType>('pagi');
    const doa = doaCollection[selectedType];
    const doaTypes: DoaType[] = ['pagi', 'petang', 'tidur', 'makan'];

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
                    {doa.title}
                </Text>
                <View className="gap-4">
                    {doa.items.map((item, index) => (
                        <View key={index} className="bg-white/10 rounded-xl p-4">
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
