import React from "react";
import { Clock, Send, CheckCircle2, XCircle } from "lucide-react";
import type { Lang } from "./i18n";
import type { PO } from "./types";

// Explicitly typed as ReactNode so it can store fully instantiated JSX elements.
// No color classes here — each icon inherits `currentColor` from the .badge
// (or wherever it's rendered), which already sets the correct status color
// via CSS variables in global.css. This avoids depending on Tailwind's
// default palette (text-amber-500 etc.), which may not be configured.
export const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock size={13} strokeWidth={2.5} />,
  dispatched: <Send size={13} strokeWidth={2.5} />,
  completed: <CheckCircle2 size={13} strokeWidth={2.5} />,
  failed: <XCircle size={13} strokeWidth={2.5} />,
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