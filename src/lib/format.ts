import type { Lang } from "./i18n";
import type { PO } from "./types";

export const STATUS_ICON: Record<string, string> = {
  pending: "⏳",
  dispatched: "🚀",
  completed: "✅",
  failed: "❌",
};

export function fmtDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  const locale = lang === "km" ? "km-KH" : undefined;
  return (
    d.toLocaleDateString(locale, { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
  );
}

export function poTotal(po: PO) {
  return po.items.reduce((sum, it) => sum + it.qty * it.price, 0).toFixed(2);
}
