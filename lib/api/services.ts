import { randomUUID } from 'expo-crypto';
import apiClient from './client';
import { API_HOST } from './config';
import {
  PaymentMethod,
  MemberPrayer,
  Video,
  Article,
  Donation,
  DonationConfig,
  DonationContextOption,
  PaymentCategory,
  PaymentType,
  ZakatCalculationPayload,
  ZakatCalculationResult,
} from '../../types';

type ApiCollectionResponse<T> = {
  data?: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
  };
} | T[];

type ApiResourceResponse<T> = {
  data?: T;
} | T;

type BackendPaymentMethod = {
  id: string | number;
  name: string;
  type?: string | null;
  account_number?: string | null;
  accountNumber?: string | null;
  account_holder?: string | null;
  accountHolder?: string | null;
  logo_url?: string | null;
  logoUrl?: string | null;
  qris_static_payload?: string | null;
  qrisStaticPayload?: string | null;
  is_active?: boolean;
  isActive?: boolean;
};

type BackendPrayerUser = {
  id?: string | number;
  name?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
};

type BackendMemberPrayer = {
  id: string | number;
  content: string;
  user?: BackendPrayerUser | null;
  user_name?: string;
  status?: string;
  isAnonymous?: boolean;
  is_anonymous?: boolean;
  likesCount?: number;
  likes_count?: number;
  createdAt?: string;
  created_at?: string;
};

type BackendAmenResponse = {
  success?: boolean;
  liked?: boolean;
  likesCount?: number;
  likes_count?: number;
};

type BackendVideo = {
  id: string | number;
  title: string;
  youtubeId?: string;
  youtube_id?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  publishedAt?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

type BackendArticle = {
  id: string | number;
  title: string;
  slug?: string | null;
  content?: string | null;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  publishedAt?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

type BackendDonation = {
  id?: string | number;
  donation_id?: string | number;
  amount?: number | string;
  category?: string;
  payment_type?: string;
  payment_method_id?: string | number;
  payment_method_name?: string | null;
  qris_payload?: string | null;
  proof_image_url?: string | null;
  guest_token?: string | null;
  donor_name?: string | null;
  donor_phone?: string | null;
  donor_email?: string | null;
  is_guest?: boolean;
  status?: string;
  context_slug?: string | null;
  context_label?: string | null;
  intention_note?: string | null;
  calculator_type?: string | null;
  calculator_breakdown?: Record<string, unknown> | null;
  created_at?: string;
};

type BackendDonationConfigCategory = {
  key?: string;
  label?: string;
  payment_types?: Array<{
    key?: string;
    label?: string;
  }>;
};

type BackendDonationConfig = {
  categories?: BackendDonationConfigCategory[];
  contexts?: Record<string, Array<{
    slug?: string;
    label?: string;
    description?: string;
  }>>;
  zakat?: {
    calculator_types?: Array<{ key?: string; label?: string }>;
    defaults?: {
      fitrah_rice_kg_per_person?: number;
      maal_nisab_gold_grams?: number;
      profesi_nisab_gold_grams?: number;
    };
  };
  recommended_amounts?: number[];
};

type BackendZakatCalculationResult = {
  type?: string;
  recommended_amount?: number | string;
  is_obligatory?: boolean;
  summary?: string;
  breakdown?: Record<string, unknown> | null;
};

const unwrapCollection = <T>(payload: ApiCollectionResponse<T> | null | undefined): T[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload.data) ? payload.data : [];
};

const resolvePaginationMeta = (
  payload: ApiCollectionResponse<unknown> | null | undefined
): { currentPage: number; lastPage: number } | null => {
  if (!payload || Array.isArray(payload)) {
    return null;
  }

  const currentPage = Number(payload.meta?.current_page ?? 1);
  const lastPage = Number(payload.meta?.last_page ?? 1);

  if (!Number.isFinite(currentPage) || !Number.isFinite(lastPage)) {
    return null;
  }

  return {
    currentPage: Math.max(1, currentPage),
    lastPage: Math.max(1, lastPage),
  };
};

const fetchAllPages = async <T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T[]> => {
  const firstResponse = await apiClient.get<ApiCollectionResponse<T>>(path, { params });
  const firstPayload = firstResponse.data;
  const firstItems = unwrapCollection(firstPayload);
  const pagination = resolvePaginationMeta(firstPayload);

  if (!pagination || pagination.lastPage <= pagination.currentPage) {
    return firstItems;
  }

  const allItems = [...firstItems];
  for (let page = pagination.currentPage + 1; page <= pagination.lastPage; page += 1) {
    const response = await apiClient.get<ApiCollectionResponse<T>>(path, {
      params: {
        ...params,
        page,
      },
    });

    allItems.push(...unwrapCollection(response.data));
  }

  return allItems;
};

const unwrapResource = <T>(payload: ApiResourceResponse<T> | null | undefined): T | null => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return null;
  }

  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return payload.data ?? null;
  }

  return payload as T;
};

const normalizePaymentMethodType = (value?: string | null): PaymentMethod['type'] => {
  const normalized = (value || '').toLowerCase();
  if (normalized.includes('qris')) {
    return 'qris';
  }

  if (normalized.includes('wallet')) {
    return 'ewallet';
  }

  return 'bank';
};

const mapPaymentMethod = (item: BackendPaymentMethod): PaymentMethod => ({
  id: String(item.id),
  name: item.name,
  type: normalizePaymentMethodType(item.type),
  accountNumber: item.accountNumber ?? item.account_number ?? undefined,
  accountHolder: item.accountHolder ?? item.account_holder ?? undefined,
  logoUrl: item.logoUrl ?? item.logo_url ?? undefined,
  qrisStaticPayload: item.qrisStaticPayload ?? item.qris_static_payload ?? undefined,
  isActive: item.isActive ?? item.is_active ?? true,
});

const encodePath = (value: string) => value.split('/').map(encodeURIComponent).join('/');

const toAbsoluteMediaUrl = (value?: string | null): string => {
  const raw = (value ?? '').trim();

  if (!raw) {
    return '';
  }

  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) {
    return raw;
  }

  const normalized = raw.replace(/^\/+/, '');

  if (normalized.startsWith('api/')) {
    return `${API_HOST}/${normalized}`;
  }

  if (normalized.startsWith('storage/')) {
    return `${API_HOST}/${normalized}`;
  }

  return `${API_HOST}/api/media/${encodePath(normalized)}`;
};

const mapMemberPrayer = (item: BackendMemberPrayer): MemberPrayer => {
  const isAnonymous = item.isAnonymous ?? item.is_anonymous ?? false;
  const userName = isAnonymous
    ? 'Hamba Allah'
    : item.user?.name ?? item.user_name ?? 'Hamba Allah';

  return {
    id: String(item.id),
    user: {
      id: String(item.user?.id ?? item.id),
      name: userName,
      avatarUrl: toAbsoluteMediaUrl(item.user?.avatarUrl ?? item.user?.avatar_url ?? '') || undefined,
    },
    content: item.content,
    isAnonymous,
    likesCount: Number(item.likesCount ?? item.likes_count ?? 0),
    status: item.status === 'hidden' ? 'hidden' : 'published',
    createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
  };
};

const extractYouTubeId = (value?: string | null): string => {
  const raw = (value ?? '').trim();
  if (!raw) {
    return '';
  }

  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      const candidate = parsed.pathname.replace(/^\/+/, '').split('/')[0] ?? '';
      if (/^[A-Za-z0-9_-]{11}$/.test(candidate)) {
        return candidate;
      }
    }

    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const fromQuery = parsed.searchParams.get('v');
      if (fromQuery && /^[A-Za-z0-9_-]{11}$/.test(fromQuery)) {
        return fromQuery;
      }

      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(segments[0])) {
        const candidate = segments[1];
        if (/^[A-Za-z0-9_-]{11}$/.test(candidate)) {
          return candidate;
        }
      }
    }
  } catch {
    // Continue to regex fallback below.
  }

  const fallback = raw.match(/(?:v=|\/)([A-Za-z0-9_-]{11})(?:[?&/#]|$)/);
  return fallback?.[1] ?? '';
};

const mapVideo = (item: BackendVideo): Video => {
  const youtubeId = extractYouTubeId(item.youtubeId ?? item.youtube_id ?? '');
  const thumbnailUrl = toAbsoluteMediaUrl(item.thumbnailUrl ?? item.thumbnail ?? '');

  return {
    id: String(item.id),
    title: item.title,
    youtubeId,
    description: item.description ?? '',
    thumbnailUrl: thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : ''),
    publishedAt: item.publishedAt ?? item.published_at ?? item.created_at ?? new Date().toISOString(),
  };
};

const mapArticle = (item: BackendArticle): Article => ({
  id: String(item.id),
  title: item.title,
  slug: (item.slug || '').trim() || `article-${String(item.id)}`,
  content: item.content ?? '',
  thumbnailUrl: toAbsoluteMediaUrl(item.thumbnailUrl ?? item.thumbnail ?? ''),
  publishedAt: item.publishedAt ?? item.published_at ?? item.created_at ?? new Date().toISOString(),
  excerpt: item.excerpt ?? undefined,
});

const normalizePaymentType = (value?: string, fallback: PaymentType = 'umum'): PaymentType => {
  if (value === 'maal' || value === 'fitrah' || value === 'profesi' || value === 'jariyah' || value === 'kemanusiaan' || value === 'umum') {
    return value;
  }

  return fallback;
};

const normalizeCalculatorType = (value?: string | null): ZakatCalculationResult['type'] | undefined => {
  if (value === 'fitrah' || value === 'maal' || value === 'profesi') {
    return value;
  }

  return undefined;
};

const mapDonationContexts = (contexts?: BackendDonationConfig['contexts']): DonationConfig['contexts'] => {
  if (!contexts || typeof contexts !== 'object') {
    return {};
  }

  const mappedContexts: DonationConfig['contexts'] = {};

  Object.entries(contexts).forEach(([category, options]) => {
    if (category !== 'infak' && category !== 'sedekah' && category !== 'zakat') {
      return;
    }

    const normalizedOptions: DonationContextOption[] = (options ?? [])
      .map((option) => ({
        slug: String(option.slug ?? '').trim(),
        label: String(option.label ?? '').trim(),
        description: option.description ?? undefined,
      }))
      .filter((option) => option.slug.length > 0 && option.label.length > 0);

    mappedContexts[category as PaymentCategory] = normalizedOptions;
  });

  return mappedContexts;
};

const mapDonationConfig = (payload: BackendDonationConfig): DonationConfig => {
  const categories = (payload.categories ?? [])
    .map((category) => {
      const key = category.key === 'zakat' || category.key === 'infak' || category.key === 'sedekah'
        ? category.key
        : null;

      if (!key) {
        return null;
      }

      const paymentTypes = (category.payment_types ?? [])
        .map((paymentTypeOption) => {
          const paymentTypeKey = normalizePaymentType(paymentTypeOption.key);

          return {
            key: paymentTypeKey,
            label: String(paymentTypeOption.label ?? paymentTypeKey).trim(),
          };
        });

      return {
        key,
        label: String(category.label ?? key).trim(),
        paymentTypes,
      };
    })
    .filter((item): item is DonationConfig['categories'][number] => item !== null);

  const calculatorTypes = (payload.zakat?.calculator_types ?? [])
    .map((item) => {
      const key = normalizeCalculatorType(item.key);
      if (!key) {
        return null;
      }

      return {
        key,
        label: String(item.label ?? key).trim(),
      };
    })
    .filter((item): item is DonationConfig['zakat']['calculatorTypes'][number] => item !== null);

  return {
    categories,
    contexts: mapDonationContexts(payload.contexts),
    zakat: {
      calculatorTypes,
      defaults: {
        fitrahRiceKgPerPerson: Number(payload.zakat?.defaults?.fitrah_rice_kg_per_person ?? 2.5),
        maalNisabGoldGrams: Number(payload.zakat?.defaults?.maal_nisab_gold_grams ?? 85),
        profesiNisabGoldGrams: Number(payload.zakat?.defaults?.profesi_nisab_gold_grams ?? 85),
      },
    },
    recommendedAmounts: Array.isArray(payload.recommended_amounts)
      ? payload.recommended_amounts.map((amount) => Number(amount)).filter((amount) => Number.isFinite(amount) && amount > 0)
      : [],
  };
};

const mapZakatCalculationResult = (payload: BackendZakatCalculationResult): ZakatCalculationResult => {
  const type = normalizeCalculatorType(payload.type) ?? 'maal';

  return {
    type,
    recommendedAmount: Number(payload.recommended_amount ?? 0),
    isObligatory: Boolean(payload.is_obligatory),
    summary: String(payload.summary ?? ''),
    breakdown: payload.breakdown ?? {},
  };
};

const normalizeDonationStatus = (value?: string): Donation['status'] => {
  if (value === 'confirmed') {
    return 'confirmed';
  }

  if (value === 'verified') {
    return 'verified';
  }

  if (value === 'rejected') {
    return 'rejected';
  }

  if (value === 'completed') {
    return 'completed';
  }

  return 'pending';
};

const normalizeDonationCategory = (
  value?: string,
  fallbackCategory: Donation['category'] = 'infak',
): Donation['category'] => {
  const normalized = (value ?? '').trim().toLowerCase();

  if (normalized === 'zakat' || normalized === 'infak' || normalized === 'sedekah') {
    return normalized;
  }

  if (
    normalized === 'sodaqoh'
    || normalized === 'sodakoh'
    || normalized === 'shodaqoh'
    || normalized === 'shodaqah'
    || normalized === 'shadaqah'
  ) {
    return 'sedekah';
  }

  return fallbackCategory;
};

const mapDonation = (item: BackendDonation, fallback: Partial<Donation> = {}): Donation => {
  const backendId = item.id ?? item.donation_id;
  const category = normalizeDonationCategory(item.category, fallback.category ?? 'infak');
  const paymentTypeRaw = item.payment_type;
  const paymentType = normalizePaymentType(
    paymentTypeRaw,
    fallback.paymentType ?? (category === 'zakat' ? 'maal' : category === 'sedekah' ? 'jariyah' : 'umum'),
  );
  const paymentMethodId = item.payment_method_id ?? fallback.paymentMethodId ?? '';

  return {
    id: backendId ? String(backendId) : randomUUID(),
    type: 'donation',
    category,
    paymentType,
    amount: Number(item.amount ?? fallback.amount ?? 0),
    paymentMethodId: String(paymentMethodId),
    paymentMethod: fallback.paymentMethod,
    paymentMethodName: item.payment_method_name ?? fallback.paymentMethod?.name,
    qrisPayload: item.qris_payload ?? fallback.qrisPayload,
    proofUrl: fallback.proofUrl,
    proofImageUrl: item.proof_image_url ?? undefined,
    bank: fallback.bank,
    status: normalizeDonationStatus(item.status),
    guestToken: item.guest_token ?? fallback.guestToken,
    donorName: item.donor_name ?? fallback.donorName,
    donorPhone: item.donor_phone ?? fallback.donorPhone,
    donorEmail: item.donor_email ?? fallback.donorEmail,
    isGuest: item.is_guest ?? fallback.isGuest,
    contextSlug: item.context_slug ?? fallback.contextSlug,
    contextLabel: item.context_label ?? fallback.contextLabel,
    intentionNote: item.intention_note ?? fallback.intentionNote,
    calculatorType: normalizeCalculatorType(item.calculator_type) ?? fallback.calculatorType,
    calculatorBreakdown: item.calculator_breakdown ?? fallback.calculatorBreakdown,
    createdAt: item.created_at ?? fallback.createdAt ?? new Date().toISOString(),
    __backendId: backendId ? String(backendId) : fallback.__backendId,
  };
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get<ApiCollectionResponse<BackendPaymentMethod>>('/payment-methods');
  return unwrapCollection(response.data).map(mapPaymentMethod);
};

export const fetchDonationConfig = async (): Promise<DonationConfig> => {
  const response = await apiClient.get<BackendDonationConfig>('/donation-config');
  return mapDonationConfig(response.data ?? {});
};

export const calculateZakat = async (payload: ZakatCalculationPayload): Promise<ZakatCalculationResult> => {
  const response = await apiClient.post<BackendZakatCalculationResult>('/zakat/calculate', {
    type: payload.type,
    people_count: payload.peopleCount,
    rice_price_per_kg: payload.ricePricePerKg,
    total_assets: payload.totalAssets,
    short_term_debt: payload.shortTermDebt,
    gold_price_per_gram: payload.goldPricePerGram,
    gold_grams_nisab: payload.goldGramsNisab,
    haul_passed: payload.haulPassed,
    monthly_income: payload.monthlyIncome,
    monthly_needs: payload.monthlyNeeds,
    period_months: payload.periodMonths,
  });

  return mapZakatCalculationResult(response.data ?? {});
};

export const fetchMemberPrayers = async (page = 1): Promise<MemberPrayer[]> => {
  const response = await apiClient.get<ApiCollectionResponse<BackendMemberPrayer>>('/prayers', {
    params: { page },
  });
  return unwrapCollection(response.data).map(mapMemberPrayer);
};

export const postMemberPrayer = async (content: string, isAnonymous: boolean): Promise<MemberPrayer> => {
  const response = await apiClient.post<ApiResourceResponse<BackendMemberPrayer>>('/prayers', {
    content,
    is_anonymous: isAnonymous,
  });
  const prayer = unwrapResource(response.data);

  if (!prayer) {
    throw new Error('Invalid prayer response');
  }

  return mapMemberPrayer(prayer);
};

export const toggleAmen = async (prayerId: string): Promise<{ success: boolean; likesCount: number }> => {
  const response = await apiClient.post<BackendAmenResponse>(`/prayers/${encodeURIComponent(prayerId)}/amen`);
  return {
    success: response.data.success ?? true,
    likesCount: Number(response.data.likesCount ?? response.data.likes_count ?? 0),
  };
};

export const fetchVideos = async (): Promise<Video[]> => {
  const videos = await fetchAllPages<BackendVideo>('/videos');
  return videos.map(mapVideo);
};

export const fetchArticles = async (): Promise<Article[]> => {
  const articles = await fetchAllPages<BackendArticle>('/articles');
  return articles.map(mapArticle);
};

export const fetchArticleBySlug = async (slug: string): Promise<Article> => {
  const response = await apiClient.get<ApiResourceResponse<BackendArticle>>(`/articles/${encodeURIComponent(slug)}`);
  const article = unwrapResource(response.data);

  if (!article) {
    throw new Error('Invalid article response');
  }

  return mapArticle(article);
};

export const submitDonation = async (data: Partial<Donation>): Promise<Donation> => {
  const paymentMethodId = data.paymentMethodId ?? data.paymentMethod?.id ?? '';
  const payload = {
    amount: data.amount,
    payment_method_id: paymentMethodId,
    category: data.category,
    payment_type: data.paymentType,
    context_slug: data.contextSlug,
    context_label: data.contextLabel,
    intention_note: data.intentionNote,
    calculator_type: data.calculatorType,
    calculator_breakdown: data.calculatorBreakdown,
    guest_token: data.guestToken,
    donor_name: data.donorName,
    donor_phone: data.donorPhone,
    donor_email: data.donorEmail,
  };

  const hasProofImage = Boolean(data.proofImageUri);
  const response = hasProofImage
    ? await (() => {
      const formData = new FormData();
      const appendField = (key: string, value: unknown) => {
        if (value === undefined || value === null || value === '') {
          return;
        }

        formData.append(key, String(value));
      };

      appendField('amount', payload.amount);
      appendField('payment_method_id', payload.payment_method_id);
      appendField('category', payload.category);
      appendField('payment_type', payload.payment_type);
      appendField('context_slug', payload.context_slug);
      appendField('context_label', payload.context_label);
      appendField('intention_note', payload.intention_note);
      appendField('calculator_type', payload.calculator_type);
      appendField('guest_token', payload.guest_token);
      appendField('donor_name', payload.donor_name);
      appendField('donor_phone', payload.donor_phone);
      appendField('donor_email', payload.donor_email);

      if (payload.calculator_breakdown && typeof payload.calculator_breakdown === 'object') {
        Object.entries(payload.calculator_breakdown).forEach(([key, value]) => {
          if (value === undefined || value === null) {
            return;
          }

          const targetKey = `calculator_breakdown[${key}]`;
          formData.append(targetKey, typeof value === 'object' ? JSON.stringify(value) : String(value));
        });
      }

      formData.append('proof_image', {
        uri: data.proofImageUri!,
        name: data.proofImageFileName || `proof-${Date.now()}.jpg`,
        type: data.proofImageMimeType || 'image/jpeg',
      } as any);

      return apiClient.post<ApiResourceResponse<BackendDonation>>('/donations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    })()
    : await apiClient.post<ApiResourceResponse<BackendDonation>>('/donations', payload);
  const donation = unwrapResource(response.data);

  if (!donation) {
    throw new Error('Server returned empty donation response');
  }

  return mapDonation(donation, {
    category: data.category,
    paymentType: data.paymentType,
    amount: data.amount,
    paymentMethodId: String(paymentMethodId),
    paymentMethod: data.paymentMethod,
    proofUrl: data.proofUrl,
    bank: data.bank,
    guestToken: data.guestToken,
    donorName: data.donorName,
    donorPhone: data.donorPhone,
    donorEmail: data.donorEmail,
    isGuest: data.isGuest,
    contextSlug: data.contextSlug,
    contextLabel: data.contextLabel,
    intentionNote: data.intentionNote,
    calculatorType: data.calculatorType,
    calculatorBreakdown: data.calculatorBreakdown,
  });
};

export const fetchDonationHistory = async (guestToken?: string): Promise<Donation[]> => {
  const donations = await fetchAllPages<BackendDonation>(
    '/donations/history',
    guestToken ? { guest_token: guestToken } : undefined,
  );

  return donations.map((item) => mapDonation(item));
};
