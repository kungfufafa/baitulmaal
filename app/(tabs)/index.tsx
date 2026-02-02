import ActivityCard from '@/components/ActivityCard';
import BackgroundPattern from '@/components/BackgroundPattern';
import DoaGrid from '@/components/DoaGrid';
import Header from '@/components/Header';
import InfoSlider from '@/components/InfoSlider';
import KhatamModal from '@/components/modals/KhatamModal';
import ReminderModal from '@/components/modals/ReminderModal';
import PaymentCard, { InfakIcon, ZakatIcon } from '@/components/PaymentCard';
import PrayerTimes from '@/components/PrayerTimes';
import QuranProgress from '@/components/QuranProgress';
import { Text } from '@/components/ui/text';
import { usePaymentSheet } from '@/contexts/PaymentSheetContext';
import { useToast } from '@/hooks/useToast';
import { PaymentCategory, QuranProgress as QuranProgressType } from '@/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();
    const { showToast, ToastComponent } = useToast();
    const { openPaymentSheet } = usePaymentSheet();

    const [quranProgress, setQuranProgress] = useState<QuranProgressType>({ juz: 1, surah: 1 });
    const [ngajiReminder, setNgajiReminder] = useState<string | null>(null);
    const [khatamModalVisible, setKhatamModalVisible] = useState(false);
    const [reminderModalVisible, setReminderModalVisible] = useState(false);

    const handleOpenPayment = (category: PaymentCategory) => {
        openPaymentSheet(category);
    };

    const handleCloseKhatamModal = () => {
        setKhatamModalVisible(false);
        setQuranProgress({ juz: 1, surah: 1 });
    };

    const handleSaveReminder = (time: string) => {
        setNgajiReminder(time);
        showToast(`Pengingat ngaji diatur pukul ${time}`, '⏰');
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
            <BackgroundPattern />
            <View className="flex-1">
                <Header />

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View className="w-full">
                        <InfoSlider />

                        <View className="px-4 py-2">
                            <View className="flex flex-row items-center gap-2 mb-3">
                                <View className="w-1 h-5 bg-primary rounded-full" />
                                <Text className="text-foreground font-semibold">Zakat & Infak</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <PaymentCard
                                        title="Bayar Zakat"
                                        subtitle="Maal, Fitrah, Profesi"
                                        icon={<ZakatIcon />}
                                        onPress={() => handleOpenPayment('zakat')}
                                    />
                                </View>
                                <View className="flex-1">
                                    <PaymentCard
                                        title="Infak/Sedekah"
                                        subtitle="Jariyah, Kemanusiaan"
                                        icon={<InfakIcon />}
                                        onPress={() => handleOpenPayment('infak')}
                                        iconBgColor="bg-emerald-400/20"
                                    />
                                </View>
                            </View>
                        </View>

                        <View className="px-4 py-4">
                            <View className="flex flex-row items-center gap-2 mb-3">
                                <View className="w-1 h-5 bg-primary rounded-full" />
                                <Text className="text-foreground font-semibold">Info Kegiatan</Text>
                            </View>
                            <View className="gap-3">
                                <ActivityCard
                                    emoji="🤲"
                                    title="Santunan Yatim"
                                    subtitle="Minggu, 15 Jumadil Akhir 1446"
                                    location="Masjid Al-Ikhlas"
                                />
                                <ActivityCard
                                    emoji="📚"
                                    title="Kajian Rutin"
                                    subtitle="Setiap Sabtu Ba'da Maghrib"
                                    location="Aula Baitul Maal"
                                />
                            </View>
                        </View>

                        <PrayerTimes />

                        <QuranProgress
                            progress={quranProgress}
                            onPressContinue={() => router.push('/(tabs)/quran')}
                            onPressReminder={() => setReminderModalVisible(true)}
                            reminderTime={ngajiReminder}
                        />

                        <DoaGrid onOpenDoa={(type) => {
                            router.push('/(tabs)/doa');
                        }} />
                    </View>
                </ScrollView>

                <ReminderModal
                    visible={reminderModalVisible}
                    onClose={() => setReminderModalVisible(false)}
                    onSave={handleSaveReminder}
                    reminderTime={ngajiReminder}
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
