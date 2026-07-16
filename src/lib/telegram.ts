"use client";

// Thin wrapper around window.Telegram.WebApp so the rest of the app never
// has to worry about it being undefined (e.g. when previewing in a normal
// browser tab during development).

export type HapticType = "light" | "medium" | "heavy" | "rigid" | "soft";

function tg() {
  if (typeof window === "undefined") return undefined;
  return (window as any).Telegram?.WebApp;
}

export function initTelegram() {
  const w = tg();
  w?.ready?.();
  w?.expand?.();
  w?.setHeaderColor?.("secondary_bg_color");
  w?.disableVerticalSwipes?.();
}

export function getInitData(): string {
  return tg()?.initData || "";
}

export function getInitDataUnsafeUser(): { language_code?: string } | undefined {
  return tg()?.initDataUnsafe?.user;
}

export function haptic(type: HapticType = "light") {
  tg()?.HapticFeedback?.impactOccurred?.(type);
}

export function getColorScheme(): "light" | "dark" | undefined {
  return tg()?.colorScheme;
}

export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const w = tg();
    if (w?.showConfirm) {
      w.showConfirm(message, (ok: boolean) => resolve(!!ok));
    } else if (typeof window !== "undefined") {
      resolve(window.confirm(message));
    } else {
      resolve(false);
    }
  });
}
