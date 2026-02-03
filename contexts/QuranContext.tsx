import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ensureNotificationPermission, initNotifications, scheduleQuranReminder, cancelQuranReminder } from '@/lib/notifications';
import { QuranProgress } from '@/types';

interface ReminderResult {
  ok: boolean;
  message?: string;
}

interface QuranContextType {
  progress: QuranProgress;
  reminderTime: string | null;
  setProgress: (progress: QuranProgress) => void;
  setReminderTime: (time: string | null) => Promise<ReminderResult>;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

const PROGRESS_KEY = 'quran_progress_v1';
const REMINDER_KEY = 'quran_reminder_time_v1';

const DEFAULT_PROGRESS: QuranProgress = { surah: 1, ayat: 1 };

export function QuranProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgressState] = useState<QuranProgress>(DEFAULT_PROGRESS);
  const [reminderTime, setReminderTimeState] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    initNotifications();
    const hydrate = async () => {
      try {
        const storedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
        const storedReminder = await AsyncStorage.getItem(REMINDER_KEY);
        if (!isMounted) return;
        if (storedProgress) {
          const parsed = JSON.parse(storedProgress) as QuranProgress;
          if (parsed?.surah && parsed?.ayat) {
            setProgressState(parsed);
          }
        }
        if (storedReminder) {
          setReminderTimeState(storedReminder);
        }
      } catch {
        // ignore hydration errors
      }
    };
    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  const setProgress = useCallback((next: QuranProgress) => {
    setProgressState(next);
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const setReminderTime = useCallback(async (time: string | null): Promise<ReminderResult> => {
    if (!time) {
      await cancelQuranReminder();
      setReminderTimeState(null);
      await AsyncStorage.removeItem(REMINDER_KEY);
      return { ok: true };
    }

    const granted = await ensureNotificationPermission();
    if (!granted) {
      return { ok: false, message: 'Izin notifikasi belum diberikan' };
    }

    try {
      await scheduleQuranReminder(time);
      setReminderTimeState(time);
      await AsyncStorage.setItem(REMINDER_KEY, time);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengatur pengingat';
      console.warn('scheduleQuranReminder failed', err);
      return { ok: false, message };
    }
  }, []);

  const contextValue = useMemo(() => ({
    progress,
    reminderTime,
    setProgress,
    setReminderTime,
  }), [progress, reminderTime, setProgress, setReminderTime]);

  return (
    <QuranContext.Provider value={contextValue}>
      {children}
    </QuranContext.Provider>
  );
}

export function useQuran() {
  const context = useContext(QuranContext);
  if (context === undefined) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
}
