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
  type: 'bank' | 'qris';
  accountNumber?: string;
  accountHolder?: string;
  logoUrl?: string;
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
  category: 'zakat' | 'infak';
  paymentType: 'maal' | 'fitrah' | 'profesi' | 'jariyah' | 'kemanusiaan' | 'umum';
  amount: number;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  proofUrl?: string;
  bank?: 'bsi' | 'mandiri' | 'bni';
  status: 'pending' | 'verified' | 'rejected' | 'completed';
  createdAt: string;
  __backendId?: string;
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
export type PaymentCategory = 'zakat' | 'infak';
