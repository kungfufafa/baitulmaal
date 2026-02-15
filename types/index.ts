export interface Config {
  org_name: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
  text_color: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'qris' | 'ewallet';
  accountNumber?: string;
  accountHolder?: string;
  logoUrl?: string;
  qrisStaticPayload?: string;
  isActive: boolean;
}

export interface MemberPrayer {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  isAnonymous: boolean;
  likesCount: number;
  status: 'published' | 'hidden';
  createdAt: string;
}

export interface PrayerSupport {
  id: string;
  userId: string;
  memberPrayerId: string;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string;
  publishedAt: string;
  excerpt?: string;
}

export interface Donation {
  id: string;
  type: 'donation';
  category: 'zakat' | 'infak' | 'sedekah';
  paymentType: 'maal' | 'fitrah' | 'profesi' | 'jariyah' | 'kemanusiaan' | 'umum';
  amount: number;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  paymentMethodName?: string;
  qrisPayload?: string;
  proofUrl?: string;
  proofImageUrl?: string;
  proofImageUri?: string;
  proofImageFileName?: string;
  proofImageMimeType?: string;
  bank?: 'bsi' | 'mandiri' | 'bni';
  status: 'pending' | 'verified' | 'rejected' | 'completed' | 'confirmed';
  guestToken?: string;
  donorName?: string;
  donorPhone?: string;
  donorEmail?: string;
  isGuest?: boolean;
  contextSlug?: string;
  contextLabel?: string;
  intentionNote?: string;
  calculatorType?: ZakatCalculatorType;
  calculatorBreakdown?: Record<string, unknown>;
  createdAt: string;
  __backendId?: string;
}

export interface DonationContextOption {
  slug: string;
  label: string;
  description?: string;
}

export interface DonationPaymentTypeOption {
  key: PaymentType;
  label: string;
}

export interface DonationCategoryOption {
  key: PaymentCategory;
  label: string;
  paymentTypes: DonationPaymentTypeOption[];
}

export interface DonationConfig {
  categories: DonationCategoryOption[];
  contexts: Partial<Record<PaymentCategory, DonationContextOption[]>>;
  zakat: {
    calculatorTypes: Array<{ key: ZakatCalculatorType; label: string }>;
    defaults: {
      fitrahRiceKgPerPerson: number;
      maalNisabGoldGrams: number;
      profesiNisabGoldGrams: number;
    };
  };
  recommendedAmounts: number[];
}

export type ZakatCalculatorType = 'fitrah' | 'maal' | 'profesi';

export interface ZakatCalculationPayload {
  type: ZakatCalculatorType;
  peopleCount?: number;
  ricePricePerKg?: number;
  totalAssets?: number;
  shortTermDebt?: number;
  goldPricePerGram?: number;
  goldGramsNisab?: number;
  haulPassed?: boolean;
  monthlyIncome?: number;
  monthlyNeeds?: number;
  periodMonths?: number;
}

export interface ZakatCalculationResult {
  type: ZakatCalculatorType;
  recommendedAmount: number;
  isObligatory: boolean;
  summary: string;
  breakdown: Record<string, unknown>;
}

export interface QuranProgress {
  surah: number;
  ayat: number;
}

export interface Surah {
  no: number;
  name: string;
  ayat: number;
  juz: number;
}

export interface DoaItem {
  arabic: string;
  latin: string;
  arti: string;
  title?: string;
  tags?: string[];
}

export interface Doa {
  title: string;
  items: DoaItem[];
}

export interface PrayerTime {
  name: string;
  time: string;
  hour: number;
  minute: number;
}

export interface Slide {
  label: string;
  content: string;
  source: string;
}

export type DoaType = 'pagi' | 'petang' | 'tidur' | 'makan';
export type BankType = 'bsi' | 'mandiri' | 'bni';
export type PaymentType = 'maal' | 'fitrah' | 'profesi' | 'jariyah' | 'kemanusiaan' | 'umum';
export type PaymentCategory = 'zakat' | 'infak' | 'sedekah';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
}
