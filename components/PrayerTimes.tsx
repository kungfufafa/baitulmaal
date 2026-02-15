import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { prayers } from '@/constants';
import { formatTimeDifference, getNextPrayer } from '@/lib/formatters';
import {
  ensureNotificationPermission,
  ensurePrayerNotificationChannel,
  schedulePrayerNotifications,
} from '@/lib/notifications';
import { fetchPrayerTimesByCity } from '@/lib/prayerTimes';
import { PrayerTime } from '@/types';
import * as Location from 'expo-location';
import SectionHeader from '@/components/SectionHeader';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

const DEFAULT_CITY = 'Jakarta';

export default React.memo(function PrayerTimes() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [locationLabel, setLocationLabel] = useState(`${DEFAULT_CITY} (default)`);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(true);
  const isMountedRef = useRef(true);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(prayers);
  const [nextPrayer, setNextPrayer] = useState(getNextPrayer(prayers));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readableDate, setReadableDate] = useState<string | null>(null);

  const resolveCity = useCallback((place?: Location.LocationGeocodedAddress | null) => {
    if (!place) return DEFAULT_CITY;
    return (
      place.city ||
      place.subregion ||
      place.region ||
      place.district ||
      place.name ||
      DEFAULT_CITY
    );
  }, []);

  const refreshLocation = useCallback(async () => {
    setLocating(true);
    setLocationError(null);

    if (Platform.OS === 'web') {
      setCity(DEFAULT_CITY);
      setLocationLabel(`${DEFAULT_CITY} (default)`);
      setLocating(false);
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!isMountedRef.current) return;
        setCity(DEFAULT_CITY);
        setLocationLabel(`${DEFAULT_CITY} (default)`);
        setLocationError('Izin lokasi tidak diberikan, pakai Jakarta');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (!isMountedRef.current) return;
      const resolvedCity = resolveCity(place);
      setCity(resolvedCity);
      setLocationLabel(`${resolvedCity} (lokasi)`);
    } catch {
      if (!isMountedRef.current) return;
      setCity(DEFAULT_CITY);
      setLocationLabel(`${DEFAULT_CITY} (default)`);
      setLocationError('Gagal mendeteksi lokasi, pakai Jakarta');
    } finally {
      if (isMountedRef.current) {
        setLocating(false);
      }
    }
  }, [resolveCity]);

  const syncNotifications = useCallback(async (times: PrayerTime[], cityName: string) => {
    if (Platform.OS === 'web') return;
    if (!isMountedRef.current) return;

    try {
      const granted = await ensureNotificationPermission();
      if (!isMountedRef.current) return;
      if (!granted) return;

      await ensurePrayerNotificationChannel();
      await schedulePrayerNotifications(times, cityName);
    } catch {
      // silent fail for MVP
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextPrayer(getNextPrayer(prayerTimes));
    }, 60000);
    return () => clearInterval(timer);
  }, [prayerTimes]);

  useEffect(() => {
    setNextPrayer(getNextPrayer(prayerTimes));
  }, [prayerTimes]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPrayerTimesByCity(city);
        if (!isMounted) return;
        setPrayerTimes(result.prayers);
        setReadableDate(result.readableDate ?? null);
        await syncNotifications(result.prayers, city);
      } catch {
        if (!isMounted) return;
        setError('Gagal memuat jadwal sholat');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [city, syncNotifications]);

  useEffect(() => {
    refreshLocation();
    return () => {
      isMountedRef.current = false;
    };
  }, [refreshLocation]);

  const statusMessage = loading
    ? 'Memuat jadwal...'
    : error || locationError || null;

  return (
    <View className="px-4 py-4">
      <SectionHeader title="Waktu Sholat" />
      <Card className="bg-white/10 border-white/10 backdrop-blur-sm">
        <CardContent className="p-4">
          <View className="mb-3">
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1">
                <Text className="text-emerald-300 text-xs">Lokasi</Text>
                <Text className="text-foreground text-sm font-semibold">
                  {locating ? 'Mendeteksi lokasi...' : locationLabel}
                </Text>
              </View>
              <Pressable
                onPress={refreshLocation}
                className="px-3 h-9 rounded-md bg-primary items-center justify-center"
              >
                <Text className="text-emerald-900 text-xs font-semibold">Perbarui</Text>
              </Pressable>
            </View>
            {statusMessage && (
              <Text className="text-emerald-300 text-xs mt-2">{statusMessage}</Text>
            )}
            {readableDate && (
              <Text className="text-white/60 text-xs mt-1">{readableDate}</Text>
            )}
          </View>
          <View className="flex-row justify-between">
            {prayerTimes.map((prayer) => (
              <View key={prayer.name} className="p-2 items-center">
                <Text className="text-emerald-300 text-xs mb-1 text-center">
                  {prayer.name}
                </Text>
                <Text className="text-foreground font-semibold text-sm text-center">
                  {prayer.time}
                </Text>
              </View>
            ))}
          </View>
          <View className="mt-3 pt-3 border-t border-white/10 items-center">
            <Text className="text-emerald-300 text-xs">Sholat berikutnya</Text>
            <Text className="text-primary font-semibold">
              {nextPrayer.prayer.name} dalam {formatTimeDifference(nextPrayer.hours, nextPrayer.minutes)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
});
