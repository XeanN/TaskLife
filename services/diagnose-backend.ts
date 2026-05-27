/**
 * DIAGNÓSTICO DE CONEXIÓN AL BACKEND
 * Ejecutar este archivo para debuggear la conexión
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080";

console.log("═══════════════════════════════════════════════════════════");
console.log("🔍 DIAGNÓSTICO DE CONEXIÓN AL BACKEND");
console.log("═══════════════════════════════════════════════════════════");
console.log("");

console.log("1️⃣ CONFIGURACIÓN");
console.log("   API_URL:", API_URL);
console.log("   EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL || "NO CONFIGURADO");
console.log("");

console.log("2️⃣ AMBIENTE");
console.log("   Plataforma:", process.env.REACT_NATIVE_OS || "React Native");
console.log("");

export async function testConnection() {
  console.log("3️⃣ TESTANDO CONEXIÓN");
  console.log("");

  // Test 1: Health check
  console.log("   Test 1: Health check");
  try {
    const response = await fetch(`${API_URL}/health/firebase`);
    const text = await response.text();
    console.log("   ✅ Status:", response.status);
    console.log("   ✅ Response:", text);
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    console.log("");
    console.log("   ⚠️ POSIBLES CAUSAS:");
    console.log("      • Backend NO está corriendo en", API_URL);
    console.log("      • Firewall bloqueando la conexión");
    console.log("      • URL incorrecta");
    console.log("");
    console.log("   ✓ SOLUCIONES:");
    console.log("      1. Verifica que backend corre: curl", `${API_URL}/health/firebase`);
    console.log("      2. Si el backend está en otra IP, crea .env.local:");
    console.log("         EXPO_PUBLIC_API_URL=http://tu-ip-real:8080");
    console.log("      3. Reinicia Expo después de cambiar .env");
    return false;
  }

  console.log("");
  console.log("   Test 2: Listar áreas");
  try {
    const response = await fetch(`${API_URL}/areas`);
    const data = await response.json();
    console.log("   ✅ Áreas disponibles:", data.length);
    data.forEach((area: any) => {
      console.log(`      • ${area.label} (${area.id})`);
    });
  } catch (error: any) {
    console.error("   ❌ Error al obtener áreas:", error.message);
  }

  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ DIAGNÓSTICO COMPLETADO");
  console.log("═══════════════════════════════════════════════════════════");
}

// Ejecutar diagnóstico automáticamente
testConnection();
