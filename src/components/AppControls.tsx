"use client";

import { Languages, Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { haptic } from "@/lib/telegram";

export default function AppControls() {
  const { lang, setLang } = useI18n();
  const { mode, toggle } = useTheme();

  return (
    <div id="app-controls" className="flex items-center gap-2">
      <button
        id="lang-toggle"
        className="icon-btn flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium"
        title="Language"
        onClick={() => {
          haptic("light");
          setLang(lang === "km" ? "en" : "km");
        }}
      >
        <Languages size={16} className="text-slate-500" />
        <span key={lang} className="uppercase text-xs icon-pop-in">{lang === "km" ? "kh" : "en"}</span>
      </button>

      <button
        id="theme-toggle"
        className="icon-btn flex items-center justify-center p-2 rounded-md"
        title="Theme"
        onClick={() => {
          haptic("light");
          toggle();
        }}
      >
        <span key={mode} className="icon-pop-in">
          {mode === "light" ? (
            <Sun size={18} className="text-amber-500 transition-all" />
          ) : (
            <Moon size={18} className="text-indigo-400 transition-all" />
          )}
        </span>
      </button>
    </div>
  );
}