
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
// GET - Obtener tareas
// ──────────────────────────────────────────────────────────

export const obtenerTareas = async (userId, areaId) => {
  try {
    if (!userId) throw new Error("userId es requerido");
    if (!areaId) throw new Error("areaId es requerido");
    
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/areas/${areaId}/tasks`;
    console.log("📥 Fetching tasks from:", url);

    // Retry on 429 with backoff: 2s, 5s, 10s (max 3 attempts)
    const backoffMs = [2000, 5000, 10000];
    let attempt = 0;
    while (true) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await handleResponse(res);
        console.log("✅ Tasks fetched:", data?.length || 0, "tareas");
        return data || [];
      } catch (err: any) {
        // If quota exceeded, retry with backoff up to max retries
        const isQuota = err?.message && err.message.toLowerCase().includes("quota");
        attempt += 1;
        if (isQuota && attempt <= backoffMs.length) {
          const wait = backoffMs[attempt - 1];
          console.warn(`⚠️ 429 received, retrying in ${wait}ms (attempt ${attempt})`);
          await new Promise((r) => setTimeout(r, wait));
          continue; // retry
        }
        // rethrow for other errors or if out of retries
        throw err;
      }
    }
  } catch (err: any) {
    console.error("❌ Error fetching tasks:", err.message);
    if (err.message.includes("Network") || err.message.includes("Failed")) {
      console.error("⚠️ No hay conexión al backend. Verifica que:");
      console.error("   1. El backend está corriendo en", API_URL);
      console.error("   2. La URL es correcta (revisa .env.example)");
    }
    throw err;
  }
};

// Alias en inglés para compatibilidad con controladores
export const getTasks = obtenerTareas;

// ──────────────────────────────────────────────────────────
// POST - Crear tarea
// ──────────────────────────────────────────────────────────

export const crearTarea = async (userId, areaId, tarea) => {
  try {
    if (!userId) throw new Error("userId es requerido");
    if (!areaId) throw new Error("areaId es requerido");
    
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/areas/${areaId}/tasks`;
    console.log("📤 Creating task at:", url, "with data:", tarea);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tarea),
    });
    
    const data = await handleResponse(res);
    console.log("✅ Task created:", data);
    return data;
  } catch (err: any) {
    console.error("❌ Error creating task:", err.message);
    if (err.message.includes("Network") || err.message.includes("Failed")) {
      console.error("⚠️ No hay conexión al backend en", API_URL);
    }
    throw err;
  }
};

// Alias en inglés para compatibilidad con controladores
export const createTask = crearTarea;

// ──────────────────────────────────────────────────────────
// PUT - Actualizar tarea
// ──────────────────────────────────────────────────────────

export const actualizarTarea = async (userId, areaId, taskId, cambios) => {
  try {
    if (!userId) throw new Error("userId es requerido");
    if (!areaId) throw new Error("areaId es requerido");
    if (!taskId) throw new Error("taskId es requerido");
    
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/areas/${areaId}/tasks/${taskId}`;
    console.log("📝 Updating task at:", url, "with data:", cambios);
    
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cambios),
    });
    
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
      console.error("❌ UPDATE TASK ERROR:");
      console.error("   Status:", res.status);
      console.error("   URL:", url);
      console.error("   Payload:", cambios);
      console.error("   Response:", data || text);
      throw new Error(
        typeof data === "string" ? data : data?.message || text || `Error HTTP ${res.status}`,
      );
    }
    
    if (!parsedJson && text) {
      console.warn("⚠️ Respuesta no JSON recibida en éxito, devolviendo texto plano");
    }

    console.log("✅ Task updated:", data);
    return data;
  } catch (err: any) {
    console.error("❌ Error updating task:", err.message);
    throw err;
  }
};

// Alias en inglés para compatibilidad con controladores
export const updateTask = actualizarTarea;

// ──────────────────────────────────────────────────────────
// PATCH - Toggle tarea (marcar como done/pending)
// ──────────────────────────────────────────────────────────

export const toggleTask = async (userId, areaId, taskId, done) => {
  try {
    if (!userId) throw new Error("userId es requerido");
    if (!areaId) throw new Error("areaId es requerido");
    if (!taskId) throw new Error("taskId es requerido");
    
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/${userId}/areas/${areaId}/tasks/${taskId}`;
    const payload = { done };
    console.log("🔄 Toggling task at:", url, "payload:", payload);
    
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
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
      console.error("❌ TOGGLE TASK ERROR:");
      console.error("   Status:", res.status);
      console.error("   URL:", url);
      console.error("   Payload:", payload);
      console.error("   Response:", data || text);
      throw new Error(
        typeof data === "string" ? data : data?.message || text || `Error HTTP ${res.status}`,
      );
    }
    
    if (!parsedJson && text) {
      console.warn("⚠️ Respuesta no JSON recibida en éxito, devolviendo texto plano");
    }

    console.log("✅ Task toggled:", data);
    return data;
  } catch (err: any) {
    console.error("❌ Error toggling task:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────
// DELETE - Eliminar tarea
// ──────────────────────────────────────────────────────────

export const eliminarTarea = async (userId, areaId, taskId) => {
  try {
    if (!userId) throw new Error("userId es requerido");
    if (!areaId) throw new Error("areaId es requerido");
    if (!taskId) throw new Error("taskId es requerido");
    
    const url = `${API_URL}/users/${userId}/areas/${areaId}/tasks/${taskId}`;
    console.log("🗑️  Deleting task at:", url);
    
    const res = await fetch(url, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      throw new Error("No se pudo eliminar la tarea");
    }
    
    console.log("✅ Task deleted");
    return true;
  } catch (err: any) {
    console.error("❌ Error deleting task:", err.message);
    throw err;
  }
};

// Alias en inglés para compatibilidad con controladores
export const deleteTask = eliminarTarea;
