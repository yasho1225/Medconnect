import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { buildInsightsForScreening } from '@/lib/aiInsights';
import { createDemoScreenings, createSyncedScreeningFromKiosk } from '@/lib/sampleScreenings';
import type { HealthInsight, Screening, UserProfile } from '@/lib/types';
import { overallRiskFromScreening, reminderDaysForRisk } from '@/lib/healthUtils';

const STORAGE_KEYS = {
  profile: 'mc_profile_v1',
  guest: 'mc_guest_v1',
  screenings: 'mc_screenings_v1',
  insights: 'mc_insights_v1',
  notifications: 'mc_notify_v1',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type MedConnectContextValue = {
  ready: boolean;
  profile: UserProfile | null;
  guestMode: boolean;
  screenings: Screening[];
  insights: HealthInsight[];
  notificationsEnabled: boolean;
  register: (p: Omit<UserProfile, 'id' | 'acceptedPrivacyAt'>) => Promise<void>;
  enterGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  linkKioskSession: () => Promise<Screening>;
  rateInsight: (id: string, vote: 'up' | 'down') => void;
  setNotificationsEnabled: (on: boolean) => Promise<void>;
  scheduleRescreenReminder: () => Promise<void>;
  deleteAllUserData: () => Promise<void>;
  lastScreening: Screening | null;
};

const MedConnectContext = createContext<MedConnectContextValue | null>(null);

export function MedConnectProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);

  const persistScreenings = useCallback(async (next: Screening[]) => {
    setScreenings(next);
    await AsyncStorage.setItem(STORAGE_KEYS.screenings, JSON.stringify(next));
  }, []);

  const persistInsights = useCallback(async (next: HealthInsight[]) => {
    setInsights(next);
    await AsyncStorage.setItem(STORAGE_KEYS.insights, JSON.stringify(next));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [p, g, s, i, n] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.guest),
          AsyncStorage.getItem(STORAGE_KEYS.screenings),
          AsyncStorage.getItem(STORAGE_KEYS.insights),
          AsyncStorage.getItem(STORAGE_KEYS.notifications),
        ]);
        if (p) setProfile(JSON.parse(p) as UserProfile);
        if (g === '1') setGuestMode(true);
        if (s) setScreenings(JSON.parse(s) as Screening[]);
        if (i) setInsights(JSON.parse(i) as HealthInsight[]);
        if (n === '0') setNotificationsEnabledState(false);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const register = useCallback(
    async (input: Omit<UserProfile, 'id' | 'acceptedPrivacyAt'>) => {
      const full: UserProfile = {
        ...input,
        id: `u-${Date.now()}`,
        acceptedPrivacyAt: new Date().toISOString(),
      };
      setProfile(full);
      setGuestMode(false);
      await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(full));
      await AsyncStorage.removeItem(STORAGE_KEYS.guest);
      const demo = createDemoScreenings(full.id);
      const built: HealthInsight[] = [];
      demo.forEach((sc) => built.push(...buildInsightsForScreening(sc, full)));
      await persistScreenings(demo);
      await persistInsights(built);
    },
    [persistInsights, persistScreenings]
  );

  const enterGuest = useCallback(async () => {
    setGuestMode(true);
    setProfile(null);
    await AsyncStorage.setItem(STORAGE_KEYS.guest, '1');
    await AsyncStorage.removeItem(STORAGE_KEYS.profile);
    const demo = createDemoScreenings('guest');
    const built: HealthInsight[] = [];
    demo.forEach((sc) => built.push(...buildInsightsForScreening(sc, null)));
    await persistScreenings(demo);
    await persistInsights(built);
  }, [persistInsights, persistScreenings]);

  const signOut = useCallback(async () => {
    setProfile(null);
    setGuestMode(false);
    setScreenings([]);
    setInsights([]);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.profile,
      STORAGE_KEYS.guest,
      STORAGE_KEYS.screenings,
      STORAGE_KEYS.insights,
    ]);
  }, []);

  const linkKioskSession = useCallback(async () => {
    const uid = profile?.id ?? 'guest';
    const next = createSyncedScreeningFromKiosk(uid);
    const prof = profile;
    setScreenings((prev) => {
      const merged = [next, ...prev.filter((x) => x.id !== next.id)];
      void AsyncStorage.setItem(STORAGE_KEYS.screenings, JSON.stringify(merged));
      return merged;
    });
    setInsights((prev) => {
      const newInsights = buildInsightsForScreening(next, prof);
      const merged = [...newInsights, ...prev];
      void AsyncStorage.setItem(STORAGE_KEYS.insights, JSON.stringify(merged));
      return merged;
    });
    return next;
  }, [profile]);

  const rateInsight = useCallback(
    (id: string, vote: 'up' | 'down') => {
      const mapped = insights.map((x) => {
        if (x.id !== id) return x;
        const up = x.helpfulVotes?.up ?? 0;
        const down = x.helpfulVotes?.down ?? 0;
        return {
          ...x,
          helpfulVotes: {
            up: vote === 'up' ? up + 1 : up,
            down: vote === 'down' ? down + 1 : down,
          },
        };
      });
      void persistInsights(mapped);
    },
    [insights, persistInsights]
  );

  const setNotificationsEnabled = useCallback(async (on: boolean) => {
    setNotificationsEnabledState(on);
    await AsyncStorage.setItem(STORAGE_KEYS.notifications, on ? '1' : '0');
    if (!on) await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  const scheduleRescreenReminder = useCallback(async () => {
    if (!notificationsEnabled) return;
    if (Platform.OS === 'web') return;
    const latest = [...screenings].sort((a, b) => +new Date(b.syncedAt) - +new Date(a.syncedAt))[0];
    if (!latest) return;
    const risk = overallRiskFromScreening(latest);
    const days = reminderDaysForRisk(risk);
    await Notifications.cancelAllScheduledNotificationsAsync();
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const seconds = Math.min(days * 24 * 60 * 60, 60 * 60 * 24 * 120);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for a quick check-in',
        body: `MedConnect suggests a follow-up screening in about ${days} days based on your last kiosk visit. Tap Find to locate a kiosk.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
  }, [notificationsEnabled, screenings]);

  const deleteAllUserData = useCallback(async () => {
    await signOut();
    await AsyncStorage.removeItem(STORAGE_KEYS.notifications);
  }, [signOut]);

  const lastScreening = useMemo(() => {
    if (!screenings.length) return null;
    return [...screenings].sort((a, b) => +new Date(b.syncedAt) - +new Date(a.syncedAt))[0];
  }, [screenings]);

  const value = useMemo<MedConnectContextValue>(
    () => ({
      ready,
      profile,
      guestMode,
      screenings,
      insights,
      notificationsEnabled,
      register,
      enterGuest,
      signOut,
      linkKioskSession,
      rateInsight,
      setNotificationsEnabled,
      scheduleRescreenReminder,
      deleteAllUserData,
      lastScreening,
    }),
    [
      deleteAllUserData,
      enterGuest,
      guestMode,
      insights,
      lastScreening,
      linkKioskSession,
      notificationsEnabled,
      profile,
      rateInsight,
      ready,
      register,
      scheduleRescreenReminder,
      screenings,
      setNotificationsEnabled,
      signOut,
    ]
  );

  return <MedConnectContext.Provider value={value}>{children}</MedConnectContext.Provider>;
}

export function useMedConnect() {
  const ctx = useContext(MedConnectContext);
  if (!ctx) throw new Error('useMedConnect must be used within MedConnectProvider');
  return ctx;
}
