import {
    getThemePreference,
    saveThemePreference,
} from "@/services/storageService";
import { createContext, useContext, useEffect, useState } from "react";

// ── Paletas ───────────────────────────────────────────────

export const LIGHT = {
  bg: "#F0F4F8",
  card: "#FFFFFF",
  cardAlt: "#F7FAFC",
  text: "#1A1A2E",
  textSecond: "#6B7280",
  textThird: "#9CA3AF",
  border: "#E8EDF2",
  primary: "#4A7FA5",
  primaryLight: "#EAF4FB",
  inputBg: "#F5F8FA",
  tabBar: "#FFFFFF",
  headerBg: "#FFFFFF",
  iconBg: "#EAF4FB",
  gold: "#C58B00",
  goldBg: "#FDF3DC",
  success: "#38A169",
  successBg: "#F0FFF4",
  danger: "#E53E3E",
  dangerBg: "#FFF5F5",
  shadow: "#000000",
};

export const DARK = {
  bg: "#0F1117",
  card: "#1A1D2E",
  cardAlt: "#141728",
  text: "#F0F4F8",
  textSecond: "#9AA5B4",
  textThird: "#6B7280",
  border: "#2D3248",
  primary: "#5B9EC9",
  primaryLight: "#1A2A3A",
  inputBg: "#1E2235",
  tabBar: "#13151F",
  headerBg: "#13151F",
  iconBg: "#1A2A3A",
  gold: "#E0A94A",
  goldBg: "#2A2010",
  success: "#48BB78",
  successBg: "#1A2E22",
  danger: "#FC8181",
  dangerBg: "#2D1515",
  shadow: "#000000",
};

export type Theme = typeof LIGHT;

type ThemeCtx = {
  dark: boolean;
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  dark: false,
  theme: LIGHT,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getThemePreference().then((val) => {
      if (val === "dark") setDark(true);
      setReady(true);
    });
  }, []);

  const toggle = async () => {
    const next = !dark;
    setDark(next);
    await saveThemePreference(next);
  };

  // No renderiza hasta saber el tema guardado (evita flash)
  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ dark, theme: dark ? DARK : LIGHT, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
