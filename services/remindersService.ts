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

// Local fallback store for reminders created client-side when backend is unreachable
const localRemindersStore: Record<string, any[]> = {};

export function addLocalReminder(userId: string, reminder: any) {
  if (!userId) return;
  if (!localRemindersStore[userId]) localRemindersStore[userId] = [];
  // Avoid duplicates by id
  if (localRemindersStore[userId].some((r) => r.id === reminder.id)) return;
  localRemindersStore[userId].push(reminder);
}

export function getLocalReminders(userId: string) {
  return localRemindersStore[userId] ? [...localRemindersStore[userId]] : [];
}

export function removeLocalReminder(userId: string, reminderId: string) {
  if (!userId || !reminderId) return;
  if (!localRemindersStore[userId]) return;
  localRemindersStore[userId] = localRemindersStore[userId].filter((r) => r.id !== reminderId);
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
    const error = await parseApiError(res);
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

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await handleResponse(res);
    const reminders = normalizeRemindersPayload(data);
    // Merge local fallback reminders (created on device when backend failed)
    const local = getLocalReminders(userId) || [];
    const merged = [...reminders, ...local];
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

    const res = await fetch(url, {
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

    const res = await fetch(url, {
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

    // If we created a reminder on backend, remove matching local fallback if present
    try {
      const createdId = created?.id || reminder.id;
      if (createdId) {
        removeLocalReminder(userId, createdId);
      }
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
