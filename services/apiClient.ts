import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "TASKLIFE_BACKEND_ACCESS_TOKEN";

let backendAccessToken: string | null = null;
let loadPromise: Promise<string | null> | null = null;

async function readStoredToken(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    backendAccessToken = value && value.length ? value : null;
    return backendAccessToken;
  } catch (error) {
    console.warn("Could not load backend access token", error);
    return null;
  }
}

export async function loadBackendAccessToken(): Promise<string | null> {
  if (backendAccessToken !== null) return backendAccessToken;
  if (!loadPromise) {
    loadPromise = readStoredToken().finally(() => {
      loadPromise = null;
    });
  }
  return loadPromise;
}

export async function setBackendAccessToken(token: string | null) {
  try {
    backendAccessToken = token && token.length ? token : null;
    if (backendAccessToken) {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, backendAccessToken);
    } else {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch (error) {
    console.warn("Could not persist backend access token", error);
  }
}

export async function clearBackendAccessToken() {
  await setBackendAccessToken(null);
}

function normalizeHeaders(headersInit?: HeadersInit) {
  const headers = new Headers(headersInit ?? {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  return headers;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await loadBackendAccessToken();
  const headers = normalizeHeaders(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
