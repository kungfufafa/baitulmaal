import ScreenShell from '@/components/ScreenShell';
import { surahList } from '@/constants';
import { QuranProgress as QuranProgressType } from '@/types';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function QuranScreen() {
    const [progress, setProgress] = useState<QuranProgressType>({ juz: 1, surah: 1 });

    const handleSurahRead = (surahNo: number, juzNo: number) => {
        setProgress({ juz: juzNo, surah: surahNo });
    };

    return (
        <ScreenShell title="📖 Al-Quran">
            <View className="gap-2">
                {surahList.map((surah) => (
                    <TouchableOpacity
                        key={surah.no}
                        onPress={() => handleSurahRead(surah.no, surah.juz)}
                        className={`flex flex-row items-center gap-3 p-3 rounded-xl ${surah.no <= progress.surah ? 'bg-amber-400/20' : 'bg-white/5'
                            }`}
                    >
                        <View
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${surah.no <= progress.surah ? 'bg-amber-400' : 'bg-white/10'
                                }`}
                        >
                            <Text
                                className={`font-bold text-sm font-poppins ${surah.no <= progress.surah ? 'text-emerald-900' : 'text-white'
                                    }`}
                            >
                                {surah.no}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-medium font-poppins">{surah.name}</Text>
                            <Text className="text-emerald-300 text-xs font-poppins">
                                {surah.ayat} Ayat • Juz {surah.juz}
                            </Text>
                        </View>
                        {surah.no <= progress.surah && (
                            <Text className="text-amber-400">✓</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </ScreenShell>
    );
}
