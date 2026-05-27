import AsyncStorage from '@react-native-async-storage/async-storage';

const OVERRIDE_KEY = 'TASKLIFE_API_URL_OVERRIDE';

let overrideUrl: string | null = null;

export async function loadApiUrlOverride(): Promise<string | null> {
  try {
    const v = await AsyncStorage.getItem(OVERRIDE_KEY);
    overrideUrl = v && v.length ? v : null;
    return overrideUrl;
  } catch (e) {
    console.warn('Could not load API override', e);
    return null;
  }
}

export async function setApiUrlOverride(url: string | null) {
  try {
    overrideUrl = url && url.length ? url : null;
    if (overrideUrl) {
      await AsyncStorage.setItem(OVERRIDE_KEY, overrideUrl);
    } else {
      await AsyncStorage.removeItem(OVERRIDE_KEY);
    }
  } catch (e) {
    console.warn('Could not save API override', e);
  }
}

export function getApiUrlDefault() {
  return process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';
}

export function getApiUrl() {
  return overrideUrl || getApiUrlDefault();
}

// Init: attempt to load override as soon as the module is imported
// This reduces the chance that other services read the default URL
// before the override is loaded.
loadApiUrlOverride().catch(() => {});
