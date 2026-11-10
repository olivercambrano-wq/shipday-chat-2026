import { createContext, useContext, useState, useCallback } from "react";

export type Theme = {
  mode: "light" | "dark";
  font: string;
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentText: string;
  inputBg: string;
  overlayBg: string;
  cardShadow: string;
};

export const lightTheme: Theme = {
  mode: "light",
  font: "inherit",
  bg: "#FFFFFF",
  bgSecondary: "#F8F8F5",
  bgTertiary: "#F7F7FA",
  surface: "#FFFFFF",
  surfaceHover: "#F9FAFB",
  border: "#E8E8E4",
  borderLight: "#F0F0EC",
  text: "#0A0A0A",
  textSecondary: "#404040",
  textMuted: "#737373",
  accent: "#008062",
  accentLight: "#EBFEF6",
  accentText: "#03624C",
  inputBg: "#FFFFFF",
  overlayBg: "rgba(0,0,0,0.45)",
  cardShadow: "0px 4px 6px -1px rgba(0,0,0,0.05), 0px 20px 50px -12px rgba(0,0,0,0.15)",
};

export const darkTheme: Theme = {
  mode: "dark",
  font: "inherit",
  bg: "#0F0F0F",
  bgSecondary: "#0A0A0A",
  bgTertiary: "#2A2A2A",
  surface: "#1A1A1A",
  surfaceHover: "#222222",
  border: "#2E2E2E",
  borderLight: "#262626",
  text: "#F5F5F5",
  textSecondary: "#B0B0B0",
  textMuted: "#808080",
  accent: "#008062",
  accentLight: "rgba(1,173,133,0.12)",
  accentText: "#4ADE80",
  inputBg: "#252525",
  overlayBg: "rgba(30,30,30,0.92)",
  cardShadow: "0px 4px 6px -1px rgba(0,0,0,0.3), 0px 20px 50px -12px rgba(0,0,0,0.5)",
};

type ThemeContextValue = { theme: Theme; toggle: () => void };
const ThemeCtx = createContext<ThemeContextValue>({ theme: lightTheme, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const toggle = useCallback(() => setDark(d => !d), []);
  const theme = dark ? darkTheme : lightTheme;
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() { return useContext(ThemeCtx).theme; }
export function useThemeToggle() { return useContext(ThemeCtx); }
