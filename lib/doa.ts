import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoaItem, DoaType } from '@/types';

const DOA_API_BASE_URL = 'https://equran.id/api/doa';
const CACHE_PREFIX = 'doa_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CachePayload = {
  cachedAt: number;
  items: DoaItem[];
};

const doaTagByType: Record<DoaType, string> = {
  pagi: 'pagi',
  petang: 'petang',
  tidur: 'tidur',
  makan: 'makan',
};

const pickString = (...values: unknown[]) =>
  values.find((value) => typeof value === 'string' && value.trim().length > 0) as
    | string
    | undefined;

const toStringArray = (...values: unknown[]) => {
  const result: string[] = [];
  for (const value of values) {
    if (Array.isArray(value)) {
      result.push(
        ...value.filter((item) => typeof item === 'string').map((item) => item.trim())
      );
      continue;
    }
    if (typeof value === 'string') {
      result.push(...value.split(',').map((item) => item.trim()));
    }
  }
  return result.filter(Boolean);
};

const normalizeDoaItem = (raw: any): DoaItem => {
  const arabic = pickString(
    raw?.ar,
    raw?.arab,
    raw?.arabic,
    raw?.teks_arab,
    raw?.teksArab,
    raw?.arab_text,
    raw?.arabText,
    raw?.ayat
  );
  const latin = pickString(
    raw?.tr,
    raw?.latin,
    raw?.transliteration,
    raw?.teks_latin,
    raw?.teksLatin,
    raw?.latin_text,
    raw?.latinText
  );
  const arti = pickString(
    raw?.idn,
    raw?.terjemah,
    raw?.terjemahan,
    raw?.arti,
    raw?.artinya,
    raw?.translation,
    raw?.arti_text
  );
  const title = pickString(raw?.judul, raw?.title, raw?.nama, raw?.doa, raw?.name);

  const tags = toStringArray(
    raw?.tag,
    raw?.tags,
    raw?.tagging,
    raw?.kategori,
    raw?.grup,
    raw?.group,
    raw?.category
  );

  return {
    arabic: arabic ?? '',
    latin: latin ?? '',
    arti: arti ?? '',
    title: title ?? undefined,
    tags: tags.length > 0 ? tags : undefined,
  };
};

const extractArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const cacheKey = (type: DoaType) => `${CACHE_PREFIX}:${type}`;

const readCache = async (type: DoaType, allowStale = false) => {
  const raw = await AsyncStorage.getItem(cacheKey(type));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachePayload;
    if (!parsed?.cachedAt || !Array.isArray(parsed.items)) return null;
    const isFresh = Date.now() - parsed.cachedAt <= CACHE_TTL_MS;
    if (!isFresh && !allowStale) return null;
    return { items: parsed.items, isFresh };
  } catch {
    return null;
  }
};

const writeCache = async (type: DoaType, items: DoaItem[]) => {
  const payload: CachePayload = {
    cachedAt: Date.now(),
    items,
  };
  await AsyncStorage.setItem(cacheKey(type), JSON.stringify(payload));
};

const fetchDoaList = async (query?: string) => {
  const url = query ? `${DOA_API_BASE_URL}?${query}` : DOA_API_BASE_URL;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch doa (${response.status})`);
  }
  const json = await response.json();
  const data = extractArray(json);
  return data
    .map(normalizeDoaItem)
    .filter((item) => item.arabic || item.latin || item.arti);
};

const keywordsByType: Record<DoaType, string[]> = {
  pagi: ['pagi', 'subuh', 'pagi hari'],
  petang: ['petang', 'sore', 'malam'],
  tidur: ['tidur', 'sebelum tidur', 'bangun'],
  makan: ['makan', 'sebelum makan', 'sesudah makan', 'minum'],
};

const filterByType = (items: DoaItem[], type: DoaType) => {
  const keywords = keywordsByType[type];
  const filtered = items.filter((item) => {
    const haystack = [
      item.title ?? '',
      ...(item.tags ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });
  return filtered.length > 0 ? filtered : items;
};

export const fetchDoaByType = async (type: DoaType) => {
  const tag = doaTagByType[type];
  const tagged = await fetchDoaList(`tag=${encodeURIComponent(tag)}`);
  if (tagged.length > 0) return tagged;

  const allItems = await fetchDoaList();
  return filterByType(allItems, type);
};

export const loadDoaByType = async (type: DoaType) => {
  const cached = await readCache(type, true);
  if (cached?.items?.length && cached.isFresh) {
    return { items: cached.items, source: 'cache' as const };
  }

  try {
    const items = await fetchDoaByType(type);
    await writeCache(type, items);
    return { items, source: 'api' as const };
  } catch (error) {
    if (cached?.items?.length) {
      return { items: cached.items, source: 'cache-stale' as const };
    }
    throw error;
  }
};
