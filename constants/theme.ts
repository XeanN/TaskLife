import { Platform } from "react-native";

const tintColorLight = "#4A7FA5";
const tintColorDark = "#5B9EC9";

export const Colors = {
  light: {
    text: "#1A1A2E",
    background: "#F0F4F8",
    tint: tintColorLight,
    icon: "#6B7280",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#F0F4F8",
    background: "#0F1117",
    tint: tintColorDark,
    icon: "#9AA5B4",
    tabIconDefault: "#9AA5B4",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});
