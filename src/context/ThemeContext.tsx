import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

// ─── Paletas ──────────────────────────────────────────────
export const LIGHT = {
  bg: "#E9ECEF",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textSecond: "#6B7280",
  border: "#F0F0F0",
  primary: "#3F7EA6",
  inputBg: "#F5F5F5",
  tabBar: "#FFFFFF",
  headerBg: "#FFFFFF",
  iconBg: "#EAF4FB",
  gold: "#C58B00",
  goldBg: "#FDF3DC",
};

export const DARK = {
  bg: "#0F1117",
  card: "#1E2130",
  text: "#F0F4F8",
  textSecond: "#9AA5B4",
  border: "#2D3248",
  primary: "#5B9EC9",
  inputBg: "#2D3248",
  tabBar: "#161927",
  headerBg: "#161927",
  iconBg: "#1A2A3A",
  gold: "#E0A94A",
  goldBg: "#2A2010",
};

export type Theme = typeof LIGHT;

// ─── Context ──────────────────────────────────────────────
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

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    AsyncStorage.getItem("theme").then((val) => {
      if (val === "dark") setDark(true);
    });
  }, []);

  const toggle = async () => {
    const next = !dark;
    setDark(next);
    await AsyncStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ dark, theme: dark ? DARK : LIGHT, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
