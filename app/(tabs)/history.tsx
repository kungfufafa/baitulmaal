import ScreenShell from '@/components/ScreenShell';
import { bankLabels, categoryLabels, paymentTypeLabels } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useDonationHistory } from '@/hooks/useBaitulMaal';
import { formatCurrency } from '@/lib/formatters';
import { getGuestDonationToken } from '@/lib/guestDonation';
import { AMBER_400 } from '@/constants/colors';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

const statusLabel: Record<string, string> = {
    pending: 'Menunggu Verifikasi',
    verified: 'Terverifikasi',
    confirmed: 'Terkonfirmasi',
    rejected: 'Ditolak',
    completed: 'Selesai',
};

export default function HistoryScreen() {
    const { user, loading: authLoading } = useAuth();
    const [guestToken, setGuestToken] = useState<string | undefined>(undefined);
    const [guestReady, setGuestReady] = useState(false);
    const [guestSessionError, setGuestSessionError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let mounted = true;

        const prepareGuestToken = async () => {
            if (user) {
                if (!mounted) return;
                setGuestReady(true);
                setGuestToken(undefined);
                setGuestSessionError(null);
                return;
            }

            try {
                const token = await getGuestDonationToken();
                if (!mounted) return;
                setGuestToken(token);
                setGuestSessionError(null);
            } catch {
                if (!mounted) return;
                setGuestToken(undefined);
                setGuestSessionError('Gagal menyiapkan sesi donatur guest.');
            } finally {
                if (mounted) {
                    setGuestReady(true);
                }
            }
        };

        setGuestReady(false);
        prepareGuestToken();

        return () => {
            mounted = false;
        };
    }, [user]);

    const canFetchHistory = !authLoading && (user ? true : guestReady && Boolean(guestToken && guestToken.trim().length > 0));
    const {
        data: donations = [],
        isLoading,
        isError,
        refetch,
    } = useDonationHistory(user ? undefined : guestToken, canFetchHistory);

    const showLoading = authLoading || (!user && !guestReady) || isLoading;

    const handleRetryGuestSession = useCallback(async () => {
        if (user) {
            return;
        }

        setGuestReady(false);
        setGuestSessionError(null);

        try {
            const token = await getGuestDonationToken();
            setGuestToken(token);
            setGuestSessionError(null);
        } catch {
            setGuestToken(undefined);
            setGuestSessionError('Gagal menyiapkan sesi donatur guest.');
        } finally {
            setGuestReady(true);
        }
    }, [user]);

    const handleRefresh = useCallback(async () => {
        if (!canFetchHistory) {
            return;
        }

        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    }, [canFetchHistory, refetch]);

    return (
        <ScreenShell title="📋 Riwayat Donasi" scrollable={false}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
                refreshControl={(
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={AMBER_400}
                        colors={[AMBER_400]}
                    />
                )}
            >
                {showLoading ? (
                    <View className="py-8 bg-white/5 rounded-xl mt-4 items-center justify-center min-h-[200px]">
                        <ActivityIndicator size="small" color={AMBER_400} />
                        <Text className="text-center text-white/70 text-xs mt-3">
                            Memuat riwayat donasi...
                        </Text>
                    </View>
                ) : guestSessionError ? (
                    <View className="py-8 bg-white/5 rounded-xl mt-4 items-center justify-center min-h-[200px] px-6">
                        <Text className="text-center text-amber-300 font-poppins text-sm">
                            {guestSessionError}
                        </Text>
                        <Pressable
                            onPress={handleRetryGuestSession}
                            className="mt-4 px-4 py-2 rounded-full bg-amber-400"
                        >
                            <Text className="text-emerald-900 font-semibold text-xs">Coba Lagi</Text>
                        </Pressable>
                    </View>
                ) : isError ? (
                    <View className="py-8 bg-white/5 rounded-xl mt-4 items-center justify-center min-h-[200px] px-6">
                        <Text className="text-center text-amber-300 font-poppins text-sm">
                            Gagal memuat riwayat donasi dari backend.
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            className="mt-4 px-4 py-2 rounded-full bg-amber-400"
                        >
                            <Text className="text-emerald-900 font-semibold text-xs">Coba Lagi</Text>
                        </Pressable>
                    </View>
                ) : donations.length === 0 ? (
                    <View className="py-8 bg-white/5 rounded-xl mt-4 items-center justify-center min-h-[200px]">
                        <Text className="text-4xl mb-4">🍂</Text>
                        <Text className="text-center text-emerald-300 font-poppins">
                            Belum ada riwayat donasi
                        </Text>
                        <Text className="text-center text-white/50 font-poppins text-xs mt-2 px-8">
                            Riwayat donasi Anda akan muncul di sini setelah mengirim donasi.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={donations}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={({ item: donation }) => {
                            const date = new Date(donation.createdAt);
                            return (
                                <View className="bg-white/10 rounded-xl p-4 mb-3">
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
                                    <Text className="text-white/70 text-xs font-poppins mb-1">
                                        {paymentTypeLabels[donation.paymentType] ?? donation.paymentType}
                                    </Text>
                                    <Text className="text-emerald-300 text-sm font-poppins mb-1">
                                        {donation.paymentMethodName ?? (donation.bank ? bankLabels[donation.bank] : 'Metode Lain')}
                                    </Text>
                                    <Text className="text-white/60 text-xs font-poppins">
                                        {statusLabel[donation.status] ?? donation.status}
                                    </Text>
                                </View>
                            );
                        }}
                    />
                )}
            </ScrollView>
        </ScreenShell>
    );
}
