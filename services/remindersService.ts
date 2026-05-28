import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./apiClient";
import { parseApiError } from "./errorHandler";
import { getApiUrl } from "./runtimeConfig";

export function normalizeRemindersPayload(payload: any) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidateKeys = ["reminders", "items", "data", "results", "due"];
  for (const key of candidateKeys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
}

// Local cache for reminders created client-side or confirmed by backend
const localRemindersStore: Record<string, any[]> = {};
const localRemindersListeners = new Set<() => void>();
const dismissedReminderKeysStore: Record<string, Set<string>> = {};
const LOCAL_REMINDERS_STORAGE_PREFIX = "tasklife_local_reminders:";

async function persistLocalReminders(userId: string) {
  if (!userId) return;
  try {
    const payload = JSON.stringify(localRemindersStore[userId] || []);
    await AsyncStorage.setItem(`${LOCAL_REMINDERS_STORAGE_PREFIX}${userId}`, payload);
  } catch {
    // Best effort only.
  }
}

async function hydrateLocalReminders(userId: string) {
  if (!userId || localRemindersStore[userId]) return;
  try {
    const raw = await AsyncStorage.getItem(`${LOCAL_REMINDERS_STORAGE_PREFIX}${userId}`);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      localRemindersStore[userId] = parsed
        .map(normalizeReminderForLocalStore)
        .filter((reminder) => !!getReminderKey(reminder));
    }
  } catch {
    // Best effort only.
  }
}

export async function loadLocalReminders(userId: string) {
  await hydrateLocalReminders(userId);
  return getLocalReminders(userId);
}

function emitLocalRemindersUpdate() {
  localRemindersListeners.forEach((listener) => listener());
}

export function subscribeLocalReminders(listener: () => void) {
  localRemindersListeners.add(listener);
  return () => localRemindersListeners.delete(listener);
}

function getReminderKey(reminder: any) {
  if (!reminder || typeof reminder !== "object") return null;
  const id = reminder.id || reminder.reminderId;
  if (id) return String(id);
  return `${reminder.taskId || "task"}-${reminder.dueAt || reminder.scheduledAt || "no-date"}-${reminder.type || reminder.title || "reminder"}`;
}

export function buildReminderKey(reminder: any) {
  return getReminderKey(reminder);
}

function ensureDismissedSet(userId: string) {
  if (!dismissedReminderKeysStore[userId]) {
    dismissedReminderKeysStore[userId] = new Set<string>();
  }
  return dismissedReminderKeysStore[userId];
}

function markReminderDismissed(userId: string, reminder: any) {
  const key = getReminderKey(reminder);
  if (!userId || !key) return;
  ensureDismissedSet(userId).add(key);
}

function isReminderDismissed(userId: string, reminder: any) {
  const key = getReminderKey(reminder);
  if (!key) return false;
  return !!dismissedReminderKeysStore[userId]?.has(key);
}

function normalizeReminderForLocalStore(reminder: any) {
  const now = new Date().toISOString();
  const dueAt = reminder?.dueAt || reminder?.scheduledAt || now;
  const scheduledAt = reminder?.scheduledAt || reminder?.dueAt || dueAt;
  const generatedId = reminder?.id || reminder?.reminderId || `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  return {
    ...reminder,
    id: String(generatedId),
    dueAt,
    scheduledAt,
    title: reminder?.title || reminder?.type || "Recordatorio TaskLife",
    body: reminder?.body || reminder?.message || "Tienes una tarea pendiente.",
    status: reminder?.status || "pending",
  };
}

export function addLocalReminder(userId: string, reminder: any) {
  if (!userId) return;
  if (!localRemindersStore[userId]) localRemindersStore[userId] = [];
  const normalized = normalizeReminderForLocalStore(reminder);
  const nextKey = getReminderKey(normalized);
  if (!nextKey) return;
  if (localRemindersStore[userId].some((r) => getReminderKey(r) === nextKey)) return;
  localRemindersStore[userId].push(normalized);
  persistLocalReminders(userId);
  emitLocalRemindersUpdate();
}

export function getLocalReminders(userId: string) {
  return localRemindersStore[userId] ? [...localRemindersStore[userId]] : [];
}

export function removeLocalReminder(userId: string, reminderId: string) {
  if (!userId || !reminderId) return;
  if (!localRemindersStore[userId]) return;
  localRemindersStore[userId] = localRemindersStore[userId].filter((r) => r.id !== reminderId);
  persistLocalReminders(userId);
  emitLocalRemindersUpdate();
}

function removeLocalReminderByKey(userId: string, reminder: any) {
  if (!userId || !localRemindersStore[userId]) return;
  const key = getReminderKey(reminder);
  if (!key) return;
  localRemindersStore[userId] = localRemindersStore[userId].filter((r) => getReminderKey(r) !== key);
  persistLocalReminders(userId);
  emitLocalRemindersUpdate();
}

export async function dismissReminder(userId: string, reminder: any) {
  if (!userId || !reminder) return;

  markReminderDismissed(userId, reminder);
  removeLocalReminderByKey(userId, reminder);

  const reminderId = reminder?.id || reminder?.reminderId;
  if (!reminderId) return;

  try {
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/reminders/${encodeURIComponent(String(reminderId))}`;
    await apiFetch(url, { method: "DELETE" });
  } catch {
    // Best effort: if backend does not expose delete endpoint, we still keep it dismissed locally.
  }
}

export function removeExpiredReminders(userId: string, reminders: any[], graceMs = 90_000) {
  const now = Date.now();
  const active: any[] = [];

  reminders.forEach((reminder) => {
    const dueRaw = reminder?.dueAt || reminder?.scheduledAt;
    const dueMs = dueRaw ? new Date(dueRaw).getTime() : NaN;
    if (!Number.isFinite(dueMs)) {
      active.push(reminder);
      return;
    }

    if (dueMs <= now - graceMs) {
      markReminderDismissed(userId, reminder);
      removeLocalReminderByKey(userId, reminder);
      return;
    }

    active.push(reminder);
  });

  return active;
}

const handleResponse = async (res) => {
  const text = await res.text();

  let data = null;
  let parsedJson = false;
  try {
    data = text ? JSON.parse(text) : null;
    parsedJson = true;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const error = await parseApiError(res, text);
    throw error;
  }

  if (!parsedJson && text) {
    console.warn("⚠️ Respuesta no JSON recibida en éxito, devolviendo texto plano");
  }

  return data;
};

// ──────────────────────────────────────────────────────────
// GET - Obtener recordatorios pendientes (due)
// ──────────────────────────────────────────────────────────

export const obtenerRemindersDue = async (userId: string) => {
  try {
    if (!userId) throw new Error("userId es requerido");

    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/reminders/due`;
    console.log("🔔 Fetching due reminders from:", url);

    const res = await apiFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await handleResponse(res);
    const reminders = normalizeRemindersPayload(data);
    // Merge local fallback reminders (created on device when backend failed)
    const local = getLocalReminders(userId) || [];
    const merged = [...reminders, ...local].filter((item) => !isReminderDismissed(userId, item));
    console.log("✅ Due reminders fetched (backend+local):", merged.length);
    return merged;
  } catch (err: any) {
    console.error("❌ Error fetching due reminders:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────
// GET - Ejecutar recordatorios (mark as sent)
// ──────────────────────────────────────────────────────────

export const ejecutarReminders = async (userId: string) => {
  try {
    if (!userId) throw new Error("userId es requerido");

    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/reminders/run`;
    console.log("⚙️ Running reminders from:", url);

    const res = await apiFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleResponse(res);
  } catch (err: any) {
    console.error("❌ Error running reminders:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────
// POST - Crear un recordatorio (intenta backend, si falla devuelve objeto local)
// ──────────────────────────────────────────────────────────

export const crearReminder = async (userId: string, reminder: any) => {
  try {
    if (!userId) throw new Error("userId es requerido");

    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/reminders`;
    console.log("🔧 Creating reminder on backend:", url, reminder);

    const res = await apiFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    });

    const data = await handleResponse(res);
    // Normalizar respuesta: puede venir como array o como objeto wrapper
    let created = null as any;
    if (Array.isArray(data)) created = data[0] || null;
    else if (data && typeof data === "object") {
      // Si el backend devuelve { reminders: [...] } u otras envolturas
      const normalized = normalizeRemindersPayload(data);
      if (Array.isArray(normalized) && normalized.length > 0) created = normalized[0];
      else created = data;
    } else {
      created = data;
    }

    // Cache created reminders locally so the UI can show future reminders immediately.
    try {
      const cachedReminder = created || reminder;
      addLocalReminder(userId, cachedReminder);
    } catch (e) {
      // ignore
    }

    return created;
  } catch (err: any) {
    console.warn("⚠️ No se pudo crear reminder en backend, fallback local:", err?.message || err);
    // Fallback: return a local reminder object so the UI can schedule it
    const now = new Date().toISOString();
    const fallback = {
      id: reminder.id || `local-${Date.now()}`,
      title: reminder.title || reminder.type || "Recordatorio TaskLife",
      body: reminder.body || reminder.message || "Tienes una tarea pendiente.",
      dueAt: reminder.dueAt || reminder.scheduledAt || now,
      scheduledAt: reminder.scheduledAt || reminder.dueAt || now,
      status: reminder.status || "pending",
    };
    try {
      addLocalReminder(userId, fallback);
    } catch (e) {
      // ignore
    }
    return fallback;
  }
};
