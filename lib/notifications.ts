import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerTime } from '@/types';

const LEGACY_ANDROID_CHANNEL_ID = 'prayer-times';
const ANDROID_CHANNEL_ID = 'prayer-times-adzan-v2';
const QURAN_CHANNEL_ID = 'quran-reminder';
const PRAYER_IDS_KEY = 'notification_prayer_ids_v1';
const QURAN_REMINDER_KEY = 'notification_quran_reminder_id_v1';
const PRAYER_SOUND_FILE = 'adzan.wav';

export const initNotifications = () => {
  try {
    if (Platform.OS === 'web') return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    if (__DEV__) console.error('Failed to initialize notifications:', error);
  }
};

export async function ensureNotificationPermission() {
  if (Platform.OS === 'web') return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;

  if (!current.canAskAgain) return false;

  const request = await Notifications.requestPermissionsAsync();
  return request.status === 'granted';
}

export async function ensurePrayerNotificationChannel() {
  if (Platform.OS !== 'android') return;

  // Android channels are immutable after creation; use a new id for sound updates.
  try {
    await Notifications.deleteNotificationChannelAsync(LEGACY_ANDROID_CHANNEL_ID);
  } catch (e) {
    if (__DEV__) console.warn('Failed to delete legacy prayer channel', e);
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Jadwal Sholat (Adzan)',
    importance: Notifications.AndroidImportance.HIGH,
    sound: PRAYER_SOUND_FILE,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FFD700',
  });
}

export async function schedulePrayerNotifications(prayers: PrayerTime[], city: string) {
  if (Platform.OS === 'web') return;

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  await ensurePrayerNotificationChannel();

  const existingIdsRaw = await AsyncStorage.getItem(PRAYER_IDS_KEY);
  if (existingIdsRaw) {
    try {
      const ids = JSON.parse(existingIdsRaw) as string[];
      for (const id of ids) {
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
        } catch (e) {
          if (__DEV__) console.warn('Failed to cancel notification', id, e);
        }
      }
    } catch (e) {
      if (__DEV__) console.warn('Failed to parse existing notification IDs', e);
    }
  }

  const scheduledIds: string[] = [];
  for (const prayer of prayers) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Waktu Sholat',
        body: `Saatnya sholat ${prayer.name} di ${city}`,
        sound: PRAYER_SOUND_FILE,
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : null),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: prayer.hour,
        minute: prayer.minute,
      },
    });
    scheduledIds.push(id);
  }

  await AsyncStorage.setItem(PRAYER_IDS_KEY, JSON.stringify(scheduledIds));
}

export async function ensureQuranNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(QURAN_CHANNEL_ID, {
    name: 'Pengingat Ngaji',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FFD700',
  });
}

export async function scheduleQuranReminder(time: string) {
  if (Platform.OS === 'web') return;
  const match = time.match(/(\d{1,2})\D+(\d{1,2})/);
  if (!match) {
    throw new Error('Format waktu tidak valid');
  }
  const hour = Number.parseInt(match[1] ?? '', 10);
  const minute = Number.parseInt(match[2] ?? '', 10);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error('Format waktu tidak valid');
  }

  const existingId = await AsyncStorage.getItem(QURAN_REMINDER_KEY);
  if (existingId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    } catch (e) {
      if (__DEV__) console.warn('Failed to cancel quran reminder', e);
    }
  }

  await ensureQuranNotificationChannel();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Pengingat Ngaji',
      body: 'Saatnya melanjutkan membaca Al-Quran',
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: QURAN_CHANNEL_ID } : null),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  await AsyncStorage.setItem(QURAN_REMINDER_KEY, id);
}

export async function cancelQuranReminder() {
  if (Platform.OS === 'web') return;
  const existingId = await AsyncStorage.getItem(QURAN_REMINDER_KEY);
  if (existingId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    } catch (e) {
      if (__DEV__) console.warn('Failed to cancel quran reminder on removal', e);
    }
  }
  await AsyncStorage.removeItem(QURAN_REMINDER_KEY);
}
