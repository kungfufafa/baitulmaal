import { Config, Surah, Doa, Slide, PrayerTime } from '@/types';

export const defaultConfig: Config = {
  org_name: 'LAZ Al Azhar 5',
  tagline: 'Amanah dalam Berbagi',
  primary_color: '#064e3b',
  secondary_color: '#d4af37',
  text_color: '#ffffff',
};

export const surahList: Surah[] = [
  { no: 1, name: 'Al-Fatihah', ayat: 7, juz: 1 },
  { no: 2, name: 'Al-Baqarah', ayat: 286, juz: 1 },
  { no: 3, name: 'Ali Imran', ayat: 200, juz: 3 },
  { no: 4, name: 'An-Nisa', ayat: 176, juz: 4 },
  { no: 5, name: 'Al-Maidah', ayat: 120, juz: 6 },
  { no: 6, name: 'Al-An\'am', ayat: 165, juz: 7 },
  { no: 7, name: 'Al-A\'raf', ayat: 206, juz: 8 },
  { no: 8, name: 'Al-Anfal', ayat: 75, juz: 9 },
  { no: 9, name: 'At-Taubah', ayat: 129, juz: 10 },
  { no: 10, name: 'Yunus', ayat: 109, juz: 11 },
  { no: 11, name: 'Hud', ayat: 123, juz: 11 },
  { no: 12, name: 'Yusuf', ayat: 111, juz: 12 },
  { no: 13, name: 'Ar-Ra\'d', ayat: 43, juz: 13 },
  { no: 14, name: 'Ibrahim', ayat: 52, juz: 13 },
  { no: 15, name: 'Al-Hijr', ayat: 99, juz: 14 },
  { no: 16, name: 'An-Nahl', ayat: 128, juz: 14 },
  { no: 17, name: 'Al-Isra', ayat: 111, juz: 15 },
  { no: 18, name: 'Al-Kahf', ayat: 110, juz: 15 },
  { no: 19, name: 'Maryam', ayat: 98, juz: 16 },
  { no: 20, name: 'Ta-Ha', ayat: 135, juz: 16 },
  { no: 21, name: 'Al-Anbiya', ayat: 112, juz: 17 },
  { no: 22, name: 'Al-Hajj', ayat: 78, juz: 17 },
  { no: 23, name: 'Al-Mu\'minun', ayat: 118, juz: 18 },
  { no: 24, name: 'An-Nur', ayat: 64, juz: 18 },
  { no: 25, name: 'Al-Furqan', ayat: 77, juz: 18 },
  { no: 26, name: 'Asy-Syu\'ara', ayat: 227, juz: 19 },
  { no: 27, name: 'An-Naml', ayat: 93, juz: 19 },
  { no: 28, name: 'Al-Qasas', ayat: 88, juz: 20 },
  { no: 29, name: 'Al-Ankabut', ayat: 69, juz: 20 },
  { no: 30, name: 'Ar-Rum', ayat: 60, juz: 21 },
  { no: 36, name: 'Ya-Sin', ayat: 83, juz: 22 },
  { no: 55, name: 'Ar-Rahman', ayat: 78, juz: 27 },
  { no: 56, name: 'Al-Waqi\'ah', ayat: 96, juz: 27 },
  { no: 67, name: 'Al-Mulk', ayat: 30, juz: 29 },
  { no: 78, name: 'An-Naba', ayat: 40, juz: 30 },
  { no: 112, name: 'Al-Ikhlas', ayat: 4, juz: 30 },
  { no: 113, name: 'Al-Falaq', ayat: 5, juz: 30 },
  { no: 114, name: 'An-Nas', ayat: 6, juz: 30 },
];

export const doaCollection: Record<string, Doa> = {
  pagi: {
    title: '🌅 Doa Pagi Hari',
    items: [
      {
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
        latin: 'Ashbahnaa wa ashbahal mulku lillaah',
        arti: 'Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah',
      },
      {
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
        latin: 'Allahumma bika ashbahnaa wa bika amsainaa wa bika nahyaa wa bika namuutu wa ilaikan nusyuur',
        arti: 'Ya Allah, dengan rahmat-Mu kami memasuki waktu pagi dan petang, dengan kehendak-Mu kami hidup dan mati, dan kepada-Mu kami akan kembali',
      },
    ],
  },
  petang: {
    title: '🌆 Doa Petang Hari',
    items: [
      {
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',
        latin: 'Amsainaa wa amsal mulku lillaah',
        arti: 'Kami telah memasuki waktu petang dan kerajaan hanya milik Allah',
      },
      {
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ',
        latin: 'Allahumma inni as-aluka khaira haadzihil lailah',
        arti: 'Ya Allah, aku memohon kebaikan malam ini',
      },
    ],
  },
  tidur: {
    title: '🌙 Doa Sebelum Tidur',
    items: [
      {
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        latin: 'Bismikallaahumma amuutu wa ahyaa',
        arti: 'Dengan nama-Mu ya Allah aku mati dan hidup',
      },
      {
        arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        latin: 'Allaahumma qinii \'adzaabaka yauma tab\'atsu \'ibaadaka',
        arti: 'Ya Allah, lindungilah aku dari azab-Mu pada hari Engkau membangkitkan hamba-hamba-Mu',
      },
    ],
  },
  makan: {
    title: '🍽️ Doa Makan',
    items: [
      {
        arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
        latin: 'Bismillaahi wa \'alaa barakatillaah',
        arti: 'Dengan nama Allah dan dengan berkah Allah',
      },
      {
        arabic: 'اَلْحَمْدُ لِلَّهِ الَّذِى أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
        latin: 'Alhamdulillaahilladzi ath\'amanaa wa saqaanaa wa ja\'alanaa muslimiin',
        arti: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami muslim',
      },
    ],
  },
};

export const slides: Slide[] = [
  {
    label: '📖 Hadits Hari Ini',
    content: '"Sedekah tidak akan mengurangi harta."',
    source: '(HR. Muslim)',
  },
  {
    label: '🕌 Info Zakat',
    content: 'Zakat maal wajib bagi harta yang mencapai nisab setara 85 gram emas.',
    source: '',
  },
  {
    label: '💝 Keutamaan Infak',
    content: '"Harta tidak akan berkurang dengan sedekah."',
    source: '(HR. Tirmidzi)',
  },
];

export const prayers: PrayerTime[] = [
  { name: 'Subuh', time: '04:30', hour: 4, minute: 30 },
  { name: 'Dzuhur', time: '12:00', hour: 12, minute: 0 },
  { name: 'Ashar', time: '15:15', hour: 15, minute: 15 },
  { name: 'Maghrib', time: '18:00', hour: 18, minute: 0 },
  { name: 'Isya', time: '19:15', hour: 19, minute: 15 },
];

export const bankLabels: Record<string, string> = {
  bsi: 'BSI',
  mandiri: 'Mandiri Syariah',
  bni: 'BNI Syariah',
};

export const categoryLabels: Record<string, string> = {
  zakat: 'Zakat',
  infak: 'Infak',
  sedekah: 'Sedekah',
};

export const paymentTypeLabels: Record<string, string> = {
  maal: 'Zakat Maal',
  fitrah: 'Zakat Fitrah',
  profesi: 'Zakat Profesi',
  kemanusiaan: 'Infak Kemanusiaan',
  umum: 'Umum',
  jariyah: 'Sedekah Jariyah',
};
