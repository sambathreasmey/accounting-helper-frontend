"use client";

import { useEffect } from "react";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/lib/toast";
import { initTelegram } from "@/lib/telegram";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
