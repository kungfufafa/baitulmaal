import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { GUEST_DONATION_TOKEN_KEY, GUEST_DONOR_PROFILE_KEY } from '@/constants/keys';

export type GuestDonorProfile = {
  name?: string;
  phone?: string;
  email?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createGuestToken = () => {
  return `guest_${randomUUID()}`;
};

export const getGuestDonationToken = async (): Promise<string> => {
  try {
    const existing = await AsyncStorage.getItem(GUEST_DONATION_TOKEN_KEY);
    if (existing && existing.trim().length > 0) {
      return existing;
    }
  } catch {
    if (__DEV__) console.warn('Failed to read guest token from storage');
  }

  const token = createGuestToken();
  try {
    await AsyncStorage.setItem(GUEST_DONATION_TOKEN_KEY, token);
  } catch {
    if (__DEV__) console.warn('Failed to persist guest token');
  }
  return token;
};

export const getGuestDonorProfile = async (): Promise<GuestDonorProfile> => {
  try {
    const raw = await AsyncStorage.getItem(GUEST_DONOR_PROFILE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as GuestDonorProfile;
    return {
      name: parsed.name?.trim() || undefined,
      phone: parsed.phone?.trim() || undefined,
      email: parsed.email?.trim() || undefined,
    };
  } catch {
    return {};
  }
};

export const setGuestDonorProfile = async (profile: GuestDonorProfile): Promise<void> => {
  const name = (profile.name?.trim() || '').slice(0, 100);
  const phone = (profile.phone?.trim() || '').replace(/[^\d+\-() ]/g, '').slice(0, 20);
  const email = profile.email?.trim() || '';

  if (email && !EMAIL_REGEX.test(email)) {
    throw new Error('Format email tidak valid');
  }

  try {
    await AsyncStorage.setItem(
      GUEST_DONOR_PROFILE_KEY,
      JSON.stringify({ name, phone, email })
    );
  } catch (error) {
    if (__DEV__) console.warn('Failed to persist guest donor profile', error);
    throw new Error('Gagal menyimpan profil donatur');
  }
};
