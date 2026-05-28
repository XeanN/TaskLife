import { useAuth } from "@/context/AuthContext";
import { obtenerStats } from "@/services/statsService";
import { useEffect, useRef, useState } from "react";

const STATS_CACHE_TTL_MS = 60000; // 1 minuto

const statsStore = {
  userId: null as string | null,
  data: null as any,
  lastFetchedAt: 0,
  fetchPromise: null as Promise<any> | null,
  listeners: new Set<() => void>(),
};

function emitStatsStoreUpdate() {
  statsStore.listeners.forEach((listener) => listener());
}

function subscribeStatsStore(listener: () => void) {
  statsStore.listeners.add(listener);
  return () => statsStore.listeners.delete(listener);
}

function resetStatsStoreForUser(userId: string | null | undefined) {
  if (statsStore.userId === userId) return;
  statsStore.userId = userId ?? null;
  statsStore.data = null;
  statsStore.lastFetchedAt = 0;
  emitStatsStoreUpdate();
}

function setStatsInStore(data: any) {
  statsStore.data = data;
  statsStore.lastFetchedAt = Date.now();
  emitStatsStoreUpdate();
}

function getStatsSnapshot() {
  return statsStore.data;
}

async function fetchStats(userId: string) {
  const existingPromise = statsStore.fetchPromise;
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    const data = await obtenerStats(userId);
    setStatsInStore(data || {});
    return data || {};
  })();

  statsStore.fetchPromise = promise;

  promise
    .catch(() => {
      // Silently fail, error is handled by the hook
    })
    .finally(() => {
      statsStore.fetchPromise = null;
    });

  return promise;
}

function shouldRefetch() {
  const now = Date.now();
  return now - statsStore.lastFetchedAt >= STATS_CACHE_TTL_MS;
}

export function useStats() {
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
    resetStatsStoreForUser(userId);
  }, [userId]);

  // Subscribir a cambios del store
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeStatsStore(() => {
      if (isMountedRef.current) {
        setData(getStatsSnapshot());
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
    if (statsStore.data && !shouldRefetch()) {
      setData(statsStore.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchStats(userId)
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
      const result = await fetchStats(userId);
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
    statsStore.data = null;
    statsStore.lastFetchedAt = 0;
    setData(null);
  };

  return {
    stats: data,
    loading,
    error,
    refetch,
    invalidate,
  };
}
