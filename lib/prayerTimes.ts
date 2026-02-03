import { PrayerTime } from '@/types';

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';
const KEMENAG_METHOD_ID = 20;

type AladhanTimings = Record<string, string>;

export interface PrayerTimesResult {
  prayers: PrayerTime[];
  readableDate?: string;
  timezone?: string;
}

function formatDateForApi(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function cleanTime(value: string) {
  return value.split(' ')[0] || value;
}

function toPrayerTime(label: string, timeValue: string): PrayerTime {
  const time = cleanTime(timeValue);
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number.parseInt(hourRaw || '0', 10);
  const minute = Number.parseInt(minuteRaw || '0', 10);

  return {
    name: label,
    time,
    hour: Number.isNaN(hour) ? 0 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
  };
}

function mapTimingsToPrayerTimes(timings: AladhanTimings): PrayerTime[] {
  return [
    toPrayerTime('Subuh', timings.Fajr),
    toPrayerTime('Dzuhur', timings.Dhuhr),
    toPrayerTime('Ashar', timings.Asr),
    toPrayerTime('Maghrib', timings.Maghrib),
    toPrayerTime('Isya', timings.Isha),
  ];
}

export async function fetchPrayerTimesByCity(city: string): Promise<PrayerTimesResult> {
  const date = formatDateForApi(new Date());
  const address = `${city}, Indonesia`;
  const url = `${ALADHAN_BASE_URL}/timingsByAddress/${date}?address=${encodeURIComponent(
    address
  )}&method=${KEMENAG_METHOD_ID}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch prayer times (${response.status})`);
  }

  const json = await response.json();
  const timings = json?.data?.timings as AladhanTimings | undefined;
  if (!timings?.Fajr || !timings?.Dhuhr || !timings?.Asr || !timings?.Maghrib || !timings?.Isha) {
    throw new Error('Missing prayer times from API response');
  }

  return {
    prayers: mapTimingsToPrayerTimes(timings),
    readableDate: json?.data?.date?.readable,
    timezone: json?.data?.meta?.timezone,
  };
}
