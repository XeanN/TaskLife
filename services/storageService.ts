import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Tema ──────────────────────────────────────────────────

export async function getThemePreference(): Promise<"dark" | "light" | null> {
  const val = await AsyncStorage.getItem("theme");
  if (val === "dark" || val === "light") return val;
  return null;
}

export async function saveThemePreference(dark: boolean) {
  await AsyncStorage.setItem("theme", dark ? "dark" : "light");
}

// ── Notificaciones ────────────────────────────────────────

export type NotifPrefs = {
  tasks_due: boolean;
  daily_recap: boolean;
  completed: boolean;
};

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  tasks_due: true,
  daily_recap: false,
  completed: false,
};

export async function getNotifPreferences(): Promise<NotifPrefs> {
  const val = await AsyncStorage.getItem("notif_prefs");
  if (val) return JSON.parse(val) as NotifPrefs;
  return DEFAULT_NOTIF_PREFS;
}

export async function saveNotifPreferences(prefs: NotifPrefs) {
  await AsyncStorage.setItem("notif_prefs", JSON.stringify(prefs));
}
