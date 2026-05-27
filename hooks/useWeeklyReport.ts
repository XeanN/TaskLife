import { useAuth } from "@/context/AuthContext";
import { obtenerWeeklyReport } from "@/services/statsService";
import { useEffect, useRef, useState } from "react";

const WEEKLY_REPORT_CACHE_TTL_MS = 60000; // 1 minuto

const weeklyReportStore = {
  userId: null as string | null,
  data: null as any,
  lastFetchedAt: 0,
  fetchPromise: null as Promise<any> | null,
  listeners: new Set<() => void>(),
};

function emitWeeklyReportStoreUpdate() {
  weeklyReportStore.listeners.forEach((listener) => listener());
}

function subscribeWeeklyReportStore(listener: () => void) {
  weeklyReportStore.listeners.add(listener);
  return () => weeklyReportStore.listeners.delete(listener);
}

function resetWeeklyReportStoreForUser(userId: string | null | undefined) {
  if (weeklyReportStore.userId === userId) return;
  weeklyReportStore.userId = userId ?? null;
  weeklyReportStore.data = null;
  weeklyReportStore.lastFetchedAt = 0;
  emitWeeklyReportStoreUpdate();
}

function setWeeklyReportInStore(data: any) {
  weeklyReportStore.data = data;
  weeklyReportStore.lastFetchedAt = Date.now();
  emitWeeklyReportStoreUpdate();
}

function getWeeklyReportSnapshot() {
  return weeklyReportStore.data;
}

async function fetchWeeklyReport(userId: string) {
  const existingPromise = weeklyReportStore.fetchPromise;
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    const data = await obtenerWeeklyReport(userId);
    setWeeklyReportInStore(data || {});
    return data || {};
  })();

  weeklyReportStore.fetchPromise = promise;

  promise
    .catch(() => {
      // Silently fail, error is handled by the hook
    })
    .finally(() => {
      weeklyReportStore.fetchPromise = null;
    });

  return promise;
}

function shouldRefetch() {
  const now = Date.now();
  return now - weeklyReportStore.lastFetchedAt >= WEEKLY_REPORT_CACHE_TTL_MS;
}

export function useWeeklyReport() {
  const { user } = useAuth();
  const userId = user?.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    resetWeeklyReportStoreForUser(userId);
  }, [userId]);

  // Subscribir a cambios del store
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeWeeklyReportStore(() => {
      if (isMountedRef.current) {
        setData(getWeeklyReportSnapshot());
        setError(null);
      }
    });

    unsubscribeRef.current = unsubscribe;
    return () => unsubscribe();
  }, [userId]);

  // Fetch inicial o refetch si cache expiró
  useEffect(() => {
    if (!userId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cached data
    if (weeklyReportStore.data && !shouldRefetch()) {
      setData(weeklyReportStore.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchWeeklyReport(userId)
      .then((result) => {
        if (isMountedRef.current) {
          setData(result);
        }
      })
      .catch((err: Error) => {
        if (isMountedRef.current) {
          setError(err);
          setData(null);
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
      const result = await fetchWeeklyReport(userId);
      if (isMountedRef.current) {
        setData(result);
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

  const invalidate = () => {
    weeklyReportStore.data = null;
    weeklyReportStore.lastFetchedAt = 0;
    setData(null);
  };

  return {
    weeklyReport: data,
    loading,
    error,
    refetch,
    invalidate,
  };
}
