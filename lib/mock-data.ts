import { 
  PaymentMethod, 
  MemberPrayer, 
  Video, 
  Article
} from '../types';

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_qris',
    name: 'QRIS',
    type: 'qris',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png',
    isActive: true,
  },
  {
    id: 'pm_bsi',
    name: 'Bank Syariah Indonesia',
    type: 'bank',
    accountNumber: '0000000000',
    accountHolder: 'Yayasan Baitul Maal',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg',
    isActive: true,
  },
  {
    id: 'pm_mandiri',
    name: 'Bank Mandiri',
    type: 'bank',
    accountNumber: '0000000000000',
    accountHolder: 'Yayasan Baitul Maal',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
    isActive: true,
  }
];

export const MOCK_MEMBER_PRAYERS: MemberPrayer[] = [
  {
    id: 'prayer_1',
    user: {
      id: 'user_1',
      name: 'Abdullah',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abdullah'
    },
    content: 'Ya Allah, berikanlah kesembuhan untuk ibu saya yang sedang sakit.',
    isAnonymous: false,
    likesCount: 15,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'prayer_2',
    user: {
      id: 'user_2',
      name: 'Hamba Allah',
    },
    content: 'Semoga Allah mudahkan urusan pekerjaan saya hari ini.',
    isAnonymous: true,
    likesCount: 8,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'prayer_3',
    user: {
      id: 'user_3',
      name: 'Fatimah',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatimah'
    },
    content: 'Mohon doanya agar anak saya lulus ujian tahfidz juz 30.',
    isAnonymous: false,
    likesCount: 24,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'prayer_4',
    user: {
      id: 'user_4',
      name: 'Ahmad',
    },
    content: 'Ya Rabb, lancarkanlah rezeki kami sekeluarga dan jauhkan dari riba.',
    isAnonymous: false,
    likesCount: 42,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'prayer_5',
    user: {
      id: 'user_5',
      name: 'Siti',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti'
    },
    content: 'Semoga Baitul Maal ini semakin berkah dan bermanfaat bagi umat.',
    isAnonymous: false,
    likesCount: 100,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  }
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'vid_1',
    title: 'Keutamaan Sedekah di Waktu Subuh',
    youtubeId: 'MOCK_VIDEO_01',
    description: 'Penjelasan mendalam tentang mengapa sedekah subuh memiliki keistimewaan tersendiri.',
    thumbnailUrl: 'https://img.youtube.com/vi/MOCK_VIDEO_01/maxresdefault.jpg',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'vid_2',
    title: 'Kisah Inspiratif: Berbagi Tak Pernah Rugi',
    youtubeId: 'ScMzIvxBSi4',
    description: 'Kisah nyata seorang pedagang yang rutinitas sedekahnya mengubah hidupnya.',
    thumbnailUrl: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'vid_3',
    title: 'Tutorial Zakat Maal',
    youtubeId: 'jNQXAC9IVRw',
    description: 'Panduan lengkap cara menghitung dan membayar zakat maal dengan benar.',
    thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art_1',
    title: 'Laporan Penyaluran Zakat Bulan Ramadhan',
    slug: 'laporan-penyaluran-zakat-ramadhan',
    content: '<p>Alhamdulillah, pada bulan Ramadhan tahun ini, Baitul Maal telah menyalurkan paket sembako kepada 500 kaum dhuafa di wilayah Jabodetabek...</p>',
    thumbnailUrl: 'https://picsum.photos/seed/zakat/800/400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    excerpt: 'Laporan lengkap kegiatan penyaluran zakat fitrah dan maal selama bulan suci Ramadhan 1445H.',
  },
  {
    id: 'art_2',
    title: 'Membangun Generasi Qurani Sejak Dini',
    slug: 'membangun-generasi-qurani',
    content: '<p>Pendidikan Al-Quran merupakan fondasi utama dalam membentuk karakter anak. Melalui program Tahfidz Cilik...</p>',
    thumbnailUrl: 'https://picsum.photos/seed/quran/800/400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    excerpt: 'Tips dan trik mendidik anak agar mencintai Al-Quran sejak usia dini.',
  },
  {
    id: 'art_3',
    title: 'Program Wakaf Sumur: Air untuk Kehidupan',
    slug: 'program-wakaf-sumur',
    content: '<p>Krisis air bersih masih melanda beberapa desa binaan kami. Mari berpartisipasi dalam program wakaf sumur...</p>',
    thumbnailUrl: 'https://picsum.photos/seed/water/800/400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    excerpt: 'Ajak partisipasi dalam program pengadaan air bersih untuk desa terpencil.',
  }
];
