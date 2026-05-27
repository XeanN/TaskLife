import { parseApiError } from "./errorHandler";
import { getApiUrl } from "./runtimeConfig";

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
// GET - Obtener estadísticas generales
// ──────────────────────────────────────────────────────────

export const obtenerStats = async (userId: string) => {
  try {
    if (!userId) throw new Error("userId es requerido");

    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/stats`;
    console.log("📊 Fetching stats from:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleResponse(res);
  } catch (err: any) {
    console.error("❌ Error fetching stats:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────
// GET - Obtener reporte semanal
// ──────────────────────────────────────────────────────────

export const obtenerWeeklyReport = async (userId: string) => {
  try {
    if (!userId) throw new Error("userId es requerido");

    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/weekly-report`;
    console.log("📈 Fetching weekly report from:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleResponse(res);
  } catch (err: any) {
    console.error("❌ Error fetching weekly report:", err.message);
    throw err;
  }
};
