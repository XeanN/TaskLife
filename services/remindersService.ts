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
    console.log("✅ Due reminders fetched:", reminders.length);
    return reminders;
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
