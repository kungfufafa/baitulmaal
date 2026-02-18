import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { useDonationConfig, useDonationMutation, usePaymentMethods, useZakatCalculator } from '@/hooks/useBaitulMaal';
import { getGuestDonationToken, getGuestDonorProfile, setGuestDonorProfile } from '@/lib/guestDonation';
import { generateDynamicQrisPayload } from '@/lib/qris';
import { cn } from '@/lib/utils';
import { Donation, DonationContextOption, PaymentCategory, PaymentMethod, PaymentType } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useToast } from '@/hooks/useToast';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type DonationStep = 'details' | 'zakatCalculator' | 'amount' | 'method' | 'donor' | 'proof' | 'review';

const STEP_LABELS: Record<DonationStep, string> = {
  details: 'Jenis Donasi',
  zakatCalculator: 'Kalkulator Zakat',
  amount: 'Nominal',
  method: 'Metode Bayar',
  donor: 'Data Donatur',
  proof: 'Upload Bukti',
  review: 'Konfirmasi',
};

const CATEGORY_OPTIONS: { value: PaymentCategory; label: string }[] = [
  { value: 'zakat', label: 'Zakat' },
  { value: 'infak', label: 'Infak' },
  { value: 'sedekah', label: 'Sedekah' },
];

const PAYMENT_TYPES_BY_CATEGORY: Record<PaymentCategory, PaymentType[]> = {
  zakat: ['maal', 'fitrah', 'profesi'],
  infak: ['kemanusiaan', 'umum'],
  sedekah: ['jariyah', 'umum'],
};

const DEFAULT_PAYMENT_TYPE_BY_CATEGORY: Record<PaymentCategory, PaymentType> = {
  zakat: 'maal',
  infak: 'umum',
  sedekah: 'jariyah',
};

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  maal: 'Zakat Maal',
  fitrah: 'Zakat Fitrah',
  profesi: 'Zakat Profesi',
  jariyah: 'Sedekah Jariyah',
  kemanusiaan: 'Infak Kemanusiaan',
  umum: 'Umum',
};

const DEFAULT_CONTEXTS_BY_CATEGORY: Partial<Record<PaymentCategory, DonationContextOption[]>> = {
  infak: [
    { slug: 'infak-pendidikan', label: 'Infak Pendidikan' },
    { slug: 'infak-kemanusiaan', label: 'Infak Kemanusiaan' },
    { slug: 'infak-operasional', label: 'Infak Operasional Dakwah' },
  ],
  sedekah: [
    { slug: 'sedekah-jariyah', label: 'Sedekah Jariyah' },
    { slug: 'sedekah-subuh', label: 'Sedekah Subuh' },
    { slug: 'sedekah-umum', label: 'Sedekah Umum' },
  ],
};

const DEFAULT_RECOMMENDED_AMOUNTS = [25000, 50000, 100000, 250000, 500000, 1000000];
const APP_LOGO = Platform.select({
  ios: require('@/assets/images/ios_appstore_icon_1024.png'),
  android: require('@/assets/images/playstore_icon_1024.png'),
  default: require('@/assets/images/playstore_icon_1024.png'),
});

const normalizeCategory = (value?: string | string[]): PaymentCategory => {
  const target = Array.isArray(value) ? value[0] : value;
  const normalized = (target ?? '').toLowerCase();

  if (normalized === 'zakat' || normalized === 'infak' || normalized === 'sedekah') {
    return normalized;
  }

  return 'sedekah';
};

export default function DonationFlowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const qrisCardCaptureRef = useRef<View | null>(null);

  const initialCategory = useMemo(() => normalizeCategory(params.category), [params.category]);

  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>(initialCategory);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>(DEFAULT_PAYMENT_TYPE_BY_CATEGORY[initialCategory]);
  const [selectedContextSlug, setSelectedContextSlug] = useState('');
  const [intentionNote, setIntentionNote] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [fitrahPeopleCount, setFitrahPeopleCount] = useState('1');
  const [fitrahRicePrice, setFitrahRicePrice] = useState('');
  const [maalTotalAssets, setMaalTotalAssets] = useState('');
  const [maalShortTermDebt, setMaalShortTermDebt] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [haulPassed, setHaulPassed] = useState(true);
  const [profesiIncome, setProfesiIncome] = useState('');
  const [profesiNeeds, setProfesiNeeds] = useState('');
  const [zakatSummary, setZakatSummary] = useState('');
  const [zakatCalculated, setZakatCalculated] = useState(false);
  const [calculatorBreakdown, setCalculatorBreakdown] = useState<Record<string, unknown> | undefined>(undefined);
  const [proofImageUri, setProofImageUri] = useState('');
  const [proofImageFileName, setProofImageFileName] = useState('');
  const [proofImageMimeType, setProofImageMimeType] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);
  const [isDownloadingQris, setIsDownloadingQris] = useState(false);

  const { data: paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
  const { data: donationConfig } = useDonationConfig();
  const zakatCalculatorMutation = useZakatCalculator();
  const donationMutation = useDonationMutation();

  const paymentTypes = useMemo(() => {
    const fromConfig = donationConfig?.categories
      ?.find((item) => item.key === selectedCategory)
      ?.paymentTypes
      ?.map((item) => item.key) ?? [];

    return fromConfig.length > 0 ? fromConfig : PAYMENT_TYPES_BY_CATEGORY[selectedCategory];
  }, [donationConfig?.categories, selectedCategory]);

  const contextOptions = useMemo(() => {
    if (selectedCategory === 'zakat') {
      return [];
    }

    const fromConfig = donationConfig?.contexts?.[selectedCategory] ?? [];
    if (fromConfig.length > 0) {
      return fromConfig;
    }

    return DEFAULT_CONTEXTS_BY_CATEGORY[selectedCategory] ?? [];
  }, [donationConfig?.contexts, selectedCategory]);

  const quickAmounts = useMemo(() => {
    const fromConfig = donationConfig?.recommendedAmounts ?? [];
    return fromConfig.length > 0 ? fromConfig : DEFAULT_RECOMMENDED_AMOUNTS;
  }, [donationConfig?.recommendedAmounts]);

  const activePaymentMethods = useMemo(() => {
    return (paymentMethods ?? []).filter(
      (method): method is PaymentMethod => Boolean(method?.id) && method.isActive !== false
    );
  }, [paymentMethods]);

  const isGuest = !user;
  const isGuestDonorValid = !isGuest || (donorName.trim().length > 1 && donorPhone.trim().length >= 8);
  const selectedContext = contextOptions.find((context) => context.slug === selectedContextSlug);
  const selectedCategoryLabel = CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)?.label ?? 'Donasi';

  const flowSteps = useMemo<DonationStep[]>(() => {
    const steps: DonationStep[] = ['details'];

    if (selectedCategory === 'zakat') {
      steps.push('zakatCalculator');
    }

    steps.push('amount', 'method');

    if (isGuest) {
      steps.push('donor');
    }

    steps.push('proof', 'review');
    return steps;
  }, [isGuest, selectedCategory]);

  const currentStep = flowSteps[currentStepIndex] ?? flowSteps[0];

  const formatNumber = (value: string) => value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const getRawValue = (formatted: string) => parseInt(formatted.replace(/\./g, '') || '0', 10);
  const getNumericInputValue = (value: string) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const rawAmount = getRawValue(amount);

  const isQrisMethod = selectedMethod?.type === 'qris';
  const qrisComputation = useMemo<{ payload: string | null; error: string | null }>(() => {
    if (!isQrisMethod || !selectedMethod?.qrisStaticPayload || rawAmount < 10000) {
      return {
        payload: null,
        error: null,
      };
    }

    try {
      return {
        payload: generateDynamicQrisPayload(selectedMethod.qrisStaticPayload, rawAmount),
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat QRIS';
      if (__DEV__) console.error('QRIS generation error:', error);
      return {
        payload: null,
        error: errorMessage,
      };
    }
  }, [isQrisMethod, selectedMethod?.qrisStaticPayload, rawAmount]);
  const generatedQrisPayload = qrisComputation.payload;
  const qrisError = qrisComputation.error;

  const isDetailsStepValid = selectedCategory === 'zakat' || Boolean(selectedContext);
  const isZakatCalculatorStepValid = selectedCategory !== 'zakat' || zakatCalculated;
  const isAmountStepValid = rawAmount >= 10000;
  const isMethodStepValid = Boolean(selectedMethod) && (!isQrisMethod || Boolean(generatedQrisPayload));
  const isDonorStepValid = !isGuest || isGuestDonorValid;
  const isProofStepValid = proofImageUri.trim().length > 0;

  const canGoNextByStep: Record<DonationStep, boolean> = {
    details: isDetailsStepValid,
    zakatCalculator: isZakatCalculatorStepValid,
    amount: isAmountStepValid,
    method: isMethodStepValid,
    donor: isDonorStepValid,
    proof: isProofStepValid,
    review: false,
  };
  const canGoPreviousStep = currentStepIndex > 0;

  const nextButtonLabel = 'Lanjut';

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSelectedPaymentType((currentType) => {
      if (paymentTypes.includes(currentType)) {
        return currentType;
      }
      return DEFAULT_PAYMENT_TYPE_BY_CATEGORY[selectedCategory];
    });

    if (selectedCategory === 'zakat') {
      setSelectedContextSlug('');
      setIntentionNote('');
    }
  }, [selectedCategory, paymentTypes]);

  useEffect(() => {
    if (selectedCategory === 'zakat') {
      return;
    }

    setSelectedContextSlug((currentValue) => {
      if (contextOptions.some((context) => context.slug === currentValue)) {
        return currentValue;
      }

      return contextOptions[0]?.slug ?? '';
    });
  }, [selectedCategory, contextOptions]);

  useEffect(() => {
    setCurrentStepIndex((currentIndex) => Math.min(currentIndex, flowSteps.length - 1));
  }, [flowSteps.length]);

  useEffect(() => {
    setSelectedMethod((currentMethod) => {
      if (!currentMethod) {
        return null;
      }

      return activePaymentMethods.some((method) => method.id === currentMethod.id)
        ? currentMethod
        : null;
    });
  }, [activePaymentMethods]);

  useEffect(() => {
    let isMounted = true;

    const hydrateGuestProfile = async () => {
      if (user) {
        if (!isMounted) return;
        setGuestToken(null);
        setDonorName(user.name ?? '');
        setDonorPhone(user.phone ?? '');
        setDonorEmail(user.email ?? '');
        return;
      }

      try {
        const [token, profile] = await Promise.all([
          getGuestDonationToken(),
          getGuestDonorProfile(),
        ]);

        if (!isMounted) return;
        setGuestToken(token);
        setDonorName(profile.name ?? '');
        setDonorPhone(profile.phone ?? '');
        setDonorEmail(profile.email ?? '');
      } catch {
        if (!isMounted) return;
        setGuestToken(null);
      }
    };

    hydrateGuestProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    setZakatCalculated(false);
    setZakatSummary('');
    setCalculatorBreakdown(undefined);
  }, [selectedCategory, selectedPaymentType]);

  const handleCalculateZakat = () => {
    if (selectedCategory !== 'zakat') {
      return;
    }

    const normalizedType = selectedPaymentType === 'fitrah'
      ? 'fitrah'
      : selectedPaymentType === 'profesi'
        ? 'profesi'
        : 'maal';

    const payload: Parameters<typeof zakatCalculatorMutation.mutate>[0] = {
      type: normalizedType,
    };

    if (normalizedType === 'fitrah') {
      const peopleCount = Math.max(1, Math.round(getNumericInputValue(fitrahPeopleCount)));
      const ricePricePerKg = getNumericInputValue(fitrahRicePrice);

      if (ricePricePerKg < 1000) {
        setFormError('Masukkan harga beras per kg yang valid untuk hitung zakat fitrah.');
        return;
      }

      payload.peopleCount = peopleCount;
      payload.ricePricePerKg = ricePricePerKg;
    }

    if (normalizedType === 'maal') {
      const totalAssets = getNumericInputValue(maalTotalAssets);
      const shortTermDebt = getNumericInputValue(maalShortTermDebt);
      const goldPricePerGram = getNumericInputValue(goldPrice);

      if (totalAssets <= 0 || goldPricePerGram <= 0) {
        setFormError('Masukkan total harta dan harga emas untuk hitung zakat maal.');
        return;
      }

      payload.totalAssets = totalAssets;
      payload.shortTermDebt = shortTermDebt;
      payload.goldPricePerGram = goldPricePerGram;
      payload.haulPassed = haulPassed;
    }

    if (normalizedType === 'profesi') {
      const monthlyIncome = getNumericInputValue(profesiIncome);
      const monthlyNeeds = getNumericInputValue(profesiNeeds);
      const goldPricePerGram = getNumericInputValue(goldPrice);

      if (monthlyIncome <= 0 || goldPricePerGram <= 0) {
        setFormError('Masukkan penghasilan dan harga emas untuk hitung zakat profesi.');
        return;
      }

      payload.monthlyIncome = monthlyIncome;
      payload.monthlyNeeds = monthlyNeeds;
      payload.goldPricePerGram = goldPricePerGram;
      payload.periodMonths = 1;
    }

    zakatCalculatorMutation.mutate(payload, {
      onSuccess: (result) => {
        setAmount(formatNumber(String(Math.round(result.recommendedAmount))));
        setZakatSummary(result.summary);
        setCalculatorBreakdown(result.breakdown);
        setZakatCalculated(true);
        setFormError(null);
        showToast('Nominal zakat berhasil dihitung', '🧮');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message ?? 'Gagal menghitung zakat';
        setFormError(message);
      },
    });
  };

  const handlePickProofImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFormError('Izin galeri dibutuhkan untuk upload bukti transfer.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    setProofImageUri(asset.uri);
    setProofImageFileName(asset.fileName || `proof-${Date.now()}.jpg`);
    setProofImageMimeType(asset.mimeType || 'image/jpeg');
    setFormError(null);
  };

  const handleDownloadQris = async () => {
    if (!generatedQrisPayload || !qrisCardCaptureRef.current || isDownloadingQris) {
      return;
    }

    setIsDownloadingQris(true);
    try {
      if (Platform.OS === 'web') {
        const dataUri = await captureRef(qrisCardCaptureRef.current, {
          format: 'png',
          quality: 1,
          result: 'data-uri',
        });

        const anchor = document.createElement('a');
        anchor.href = dataUri;
        anchor.download = `qris-baitulmaal-${Date.now()}.png`;
        anchor.click();
        showToast('QRIS berhasil diunduh', '✅');
        return;
      }

      const uri = await captureRef(qrisCardCaptureRef.current, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.saveToLibraryAsync(uri);
        showToast('QRIS tersimpan di galeri', '✅');
        return;
      }

      await Share.share({
        title: 'QRIS Donasi',
        message: 'Simpan gambar QRIS ini untuk pembayaran donasi.',
        url: uri,
      });
      showToast('QRIS siap dibagikan', '✅');
    } catch {
      showToast('Gagal download QRIS', '❌');
    } finally {
      setIsDownloadingQris(false);
    }
  };

  const handleSubmitDonation = async () => {
    if (!selectedMethod || rawAmount < 10000 || donationMutation.isPending) return;
    if (selectedCategory !== 'zakat' && !selectedContext) {
      setFormError('Pilih konteks donasi terlebih dahulu.');
      return;
    }

    if (!proofImageUri) {
      setFormError('Upload bukti transfer terlebih dahulu.');
      return;
    }

    if (isGuest && !isGuestDonorValid) {
      setFormError('Nama dan nomor WhatsApp wajib diisi untuk donatur tanpa login.');
      return;
    }

    setFormError(null);

    let currentGuestToken: string | undefined = undefined;
    if (isGuest) {
      try {
        currentGuestToken = guestToken ?? await getGuestDonationToken();
        setGuestToken(currentGuestToken);
        await setGuestDonorProfile({
          name: donorName,
          phone: donorPhone,
          email: donorEmail,
        });
      } catch {
        setFormError('Gagal menyiapkan identitas donatur. Coba lagi.');
        return;
      }
    }

    donationMutation.mutate({
      amount: rawAmount,
      paymentType: selectedPaymentType,
      paymentMethodId: selectedMethod.id,
      category: selectedCategory,
      contextSlug: selectedContext?.slug,
      contextLabel: selectedContext?.label,
      intentionNote: intentionNote.trim() || undefined,
      calculatorType: selectedCategory === 'zakat' ? (selectedPaymentType as 'maal' | 'fitrah' | 'profesi') : undefined,
      calculatorBreakdown: selectedCategory === 'zakat' ? calculatorBreakdown : undefined,
      paymentMethod: selectedMethod,
      guestToken: currentGuestToken,
      donorName: donorName.trim() || undefined,
      donorPhone: donorPhone.trim() || undefined,
      donorEmail: donorEmail.trim() || undefined,
      isGuest,
      proofImageUri,
      proofImageFileName,
      proofImageMimeType,
    }, {
      onSuccess: (donation) => {
        setCompletedDonation(donation);
        showToast('Donasi berhasil dikirim', '✅');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message ?? 'Gagal mengirim donasi';
        setFormError(message);
      },
    });
  };

  const handleNextStep = () => {
    if (!canGoNextByStep[currentStep]) {
      if (currentStep === 'details') {
        setFormError('Pilih jenis donasi secara lengkap sebelum lanjut.');
      } else if (currentStep === 'zakatCalculator') {
        setFormError('Hitung zakat terlebih dahulu sebelum lanjut ke nominal.');
      } else if (currentStep === 'amount') {
        setFormError('Masukkan nominal minimal Rp10.000 sebelum lanjut.');
      } else if (currentStep === 'method') {
        setFormError('Pilih metode pembayaran terlebih dahulu.');
      } else if (currentStep === 'donor') {
        setFormError('Lengkapi data donatur untuk lanjut.');
      } else if (currentStep === 'proof') {
        setFormError('Upload bukti transfer sebelum lanjut.');
      }
      return;
    }

    setFormError(null);
    setCurrentStepIndex((currentIndex) => Math.min(currentIndex + 1, flowSteps.length - 1));
  };

  const handleBackStep = () => {
    if (!canGoPreviousStep) {
      return;
    }
    setCurrentStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
    setFormError(null);
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  const renderDetailsStep = () => (
    <View className="gap-4">
      <View>
        <Text className="text-emerald-300 text-sm mb-2 font-poppins">Kategori Donasi</Text>
        <View className="flex-row gap-2 flex-wrap">
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected = selectedCategory === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setSelectedCategory(option.value)}
                className={cn(
                  'rounded-full px-4 py-2',
                  isSelected ? 'bg-amber-400' : 'bg-white/10'
                )}
              >
                <Text className={cn('font-medium text-sm', isSelected ? 'text-emerald-900' : 'text-foreground')}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="text-emerald-300 text-sm mb-2 font-poppins">Jenis Pembayaran</Text>
        <View className="flex-row gap-2 flex-wrap">
          {paymentTypes.map((type) => {
            const isSelected = selectedPaymentType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setSelectedPaymentType(type)}
                className={cn(
                  'rounded-full px-4 py-2',
                  isSelected ? 'bg-amber-400' : 'bg-white/10'
                )}
              >
                <Text className={cn('font-medium text-sm', isSelected ? 'text-emerald-900' : 'text-foreground')}>
                  {type === 'umum'
                    ? selectedCategory === 'sedekah'
                      ? 'Sedekah Umum'
                      : selectedCategory === 'infak'
                        ? 'Infak Umum'
                        : PAYMENT_TYPE_LABELS[type]
                    : PAYMENT_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedCategory !== 'zakat' && (
        <View className="gap-3">
          <Text className="text-emerald-300 text-sm font-poppins">Konteks Donasi (Wajib)</Text>
          <View className="gap-2">
            {contextOptions.map((contextOption) => {
              const isSelected = selectedContextSlug === contextOption.slug;

              return (
                <Pressable
                  key={contextOption.slug}
                  onPress={() => setSelectedContextSlug(contextOption.slug)}
                  className={cn(
                    'rounded-xl border px-3 py-3',
                    isSelected ? 'border-amber-400 bg-amber-400/15' : 'border-white/15 bg-white/5'
                  )}
                >
                  <Text className={cn('font-semibold text-sm', isSelected ? 'text-amber-300' : 'text-foreground')}>
                    {contextOption.label}
                  </Text>
                  {contextOption.description ? (
                    <Text className="text-white/60 text-xs mt-1">{contextOption.description}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <Input
            value={intentionNote}
            onChangeText={setIntentionNote}
            placeholder="Catatan niat (opsional)"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      )}
    </View>
  );

  const renderZakatCalculatorStep = () => (
    <View className="gap-4">
      <View className="bg-white/5 border border-white/15 rounded-xl p-4">
        <Text className="text-emerald-300 text-sm font-poppins">Jenis Zakat: {PAYMENT_TYPE_LABELS[selectedPaymentType]}</Text>
        <Text className="text-white/60 text-xs mt-1">
          Tahap ini wajib diisi dan dihitung dulu sebelum masuk ke nominal.
        </Text>
      </View>

      {selectedPaymentType === 'fitrah' && (
        <View className="gap-3">
          <Input
            value={fitrahPeopleCount}
            onChangeText={(value) => {
              setFitrahPeopleCount(value);
              setZakatCalculated(false);
            }}
            placeholder="Jumlah jiwa"
            keyboardType="numeric"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <Input
            value={fitrahRicePrice}
            onChangeText={(value) => {
              setFitrahRicePrice(value);
              setZakatCalculated(false);
            }}
            placeholder="Harga beras per kg"
            keyboardType="numeric"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      )}

      {selectedPaymentType === 'maal' && (
        <View className="gap-3">
          <Input
            value={maalTotalAssets}
            onChangeText={(value) => {
              setMaalTotalAssets(value);
              setZakatCalculated(false);
            }}
            placeholder="Total harta"
            keyboardType="numeric"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <Input
            value={maalShortTermDebt}
            onChangeText={(value) => {
              setMaalShortTermDebt(value);
              setZakatCalculated(false);
            }}
            placeholder="Utang jangka pendek"
            keyboardType="numeric"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <Input
            value={goldPrice}
            onChangeText={(value) => {
              setGoldPrice(value);
              setZakatCalculated(false);
            }}
            placeholder="Harga emas per gram"
            keyboardType="numeric"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => {
                setHaulPassed(true);
                setZakatCalculated(false);
              }}
              className={cn(
                'flex-1 py-2 rounded-lg items-center',
                haulPassed ? 'bg-amber-400' : 'bg-white/10'
              )}
            >
              <Text className={cn('text-xs font-medium', haulPassed ? 'text-emerald-900' : 'text-foreground')}>
                Haul Sudah 1 Tahun
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setHaulPassed(false);
                setZakatCalculated(false);
              }}
              className={cn(
                'flex-1 py-2 rounded-lg items-center',
                !haulPassed ? 'bg-amber-400' : 'bg-white/10'
              )}
            >
              <Text className={cn('text-xs font-medium', !haulPassed ? 'text-emerald-900' : 'text-foreground')}>
                Belum 1 Tahun
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {selectedPaymentType === 'profesi' && (
        <View className="gap-3">
          <Input
            value={profesiIncome}
            onChangeText={(value) => {
              setProfesiIncome(value);
              setZakatCalculated(false);
            }}
            placeholder="Penghasilan bulanan"
            keyboardType="numeric"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <Input
            value={profesiNeeds}
            onChangeText={(value) => {
              setProfesiNeeds(value);
              setZakatCalculated(false);
            }}
            placeholder="Kebutuhan pokok bulanan"
            keyboardType="numeric"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <Input
            value={goldPrice}
            onChangeText={(value) => {
              setGoldPrice(value);
              setZakatCalculated(false);
            }}
            placeholder="Harga emas per gram"
            keyboardType="numeric"
            className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      )}

      <Pressable
        onPress={handleCalculateZakat}
        disabled={zakatCalculatorMutation.isPending}
        className={cn(
          'rounded-xl bg-amber-400 py-3 items-center',
          zakatCalculatorMutation.isPending && 'opacity-60'
        )}
      >
        {zakatCalculatorMutation.isPending ? (
          <ActivityIndicator size="small" color="#064e3b" />
        ) : (
          <Text className="text-emerald-900 font-semibold text-sm">Hitung Nominal Zakat</Text>
        )}
      </Pressable>

      {zakatSummary ? (
        <View className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3">
          <Text className="text-white/80 text-xs leading-5">{zakatSummary}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderAmountStep = () => (
    <View className="gap-3">
      <Text className="text-emerald-300 text-sm font-poppins">
        {selectedCategory === 'zakat' ? 'Nominal Zakat' : 'Nominal Donasi'}
      </Text>
      <View className="relative">
        <Text className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-medium z-10">
          Rp
        </Text>
        <Input
          value={amount}
          onChangeText={(text) => setAmount(formatNumber(text))}
          placeholder="0"
          keyboardType="numeric"
          className="w-full bg-white/10 border-white/20 pl-12 pr-4 text-foreground text-lg h-14 rounded-xl"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      <Text className="text-white/50 text-xs">Minimal donasi Rp10.000</Text>
      <View className="flex-row gap-2 flex-wrap">
        {quickAmounts.map((quickAmount) => (
          <Pressable
            key={quickAmount}
            onPress={() => setAmount(formatNumber(quickAmount.toString()))}
            className="px-3 py-1.5 bg-white/10 rounded-lg active:bg-white/20 border border-white/5"
          >
            <Text className="text-foreground text-xs font-poppins">
              {quickAmount >= 1000000 ? `${quickAmount / 1000000}jt` : `${quickAmount / 1000}rb`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderMethodStep = () => (
    <View className="gap-3">
      <Text className="text-emerald-300 text-sm font-poppins">Pilih Metode Pembayaran</Text>
      {isLoadingMethods ? (
        <ActivityIndicator size="small" color="#fbbf24" />
      ) : activePaymentMethods.length === 0 ? (
        <View className="bg-white/10 border border-white/10 rounded-xl p-4">
          <Text className="text-white/80 text-sm">Metode pembayaran belum tersedia saat ini.</Text>
        </View>
      ) : (
        activePaymentMethods.map((method) => {
          const isSelected = selectedMethod?.id === method.id;

          return (
            <Pressable
              key={method.id}
              onPress={() => setSelectedMethod(method)}
              className={cn(
                'p-4 bg-white/5 rounded-xl border-2 active:bg-white/10',
                isSelected ? 'border-amber-400 bg-white/10' : 'border-transparent'
              )}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-white rounded-lg items-center justify-center p-1 overflow-hidden">
                  {method.logoUrl && method.logoUrl.trim() !== '' ? (
                    <Image source={{ uri: method.logoUrl }} className="w-full h-full" resizeMode="contain" />
                  ) : (
                    <Text className="text-black text-xs font-bold">{method.name?.substring(0, 3) ?? 'N/A'}</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold font-poppins text-base">
                    {method.name}
                  </Text>
                  <Text className="text-white/60 text-xs font-poppins">
                    {method.type === 'qris'
                      ? 'Scan QR Code'
                      : method.type === 'ewallet'
                        ? 'Transfer E-Wallet'
                        : 'Transfer Bank'}
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
                      <View
                        ref={qrisCardCaptureRef}
                        collapsable={false}
                        className="w-full max-w-[330px] bg-white rounded-[24px] overflow-hidden border border-neutral-200"
                      >
                        <View
                          style={{
                            position: 'absolute',
                            left: -48,
                            top: 230,
                            width: 92,
                            height: 92,
                            backgroundColor: '#f43f5e',
                            transform: [{ rotate: '45deg' }],
                          }}
                        />
                        <View
                          style={{
                            position: 'absolute',
                            right: -78,
                            bottom: -78,
                            width: 180,
                            height: 180,
                            backgroundColor: '#f43f5e',
                            transform: [{ rotate: '45deg' }],
                          }}
                        />

                        <View className="px-4 pt-4 flex-row items-start justify-between">
                          <View className="pr-3">
                            <Text className="text-black text-xl font-poppins-bold">QRIS</Text>
                            <Text className="text-neutral-700 text-xs font-poppins">
                              QR Code Pembayaran Donasi
                            </Text>
                          </View>
                          <View className="w-12 h-12 rounded-xl bg-white border border-neutral-200 items-center justify-center overflow-hidden">
                            <Image source={APP_LOGO} className="w-10 h-10" resizeMode="contain" />
                          </View>
                        </View>

                        <View className="px-4 mt-2">
                          <Text className="text-black text-base font-poppins-bold uppercase">
                            {method.accountHolder || 'BAITUL MAAL'}
                          </Text>
                          <Text className="text-neutral-600 text-xs font-poppins mt-0.5">
                            {selectedCategoryLabel} • {PAYMENT_TYPE_LABELS[selectedPaymentType]}
                          </Text>
                          <Text className="text-neutral-700 text-xs font-poppins mt-1">
                            Nominal: Rp{rawAmount.toLocaleString('id-ID')}
                          </Text>
                        </View>

                        <View className="mx-4 mt-3 mb-4 bg-white border border-neutral-300 rounded-xl p-3 items-center justify-center">
                          {generatedQrisPayload && generatedQrisPayload.trim() !== '' ? (
                            <QRCode
                              value={generatedQrisPayload}
                              size={230}
                            />
                          ) : (
                            <MaterialCommunityIcons name="qrcode-scan" size={170} color="black" />
                          )}
                        </View>

                        <View className="bg-rose-500 px-4 py-3">
                          <Text className="text-white text-xs font-poppins-medium text-center">
                            Scan QRIS ini lalu lanjut upload bukti transfer.
                          </Text>
                        </View>
                      </View>

                      <Text className="text-white/70 text-xs text-center px-4">
                        {qrisError
                          ? `Error: ${qrisError}`
                          : generatedQrisPayload
                            ? 'QRIS siap dipakai dan bisa diunduh sebagai gambar.'
                            : method.qrisStaticPayload
                              ? 'Masukkan nominal minimal Rp10.000 agar QRIS dinamis tampil.'
                              : 'Template QRIS belum dikonfigurasi. Hubungi admin.'}
                      </Text>

                      {generatedQrisPayload && (
                        <Pressable
                          onPress={handleDownloadQris}
                          disabled={isDownloadingQris}
                          className={cn(
                            'flex-row items-center gap-2 bg-emerald-600 px-4 py-2 rounded-full',
                            isDownloadingQris && 'opacity-60'
                          )}
                        >
                          {isDownloadingQris ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <MaterialCommunityIcons name="download" size={16} color="white" />
                          )}
                          <Text className="text-white font-medium text-xs">Download QRIS</Text>
                        </Pressable>
                      )}
                    </View>
                  ) : (
                    <View className="gap-2">
                      <View>
                        <Text className="text-white/60 text-xs mb-1">
                          {method.type === 'ewallet' ? 'Nomor Akun' : 'Nomor Rekening'}
                        </Text>
                        <Text className="text-amber-400 text-xl font-mono font-bold">
                          {method.accountNumber}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-white/60 text-xs mb-1">
                          {method.type === 'ewallet' ? 'Nama Akun' : 'Atas Nama'}
                        </Text>
                        <Text className="text-foreground font-medium">{method.accountHolder}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        })
      )}
    </View>
  );

  const renderDonorStep = () => (
    <View className="gap-3">
      <Text className="text-emerald-300 text-sm font-poppins">Data Donatur (Wajib untuk Guest)</Text>
      <Input
        value={donorName}
        onChangeText={setDonorName}
        placeholder="Nama lengkap"
        className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
        placeholderTextColor="rgba(255,255,255,0.5)"
      />
      <Input
        value={donorPhone}
        onChangeText={setDonorPhone}
        placeholder="Nomor WhatsApp"
        keyboardType="phone-pad"
        className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
        placeholderTextColor="rgba(255,255,255,0.5)"
      />
      <Input
        value={donorEmail}
        onChangeText={setDonorEmail}
        placeholder="Email (opsional)"
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full bg-white/10 border-white/20 px-4 text-foreground rounded-xl"
        placeholderTextColor="rgba(255,255,255,0.5)"
      />
    </View>
  );

  const renderProofStep = () => (
    <View className="gap-4">
      <View className="bg-white/5 border border-white/15 rounded-xl p-4">
        <Text className="text-emerald-300 text-sm font-poppins">Upload Bukti Transfer</Text>
        <Text className="text-white/60 text-xs mt-1">
          Tahap terakhir sebelum konfirmasi. Unggah screenshot bukti transfer Anda.
        </Text>
      </View>

      <Pressable
        onPress={handlePickProofImage}
        className="rounded-xl border border-dashed border-emerald-300/60 bg-white/5 py-4 px-4 items-center"
      >
        <MaterialCommunityIcons name="image-plus" size={26} color="#6ee7b7" />
        <Text className="text-emerald-200 text-sm mt-2 font-poppins">Pilih Gambar Bukti</Text>
      </Pressable>

      {proofImageUri && proofImageUri.trim() !== '' ? (
        <View className="rounded-xl overflow-hidden border border-white/10">
          <Image
            source={{ uri: proofImageUri }}
            className="w-full h-56 bg-black/20"
            resizeMode="cover"
          />
          <View className="p-3 bg-emerald-950/50">
            <Text className="text-foreground text-xs">{proofImageFileName || 'Bukti transfer dipilih'}</Text>
            <Pressable onPress={() => {
              setProofImageUri('');
              setProofImageFileName('');
              setProofImageMimeType('');
            }}>
              <Text className="text-amber-300 text-xs mt-2">Ganti gambar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );

  const renderReviewStep = () => (
    <View className="gap-4">
      <View className="bg-white/5 border border-white/15 rounded-xl p-4 gap-2">
        <Text className="text-emerald-300 text-sm font-poppins">Ringkasan Donasi</Text>
        <Text className="text-foreground text-sm">Kategori: {selectedCategoryLabel}</Text>
        <Text className="text-foreground text-sm">Jenis: {PAYMENT_TYPE_LABELS[selectedPaymentType]}</Text>
        {selectedContext?.label ? (
          <Text className="text-foreground text-sm">Konteks: {selectedContext.label}</Text>
        ) : null}
        <Text className="text-foreground text-sm">Nominal: Rp{rawAmount.toLocaleString('id-ID')}</Text>
        <Text className="text-foreground text-sm">Metode: {selectedMethod?.name ?? '-'}</Text>
        <Text className="text-foreground text-sm">
          Donatur: {isGuest ? donorName || '-' : user?.name || '-'}
        </Text>
      </View>

      {zakatSummary ? (
        <View className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3">
          <Text className="text-white/80 text-xs leading-5">{zakatSummary}</Text>
        </View>
      ) : null}
    </View>
  );

  if (completedDonation) {
    return (
      <SafeAreaView className="flex-1 bg-emerald-900" edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="light" />
        {ToastComponent}
        <View className="flex-1 px-6 items-center justify-center">
          <View className="w-24 h-24 rounded-full bg-emerald-400/20 items-center justify-center mb-6">
            <MaterialCommunityIcons name="check-circle" size={56} color="#6ee7b7" />
          </View>
          <Text className="text-white text-2xl font-poppins-bold text-center">Donasi Berhasil Dikirim</Text>
          <Text className="text-emerald-100 text-center mt-3 leading-6">
            Bukti transfer sudah diterima. Tim kami akan memverifikasi donasi Anda secepatnya.
          </Text>

          <View className="w-full mt-8 gap-3">
            <Pressable
              onPress={() => router.replace('/(tabs)/history')}
              className="w-full rounded-xl bg-amber-400 py-3 items-center"
            >
              <Text className="text-emerald-900 font-semibold">Lihat Riwayat</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              className="w-full rounded-xl border border-white/20 py-3 items-center"
            >
              <Text className="text-foreground font-semibold">Kembali ke Beranda</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-900" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      {ToastComponent}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="px-4 pt-2 pb-4 border-b border-white/10">
          <View className="flex-row items-center">
            <Pressable
              onPress={handleBackToHome}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 items-center justify-center"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
            </Pressable>
            <View className="ml-3 flex-1">
              <Text className="text-white text-lg font-poppins-bold">Alur Donasi Bertahap</Text>
              <Text className="text-emerald-100 text-xs font-poppins">
                Langkah {currentStepIndex + 1} dari {flowSteps.length}: {STEP_LABELS[currentStep]}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 mt-3">
            {flowSteps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isPassed = index < currentStepIndex;
              return (
                <View
                  key={step}
                  className={cn(
                    'flex-1 h-2 rounded-full',
                    isActive ? 'bg-amber-400' : isPassed ? 'bg-emerald-400/70' : 'bg-white/15'
                  )}
                />
              );
            })}
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'zakatCalculator' && renderZakatCalculatorStep()}
          {currentStep === 'amount' && renderAmountStep()}
          {currentStep === 'method' && renderMethodStep()}
          {currentStep === 'donor' && renderDonorStep()}
          {currentStep === 'proof' && renderProofStep()}
          {currentStep === 'review' && renderReviewStep()}

          {formError ? (
            <Text className="text-amber-300 text-xs mt-4">{formError}</Text>
          ) : null}
        </ScrollView>

        <View className="px-4 pb-6 pt-3 border-t border-white/10 bg-emerald-900/95">
          {currentStep === 'review' ? (
            <Pressable
              onPress={handleSubmitDonation}
              disabled={donationMutation.isPending}
              className={cn(
                'w-full rounded-xl bg-amber-400 py-3 items-center',
                donationMutation.isPending && 'opacity-60'
              )}
            >
              {donationMutation.isPending ? (
                <ActivityIndicator size="small" color="#064e3b" />
              ) : (
                <Text className="text-emerald-900 font-semibold">Kirim Donasi</Text>
              )}
            </Pressable>
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleBackStep}
                disabled={!canGoPreviousStep}
                className={cn(
                  'flex-1 rounded-xl border border-white/20 py-3 items-center',
                  !canGoPreviousStep && 'opacity-50'
                )}
              >
                <Text className="text-foreground font-semibold">Kembali</Text>
              </Pressable>
              <Pressable
                onPress={handleNextStep}
                disabled={!canGoNextByStep[currentStep]}
                className={cn(
                  'flex-1 rounded-xl bg-amber-400 py-3 items-center',
                  !canGoNextByStep[currentStep] && 'opacity-50'
                )}
              >
                <Text className="text-emerald-900 font-semibold">{nextButtonLabel}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
