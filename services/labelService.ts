
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
// GET - Obtener etiquetas
// ──────────────────────────────────────────────────────────

export const obtenerEtiquetas = async (userId) => {
  try {
    if (!userId) throw new Error("userId es requerido");
    
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/labels`;
    console.log("📥 Fetching labels from:", url);
    
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await handleResponse(res);
    console.log("✅ Labels fetched:", data?.length || 0, "etiquetas");
    return data || [];
  } catch (err: any) {
    console.error("❌ Error fetching labels:", err.message);
    if (err.message.includes("Network") || err.message.includes("Failed")) {
      console.error("⚠️ No hay conexión al backend en", API_URL);
    }
    throw err;
  }
};

// Alias en inglés para compatibilidad
export const getLabels = obtenerEtiquetas;

// ──────────────────────────────────────────────────────────
// POST - Crear etiqueta
// ──────────────────────────────────────────────────────────

export const crearEtiqueta = async (userId, etiqueta) => {
  try {
    if (!userId) throw new Error("userId es requerido");
    
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/labels`;
    console.log("📤 Creating label at:", url, "with data:", etiqueta);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(etiqueta),
    });
    
    const data = await handleResponse(res);
    console.log("✅ Label created:", data);
    return data;
  } catch (err: any) {
    console.error("❌ Error creating label:", err.message);
    throw err;
  }
};

// Alias en inglés para compatibilidad
export const createLabel = crearEtiqueta;

// ──────────────────────────────────────────────────────────
// DELETE - Eliminar etiqueta
// ──────────────────────────────────────────────────────────

export const eliminarEtiqueta = async (userId, labelId) => {
  try {
    if (!userId) throw new Error("userId es requerido");
    if (!labelId) throw new Error("labelId es requerido");
    
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/labels/${labelId}`;
    console.log("🗑️  Deleting label at:", url);
    
    const res = await fetch(url, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      throw new Error("No se pudo eliminar la etiqueta");
    }
    
    console.log("✅ Label deleted");
    return true;
  } catch (err: any) {
    console.error("❌ Error deleting label:", err.message);
    throw err;
  }
};

// Alias en inglés para compatibilidad
export const deleteLabel = eliminarEtiqueta;
