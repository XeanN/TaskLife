import { useAuth } from "@/context/AuthContext";
import { syncReminderNotifications } from "@/services/notificationsService";
import {
    ejecutarReminders,
    normalizeRemindersPayload,
    obtenerRemindersDue,
} from "@/services/remindersService";
import { useEffect, useRef, useState } from "react";

const REMINDERS_CACHE_TTL_MS = 30000; // 30 segundos

const remindersStore = {
  userId: null as string | null,
  data: null as any,
  lastFetchedAt: 0,
  fetchPromise: null as Promise<any> | null,
  listeners: new Set<() => void>(),
};

function emitRemindersStoreUpdate() {
  remindersStore.listeners.forEach((listener) => listener());
}

function subscribeRemindersStore(listener: () => void) {
  remindersStore.listeners.add(listener);
  return () => remindersStore.listeners.delete(listener);
}

function resetRemindersStoreForUser(userId: string | null | undefined) {
  if (remindersStore.userId === userId) return;
  remindersStore.userId = userId ?? null;
  remindersStore.data = null;
  remindersStore.lastFetchedAt = 0;
  emitRemindersStoreUpdate();
}

function setRemindersInStore(data: any) {
  remindersStore.data = data;
  remindersStore.lastFetchedAt = Date.now();
  emitRemindersStoreUpdate();
}

function getRemindersSnapshot() {
  return remindersStore.data;
}

async function fetchReminders(userId: string) {
  const existingPromise = remindersStore.fetchPromise;
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    const data = await obtenerRemindersDue(userId);
    const reminders = normalizeRemindersPayload(data);
    setRemindersInStore(reminders);

    syncReminderNotifications(reminders).catch((err) => {
      console.warn("⚠️ No se pudieron sincronizar las notificaciones de recordatorios:", err?.message || err);
    });

    return reminders;
  })();

  remindersStore.fetchPromise = promise;

  promise
    .catch(() => {
      // Silently fail, error is handled by the hook
    })
    .finally(() => {
      remindersStore.fetchPromise = null;
    });

  return promise;
}

function shouldRefetch() {
  const now = Date.now();
  return now - remindersStore.lastFetchedAt >= REMINDERS_CACHE_TTL_MS;
}

export function useReminders() {
  const { user } = useAuth();
  const userId = user?.id;

  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [executing, setExecuting] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    resetRemindersStoreForUser(userId);
  }, [userId]);

  // Subscribir a cambios del store
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeRemindersStore(() => {
      if (isMountedRef.current) {
        setReminders(getRemindersSnapshot());
        setError(null);
      }
    });

    unsubscribeRef.current = unsubscribe;
    return () => unsubscribe();
  }, [userId]);

  // Fetch inicial o refetch si cache expiró
  useEffect(() => {
    if (!userId) {
      setReminders([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cached data
    if (remindersStore.data && !shouldRefetch()) {
      setReminders(remindersStore.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchReminders(userId)
      .then((result) => {
        if (isMountedRef.current) {
          setReminders(result);
        }
      })
      .catch((err: Error) => {
        if (isMountedRef.current) {
          setError(err);
          setReminders([]);
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false);
        }
      });
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchReminders(userId);
      if (isMountedRef.current) {
        setReminders(result);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const executeReminders = async () => {
    if (!userId) return;
    setExecuting(true);
    try {
      const result = await ejecutarReminders(userId);
      if (isMountedRef.current) {
        // Invalidate cache to force refetch
        remindersStore.lastFetchedAt = 0;
        await refetch();
      }
      return result;
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setExecuting(false);
      }
    }
  };

  const invalidate = () => {
    remindersStore.data = null;
    remindersStore.lastFetchedAt = 0;
    setReminders([]);
  };

  return {
    reminders,
    loading,
    error,
    executing,
    refetch,
    executeReminders,
    invalidate,
  };
}
