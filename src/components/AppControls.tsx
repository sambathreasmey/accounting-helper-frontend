"use client";

import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { haptic } from "@/lib/telegram";

export default function AppControls() {
  const { lang, setLang } = useI18n();
  const { mode, toggle } = useTheme();

  return (
    <div id="app-controls">
      <button
        id="lang-toggle"
        className="icon-btn"
        title="Language"
        onClick={() => {
          haptic("light");
          setLang(lang === "km" ? "en" : "km");
        }}
      >
        {lang === "km" ? "KH" : "EN"}
      </button>
      <button
        id="theme-toggle"
        className="icon-btn"
        title="Theme"
        onClick={() => {
          haptic("light");
          toggle();
        }}
      >
        {mode === "light" ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
