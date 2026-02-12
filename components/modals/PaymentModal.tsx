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
import { PaymentCategory, PaymentType, PaymentMethod } from '@/types';
import { MOCK_PAYMENT_METHODS } from '@/lib/mock-data';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useToast } from '@/hooks/useToast';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  category: PaymentCategory;
  onConfirm: (amount: number, paymentType: PaymentType, method: PaymentMethod) => void;
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [proofUploaded, setProofUploaded] = useState(false);
  const { showToast } = useToast();

  const zakatTypes: PaymentType[] = ['maal', 'fitrah', 'profesi'];
  const infakTypes: PaymentType[] = ['jariyah', 'kemanusiaan', 'umum'];
  const paymentTypes = category === 'zakat' ? zakatTypes : infakTypes;

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

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

  const isReady = getRawValue(amount) > 0 && selectedMethod;

  const handleProcessPayment = () => {
    if (!selectedMethod || getRawValue(amount) <= 0) return;
    onConfirm(getRawValue(amount), selectedPaymentType, selectedMethod);
    setAmount('');
    setSelectedMethod(null);
    setProofUploaded(false);
  };

  const handleAmountChange = (text: string) => {
    setAmount(formatNumber(text));
  };

  const handleClose = () => {
    setAmount('');
    setSelectedMethod(null);
    setProofUploaded(false);
    onClose();
    onModalHide?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    showToast('Nomor rekening disalin', '📋');
  };

  const handleUploadProof = () => {
    setProofUploaded(true);
    showToast('Bukti transfer berhasil diunggah', '✅');
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

            <View className="mb-6">
              <Text className="text-emerald-300 text-sm mb-2 font-poppins">Nominal Donasi</Text>
              <View className="relative">
                <Text className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-medium z-10">
                  Rp
                </Text>
                <Input
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  keyboardType="numeric"
                  className="w-full bg-white/10 border-white/20 pl-12 pr-4 text-foreground text-lg h-14 rounded-xl"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <View className="flex flex-row gap-2 mt-3 flex-wrap">
                {quickAmounts.map((quickAmount) => (
                  <Pressable
                    key={quickAmount}
                    onPress={() => setAmount(formatNumber(quickAmount.toString()))}
                    className="px-3 py-1.5 bg-white/10 rounded-lg active:bg-white/20 border border-white/5"
                  >
                    <Text className="text-foreground text-xs font-poppins">
                      {quickAmount >= 1000000
                        ? `${quickAmount / 1000000}jt`
                        : `${quickAmount / 1000}rb`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-emerald-300 text-sm mb-3 font-poppins">
                Metode Pembayaran
              </Text>
              <View className="gap-3">
                {MOCK_PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod?.id === method.id;
                    return (
                  <Pressable
                    key={method.id}
                    onPress={() => setSelectedMethod(method)}
                    className={cn(
                      'flex flex-col p-4 bg-white/5 rounded-xl border-2 active:bg-white/10 transition-all',
                      isSelected ? 'border-amber-400 bg-white/10' : 'border-transparent'
                    )}
                  >
                    <View className="flex-row items-center gap-4">
                        <View className="w-12 h-12 bg-white rounded-lg items-center justify-center p-1 overflow-hidden">
                             {method.logoUrl ? (
                                 <Image 
                                    source={{ uri: method.logoUrl }} 
                                    className="w-full h-full" 
                                    resizeMode="contain" 
                                />
                             ) : (
                                <Text className="text-black text-xs font-bold">{method.name.substring(0, 3)}</Text>
                             )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground font-semibold font-poppins text-base">
                                {method.name}
                            </Text>
                            <Text className="text-white/60 text-xs font-poppins">
                                {method.type === 'qris' ? 'Scan QR Code' : 'Transfer Bank'}
                            </Text>
                        </View>
                        {isSelected && (
                             <MaterialCommunityIcons name="check-circle" size={24} color="#fbbf24" />
                        )}
                    </View>

                    {isSelected && (
                        <View className="mt-4 pt-4 border-t border-white/10">
                            {method.type === 'qris' ? (
                                <View className="items-center gap-3">
                                    <View className="w-48 h-48 bg-white rounded-xl items-center justify-center p-2">
                                        <MaterialCommunityIcons name="qrcode-scan" size={150} color="black" />
                                    </View>
                                    <Pressable className="flex-row items-center gap-2 bg-emerald-600 px-4 py-2 rounded-full">
                                        <MaterialCommunityIcons name="download" size={16} color="white" />
                                        <Text className="text-white font-medium text-xs">Simpan QRIS</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <View className="gap-3">
                                    <View>
                                        <Text className="text-white/60 text-xs mb-1">Nomor Rekening</Text>
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-amber-400 text-xl font-mono font-bold">
                                                {method.accountNumber}
                                            </Text>
                                            <Pressable onPress={() => copyToClipboard(method.accountNumber || '')}>
                                                <MaterialCommunityIcons name="content-copy" size={18} color="rgba(255,255,255,0.7)" />
                                            </Pressable>
                                        </View>
                                    </View>
                                    <View>
                                        <Text className="text-white/60 text-xs mb-1">Atas Nama</Text>
                                        <Text className="text-foreground font-medium">{method.accountHolder}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                  </Pressable>
                )})}
              </View>
            </View>

            <View className="mb-8">
                <Text className="text-emerald-300 text-sm mb-3 font-poppins">
                    Bukti Transfer
                </Text>
                <Pressable 
                    onPress={handleUploadProof}
                    className={cn(
                        "w-full h-24 rounded-xl border-2 border-dashed border-white/20 items-center justify-center bg-white/5",
                        proofUploaded && "border-emerald-500 bg-emerald-500/10"
                    )}
                >
                    {proofUploaded ? (
                        <View className="items-center">
                            <MaterialCommunityIcons name="check-circle-outline" size={32} color="#10b981" />
                            <Text className="text-emerald-400 text-xs mt-2 font-medium">Bukti terupload</Text>
                        </View>
                    ) : (
                        <View className="items-center">
                            <MaterialCommunityIcons name="cloud-upload-outline" size={32} color="rgba(255,255,255,0.5)" />
                            <Text className="text-white/50 text-xs mt-2 font-poppins">Tap untuk upload bukti</Text>
                        </View>
                    )}
                </Pressable>
            </View>

          </BottomSheetContent>
          </BottomSheetScrollView>

          <BottomSheetFooter>
            <Pressable
              onPress={handleProcessPayment}
              disabled={!isReady}
              className={cn(
                'w-full rounded-xl overflow-hidden h-14 relative flex-shrink-0 mb-4 mx-4 self-center',
                !isReady && 'opacity-50'
              )}
              style={{ width: '92%' }}
            >
              <LinearGradient
                colors={['#d4af37', '#f4d03f', '#d4af37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
              />
              <View className="w-full h-full justify-center items-center py-4 z-10">
                <Text className="text-center text-emerald-900 font-bold text-base font-poppins">
                  {selectedMethod?.type === 'qris' ? 'Saya Sudah Scan QRIS' : 'Konfirmasi Transfer'}
                </Text>
              </View>
            </Pressable>
          </BottomSheetFooter>
        </View>
      </BottomSheet>
    </>
  );
}


