import ScreenShell from '@/components/ScreenShell';
import { Text } from '@/components/ui/text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function ContentScreen() {
    const router = useRouter();

    return (
        <ScreenShell title="📚 Inspirasi & Berita">
            <View className="gap-4 pt-2">
                <Pressable
                    onPress={() => router.push('/content/videos' as any)}
                    className="bg-white/10 rounded-2xl p-5 border border-white/10 active:bg-white/15"
                >
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                            <Text className="text-amber-400 text-xs uppercase font-bold tracking-wider mb-1">
                                Konten Video
                            </Text>
                            <Text className="text-white font-semibold font-poppins text-lg mb-1">
                                Video Kajian
                            </Text>
                            <Text className="text-white/70 text-sm leading-5">
                                Kumpulan kajian terbaru. Tap untuk buka daftar video.
                            </Text>
                        </View>
                        <View className="w-10 h-10 rounded-full bg-amber-400/20 items-center justify-center">
                            <MaterialCommunityIcons name="play-circle-outline" size={22} color="#fbbf24" />
                        </View>
                    </View>
                </Pressable>

                <Pressable
                    onPress={() => router.push('/content/news' as any)}
                    className="bg-white/10 rounded-2xl p-5 border border-white/10 active:bg-white/15"
                >
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                            <Text className="text-amber-400 text-xs uppercase font-bold tracking-wider mb-1">
                                Konten Teks
                            </Text>
                            <Text className="text-white font-semibold font-poppins text-lg mb-1">
                                Berita & Artikel
                            </Text>
                            <Text className="text-white/70 text-sm leading-5">
                                Berita dan artikel dakwah. Tap untuk buka daftar artikel.
                            </Text>
                        </View>
                        <View className="w-10 h-10 rounded-full bg-amber-400/20 items-center justify-center">
                            <MaterialCommunityIcons name="newspaper-variant-outline" size={22} color="#fbbf24" />
                        </View>
                    </View>
                </Pressable>
            </View>
        </ScreenShell>
    );
}
