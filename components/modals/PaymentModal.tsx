import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetScrollView,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { BankType, PaymentCategory, PaymentType } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  category: PaymentCategory;
  onConfirm: (amount: number, paymentType: PaymentType, bank: BankType) => void;
  onModalHide?: () => void;
}

export default function PaymentModal({
  visible,
  onClose,
  category,
  onConfirm,
  onModalHide,
}: PaymentModalProps) {
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>(
    category === 'zakat' ? 'maal' : 'jariyah'
  );
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankType | null>(null);

  const zakatTypes: PaymentType[] = ['maal', 'fitrah', 'profesi'];
  const infakTypes: PaymentType[] = ['jariyah', 'kemanusiaan', 'umum'];
  const paymentTypes = category === 'zakat' ? zakatTypes : infakTypes;

  const banks: BankType[] = ['bsi', 'mandiri', 'bni'];

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  const bankNames: Record<BankType, string> = {
    bsi: 'Bank Syariah Indonesia',
    mandiri: 'Mandiri Syariah',
    bni: 'BNI Syariah',
  };

  const bankIcons: Record<BankType, string> = {
    bsi: 'BSI',
    mandiri: 'MSB',
    bni: 'BNI',
  };

  const paymentTypeLabels: Record<PaymentType, string> = {
    maal: 'Zakat Maal',
    fitrah: 'Zakat Fitrah',
    profesi: 'Zakat Profesi',
    jariyah: 'Sedekah Jariyah',
    kemanusiaan: 'Kemanusiaan',
    umum: 'Infak Umum',
  };

  const snapPoints = useMemo(() => ['60%', '90%'], []);

  useEffect(() => {
    setSelectedPaymentType(category === 'zakat' ? 'maal' : 'jariyah');
  }, [category]);

  const formatNumber = (num: string) => {
    return num.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getRawValue = (formatted: string) => {
    return parseInt(formatted.replace(/\./g, '') || '0', 10);
  };

  const isReady = getRawValue(amount) > 0 && selectedBank;

  const handleProcessPayment = () => {
    if (!selectedBank || getRawValue(amount) <= 0) return;
    onConfirm(getRawValue(amount), selectedPaymentType, selectedBank);
    setAmount('');
    setSelectedBank(null);
  };

  const handleAmountChange = (text: string) => {
    setAmount(formatNumber(text));
  };

  const handleClose = () => {
    setAmount('');
    setSelectedBank(null);
    onClose();
    onModalHide?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <>
      <BottomSheet
        open={visible}
        onOpenChange={handleOpenChange}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
      >
        <View className="flex-1">
          <BottomSheetHeader>
            <BottomSheetTitle>
              {category === 'zakat' ? '💰 Bayar Zakat' : '❤️ Infak/Sedekah'}
            </BottomSheetTitle>
          </BottomSheetHeader>

          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 20 : 0 }}
            className="flex-1"
          >
            <BottomSheetContent>
              <View className="flex flex-row gap-2 flex-wrap mb-4">
              {paymentTypes.map((type) => {
                const isSelected = selectedPaymentType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setSelectedPaymentType(type)}
                    className={cn(
                      "rounded-full px-4 py-2 self-start",
                      isSelected ? "bg-amber-400" : "bg-white/10"
                    )}
                  >
                    <Text className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-emerald-900" : "text-foreground"
                    )}>
                      {paymentTypeLabels[type]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mb-4">
              <Text className="text-emerald-300 text-sm mb-2">Nominal</Text>
              <View className="relative">
                <Text className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-medium z-10">
                  Rp
                </Text>
                <Input
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  keyboardType="numeric"
                  className="w-full bg-white/10 border-white/20 pl-12 pr-4 text-foreground text-lg"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <View className="flex flex-row gap-2 mt-2 flex-wrap">
                {quickAmounts.map((quickAmount) => (
                  <Pressable
                    key={quickAmount}
                    onPress={() => setAmount(formatNumber(quickAmount.toString()))}
                    className="px-3 py-1 bg-white/10 rounded-lg active:bg-white/20 web:hover:bg-white/20"
                  >
                    <Text className="text-foreground text-xs">
                      {quickAmount >= 1000000
                        ? `${quickAmount / 1000000}jt`
                        : `${quickAmount / 1000}rb`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-emerald-300 text-sm mb-2">
                Pilih Bank (QRIS)
              </Text>
              <View className="gap-2">
                {banks.map((bank) => (
                  <Pressable
                    key={bank}
                    onPress={() => setSelectedBank(bank)}
                    className={cn(
                      'flex flex-row items-center gap-3 p-3 bg-white/10 rounded-xl border-2 active:bg-white/20 web:hover:bg-white/15',
                      selectedBank === bank ? 'border-amber-400' : 'border-transparent'
                    )}
                  >
                    <View
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        bank === 'bsi'
                          ? 'bg-white'
                          : bank === 'mandiri'
                            ? 'bg-blue-900'
                            : 'bg-orange-500'
                      )}
                    >
                      <Text
                        className={cn(
                          'font-bold text-sm',
                          bank === 'mandiri' ? 'text-yellow-400' : bank === 'bsi' ? 'text-emerald-700' : 'text-foreground'
                        )}
                      >
                        {bankIcons[bank]}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">
                        {bankNames[bank]}
                      </Text>
                      <Text className="text-emerald-300 text-xs">
                        QRIS Ready
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </BottomSheetContent>
          </BottomSheetScrollView>

          <BottomSheetFooter>
            <Pressable
              onPress={handleProcessPayment}
              disabled={!isReady}
              className={cn(
                'w-full rounded-xl overflow-hidden h-14 relative flex-shrink-0',
                !isReady && 'opacity-50'
              )}
            >
              <LinearGradient
                colors={['#d4af37', '#f4d03f', '#d4af37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
              />
              <View className="w-full h-full justify-center items-center py-4 z-10">
                <Text className="text-center text-emerald-900 font-semibold text-base">
                  Tampilkan QRIS
                </Text>
              </View>
            </Pressable>
          </BottomSheetFooter>
        </View>
      </BottomSheet>
    </>
  );
}
