import ScreenShell from '@/components/ScreenShell';
import ReminderModal from '@/components/modals/ReminderModal';
import { Text } from '@/components/ui/text';
import { useQuran } from '@/contexts/QuranContext';
import { useToast } from '@/hooks/useToast';
import { Ayah, loadSurahDetail, SurahDetail } from '@/lib/quran';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, FlatList, Pressable, View } from 'react-native';

interface AyahRowProps {
  item: Ayah;
  isActive: boolean;
  onBookmark: (ayatNumber: number) => void;
}

const AyahRow = React.memo(function AyahRow({ item, isActive, onBookmark }: AyahRowProps) {
  return (
    <View className={`rounded-xl p-4 ${isActive ? 'bg-amber-400/20' : 'bg-white/10'}`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-emerald-300 text-xs">Ayat {item.number}</Text>
        <View className="flex-row items-center gap-2">
          {isActive && <Text className="text-amber-400 text-xs">Terakhir dibaca</Text>}
          <Pressable
            onPress={() => onBookmark(item.number)}
            className={`w-7 h-7 rounded-full items-center justify-center ${isActive ? 'bg-amber-400/20' : 'bg-white/10'
              }`}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Tandai ayat ${item.number} sebagai terakhir dibaca`}
          >
            <MaterialCommunityIcons
              name={isActive ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isActive ? '#fbbf24' : 'rgba(255, 255, 255, 0.6)'}
            />
          </Pressable>
        </View>
      </View>
      <Text className="text-amber-400 text-xl text-right leading-loose mb-3 font-amiri">
        {item.arabic}
      </Text>
      {item.latin ? (
        <Text className="text-emerald-200 text-sm italic mb-2 font-poppins">
          {item.latin}
        </Text>
      ) : null}
      <Text className="text-white text-sm font-poppins">{item.translation}</Text>
    </View>
  );
});

export default function QuranDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ surah?: string; ayat?: string }>();
  const surahNumber = Number.parseInt(params.surah ?? '1', 10) || 1;
  const initialAyat = Number.parseInt(params.ayat ?? '1', 10) || 1;
  const { progress, setProgress, reminderTime, setReminderTime } = useQuran();
  const { showToast, ToastComponent } = useToast();

  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderVisible, setReminderVisible] = useState(false);

  const listRef = useRef<FlatList<Ayah>>(null);

  const goBackToList = useCallback(() => {
    router.replace('/(tabs)/quran');
  }, [router]);

  const highlightedAyat = useMemo(() => {
    if (progress.surah !== surahNumber) return null;
    return progress.ayat;
  }, [progress, surahNumber]);

  useEffect(() => {
    if (!params.ayat) return;
    setProgress({ surah: surahNumber, ayat: initialAyat });
  }, [params.ayat, surahNumber, initialAyat, setProgress]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBackToList();
      return true;
    });
    return () => sub.remove();
  }, [goBackToList]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await loadSurahDetail(surahNumber);
        if (!isMounted) return;
        setDetail(result.data);
      } catch {
        if (!isMounted) return;
        setError('Gagal memuat detail surah');
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
  }, [surahNumber]);

  const scrollToAyat = useCallback((ayatNumber: number) => {
    if (!listRef.current || !detail) return;
    const index = Math.max(0, ayatNumber - 1);
    listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
  }, [detail]);

  useEffect(() => {
    if (!detail || !params.ayat) return;
    const timeout = setTimeout(() => {
      scrollToAyat(initialAyat);
    }, 50);
    return () => clearTimeout(timeout);
  }, [detail, initialAyat, params.ayat, scrollToAyat]);

  const handleBookmarkAyat = useCallback((ayatNumber: number) => {
    setProgress({ surah: surahNumber, ayat: ayatNumber });
  }, [setProgress, surahNumber]);

  const renderAyahItem = useCallback(({ item }: { item: Ayah }) => {
    const isActive = item.number === highlightedAyat;
    return (
      <AyahRow
        item={item}
        isActive={isActive}
        onBookmark={handleBookmarkAyat}
      />
    );
  }, [handleBookmarkAyat, highlightedAyat]);

  const handleSaveReminder = async (time: string) => {
    const result = await setReminderTime(time);
    if (result.ok) {
      showToast(`Pengingat ngaji diatur pukul ${time}`, '⏰');
    } else {
      showToast(result.message ?? 'Gagal mengatur pengingat', '⚠️');
    }
  };

  return (
    <ScreenShell title="📖 Al-Quran" scrollable={false}>
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={goBackToList}
          className="px-3 py-2 rounded-md bg-white/10"
        >
          <Text className="text-white text-xs">Kembali</Text>
        </Pressable>
        <Pressable
          onPress={() => setReminderVisible(true)}
          className="px-3 py-2 rounded-md bg-primary"
        >
          <Text className="text-emerald-900 text-xs font-semibold">Atur Pengingat</Text>
        </Pressable>
      </View>

      {loading && (
        <Text className="text-emerald-300 text-xs mb-3">Memuat surah...</Text>
      )}
      {!loading && error && (
        <Text className="text-amber-300 text-xs mb-3">{error}</Text>
      )}

      {detail && (
        <>
          <View className="bg-white/5 rounded-xl p-4 mb-3">
            <Text className="text-white text-lg font-semibold font-poppins">
              {detail.latinName || detail.name}
            </Text>
            {detail.meaning && (
              <Text className="text-emerald-300 text-xs mt-1">{detail.meaning}</Text>
            )}
            <Text className="text-emerald-300 text-xs mt-2">
              {detail.ayatCount} Ayat
            </Text>
            {highlightedAyat && (
              <Pressable
                onPress={() => scrollToAyat(highlightedAyat)}
                className="mt-3 px-3 py-2 rounded-full bg-white/10 self-start flex-row items-center gap-2"
              >
                <MaterialCommunityIcons name="bookmark" size={14} color="#fbbf24" />
                <Text className="text-white text-xs">
                  Lanjutkan dari Ayat {highlightedAyat}
                </Text>
              </Pressable>
            )}
          </View>

          {detail.ayahs.length === 0 ? (
            <Text className="text-amber-300 text-xs">Ayat belum tersedia.</Text>
          ) : (
            <FlatList
              ref={listRef}
              data={detail.ayahs}
              keyExtractor={(item) => item.number.toString()}
              contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
              style={{ flex: 1 }}
              onScrollToIndexFailed={() => {
                listRef.current?.scrollToOffset({ offset: 0, animated: true });
              }}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={5}
              removeClippedSubviews
              updateCellsBatchingPeriod={50}
              renderItem={renderAyahItem}
            />
          )}
        </>
      )}

      <ReminderModal
        visible={reminderVisible}
        onClose={() => setReminderVisible(false)}
        onSave={handleSaveReminder}
        reminderTime={reminderTime}
      />

      {ToastComponent}
    </ScreenShell>
  );
}
