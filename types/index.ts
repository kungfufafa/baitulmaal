export interface Config {
  org_name: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
  text_color: string;
}

export interface Donation {
  type: 'donation';
  category: 'zakat' | 'infak';
  paymentType: 'maal' | 'fitrah' | 'profesi' | 'jariyah' | 'kemanusiaan' | 'umum';
  amount: number;
  bank: 'bsi' | 'mandiri' | 'bni';
  status: 'pending' | 'completed';
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
