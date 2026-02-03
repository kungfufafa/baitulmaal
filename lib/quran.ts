import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SurahSummary {
  number: number;
  name: string;
  latinName: string;
  ayatCount: number;
  meaning?: string;
}

export interface Ayah {
  number: number;
  arabic: string;
  latin: string;
  translation: string;
}

export interface SurahDetail extends SurahSummary {
  ayahs: Ayah[];
}

const QURAN_API_BASE_URL = 'https://equran.id/api';
const LIST_CACHE_KEY = 'quran_surah_list_v2';
const DETAIL_CACHE_PREFIX = 'quran_surah_detail_v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CachePayload<T> = {
  cachedAt: number;
  data: T;
};

const pickString = (...values: unknown[]) =>
  values.find((value) => typeof value === 'string' && value.trim().length > 0) as
    | string
    | undefined;

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const readCache = async <T>(key: string) => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachePayload<T>;
    if (!parsed?.cachedAt) return null;
    const isFresh = Date.now() - parsed.cachedAt <= CACHE_TTL_MS;
    return { data: parsed.data, isFresh };
  } catch {
    return null;
  }
};

const writeCache = async <T>(key: string, data: T) => {
  const payload: CachePayload<T> = { cachedAt: Date.now(), data };
  await AsyncStorage.setItem(key, JSON.stringify(payload));
};

const mapSurahSummary = (raw: any): SurahSummary => ({
  number: toNumber(raw?.nomor ?? raw?.number ?? raw?.surah_number),
  name: pickString(raw?.nama, raw?.name, raw?.namaArab, raw?.arabic_name) ?? '',
  latinName: pickString(
    raw?.namaLatin,
    raw?.latin,
    raw?.nama_latin,
    raw?.name_latin,
    raw?.english_name
  ) ?? '',
  ayatCount: toNumber(
    raw?.jumlah_ayat ?? raw?.jumlahAyat ?? raw?.ayat ?? raw?.numberOfVerses ?? raw?.count_ayat
  ),
  meaning: pickString(raw?.arti, raw?.meaning, raw?.translation),
});

const mapAyah = (raw: any): Ayah => ({
  number: toNumber(raw?.nomorAyat ?? raw?.number ?? raw?.nomor ?? raw?.ayah_number),
  arabic: pickString(
    raw?.teksArab,
    raw?.arab,
    raw?.arabic,
    raw?.ar,
    raw?.text_arab
  ) ?? '',
  latin: pickString(raw?.teksLatin, raw?.latin, raw?.tr, raw?.text_latin) ?? '',
  translation: pickString(
    raw?.teksIndonesia,
    raw?.terjemahan,
    raw?.idn,
    raw?.translation,
    raw?.text_translation
  ) ?? '',
});

const extractArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const fetchSurahList = async (): Promise<SurahSummary[]> => {
  const response = await fetch(`${QURAN_API_BASE_URL}/surat`);
  if (!response.ok) {
    throw new Error(`Failed to fetch surah list (${response.status})`);
  }
  const json = await response.json();
  const data = extractArray(json);
  if (!Array.isArray(data)) return [];
  return data.map(mapSurahSummary).filter((surah) => surah.number > 0);
};

export const loadSurahList = async () => {
  const cached = await readCache<SurahSummary[]>(LIST_CACHE_KEY);
  if (cached?.data?.length && cached.isFresh) {
    return { data: cached.data, source: 'cache' as const };
  }

  try {
    const data = await fetchSurahList();
    await writeCache(LIST_CACHE_KEY, data);
    return { data, source: 'api' as const };
  } catch (error) {
    if (cached?.data?.length) {
      return { data: cached.data, source: 'cache-stale' as const };
    }
    throw error;
  }
};

export const fetchSurahDetail = async (surahNumber: number): Promise<SurahDetail> => {
  const response = await fetch(`${QURAN_API_BASE_URL}/surat/${surahNumber}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch surah detail (${response.status})`);
  }
  const json = await response.json();
  const payload = json?.data ?? json;

  const summary = mapSurahSummary(payload);
  const ayahSource =
    Array.isArray(payload?.ayat)
      ? payload.ayat
      : Array.isArray(payload?.verses)
        ? payload.verses
        : Array.isArray(payload?.data?.ayat)
          ? payload.data.ayat
          : [];
  const ayahs = Array.isArray(ayahSource) ? ayahSource.map(mapAyah) : [];

  return {
    ...summary,
    ayahs: ayahs.filter((ayah) => ayah.number > 0),
  };
};

export const loadSurahDetail = async (surahNumber: number) => {
  const cacheKey = `${DETAIL_CACHE_PREFIX}:${surahNumber}`;
  const cached = await readCache<SurahDetail>(cacheKey);
  if (cached?.data && cached.isFresh) {
    return { data: cached.data, source: 'cache' as const };
  }

  try {
    const data = await fetchSurahDetail(surahNumber);
    await writeCache(cacheKey, data);
    return { data, source: 'api' as const };
  } catch (error) {
    if (cached?.data) {
      return { data: cached.data, source: 'cache-stale' as const };
    }
    throw error;
  }
};
