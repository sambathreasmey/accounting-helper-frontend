"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getColorScheme } from "./telegram";

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("po_theme") as Mode | null;
    const initial = stored || getColorScheme() || "dark";
    setMode(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: Mode = prev === "light" ? "dark" : "light";
      window.localStorage.setItem("po_theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ mode, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
