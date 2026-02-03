import { prayers } from '@/constants';
import { PrayerTime } from '@/types';

export function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getHijriYear(date: Date): number {
  return Math.floor((date.getFullYear() - 622) * 33 / 32);
}

export function formatHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      calendar: 'islamic',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    const year = getHijriYear(date);
    return `${year} H`;
  }
}

export function getNextPrayer(prayerList: PrayerTime[] = prayers): { prayer: PrayerTime; hours: number; minutes: number } {
  const list = prayerList.length > 0 ? prayerList : prayers;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextPrayer = list[0];
  let timeDiff = list[0].hour * 60 + list[0].minute + 24 * 60 - currentMinutes;

  for (const prayer of list) {
    const prayerMinutes = prayer.hour * 60 + prayer.minute;
    if (prayerMinutes > currentMinutes) {
      nextPrayer = prayer;
      timeDiff = prayerMinutes - currentMinutes;
      break;
    }
  }

  return {
    prayer: nextPrayer,
    hours: Math.floor(timeDiff / 60),
    minutes: timeDiff % 60,
  };
}

export function formatTimeDifference(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return 'sekarang';
  if (hours === 0) return `${minutes} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
}
