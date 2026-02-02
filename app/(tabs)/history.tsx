import ScreenShell from '@/components/ScreenShell';
import { bankLabels, categoryLabels } from '@/constants';
import { useDonations } from '@/contexts/DonationContext';
import { formatCurrency } from '@/lib/formatters';
import { Text, View } from 'react-native';

export default function HistoryScreen() {
    const { donations } = useDonations();

    return (
        <ScreenShell title="📋 Riwayat Donasi">
            {donations.length === 0 ? (
                <View className="py-8 bg-white/5 rounded-xl mt-4 items-center justify-center min-h-[200px]">
                    <Text className="text-4xl mb-4">🍂</Text>
                    <Text className="text-center text-emerald-300 font-poppins">
                        Belum ada riwayat donasi
                    </Text>
                    <Text className="text-center text-white/50 font-poppins text-xs mt-2 px-8">
                        Riwayat donasi Anda akan muncul di sini setelah Anda melakukan pembayaran Zakat atau Infak.
                    </Text>
                </View>
            ) : (
                <View className="gap-3">
                    {donations.map((donation) => {
                        const date = new Date(donation.createdAt);
                        return (
                            <View key={donation.__backendId || donation.createdAt} className="bg-white/10 rounded-xl p-4">
                                <View className="flex flex-row items-center justify-between mb-2">
                                    <Text className="text-amber-400 font-semibold font-poppins">
                                        {categoryLabels[donation.category] || donation.category}
                                    </Text>
                                    <Text className="text-emerald-300 text-xs font-poppins">
                                        {date.toLocaleDateString('id-ID')}
                                    </Text>
                                </View>
                                <Text className="text-white font-bold text-lg font-poppins">
                                    {formatCurrency(donation.amount)}
                                </Text>
                                <Text className="text-emerald-300 text-sm font-poppins">
                                    {bankLabels[donation.bank]}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </ScreenShell>
    );
}
