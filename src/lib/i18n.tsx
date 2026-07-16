"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getInitDataUnsafeUser } from "./telegram";

export type Lang = "en" | "km";

type StringValue = string | ((...args: any[]) => string);

const STRINGS: Record<Lang, Record<string, StringValue>> = {
  en: {
    subtitle: "Purchase order dashboard",
    greeting: (name: string) => `Hi, ${name} 👋`,
    tab_dashboard: "Dashboard",
    tab_history: "History",
    recent_orders: "Recent Orders",
    filter_all: "All",
    status_pending: "Pending",
    status_dispatched: "In Progress",
    status_completed: "Completed",
    status_failed: "Failed",
    empty_dashboard: "No purchase orders yet — send one to the bot.",
    empty_history: "No orders match this filter.",
    prev: "← Prev",
    next: "Next →",
    total: "Total",
    open_document: "📄 Open generated document",
    not_editable: (status: string) => `This order is ${status}; it can be edited once it completes or fails.`,
    add_item: "+ Add item",
    regenerate: "🔁 Regenerate",
    sending: "Sending…",
    regenerate_success: "Regeneration triggered ✅",
    add_valid_item: "Add at least one valid item",
    no_order_loaded: "No order loaded",
    po_id_label: "PO ID",
    supplier_label: "Supplier",
    supplier_placeholder: "Supplier name",
    col_item: "Item",
    col_qty: "Qty",
    col_unit: "Unit",
    col_price: "Price",
    delete: "Delete",
    delete_confirm_title: "Delete purchase order?",
    delete_confirm_body: (id: string) => `"${id}" will be permanently deleted. This can't be undone.`,
    deleting: "Deleting…",
    delete_success: "Order deleted",
    delete_failed: "Couldn't delete order",
  },
  km: {
    subtitle: "ផ្ទាំងគ្រប់គ្រងបញ្ជាទិញ",
    greeting: (name: string) => `សួស្តី ${name} 👋`,
    tab_dashboard: "ផ្ទាំងគ្រប់គ្រង",
    tab_history: "ប្រវត្តិ",
    recent_orders: "បញ្ជាទិញថ្មីៗ",
    filter_all: "ទាំងអស់",
    status_pending: "កំពុងរង់ចាំ",
    status_dispatched: "កំពុងដំណើរការ",
    status_completed: "បានបញ្ចប់",
    status_failed: "បរាជ័យ",
    empty_dashboard: "មិនទាន់មានបញ្ជាទិញនៅឡើយទេ — សូមផ្ញើមួយទៅកាន់ bot",
    empty_history: "គ្មានបញ្ជាទិញត្រូវនឹងតម្រងនេះទេ",
    prev: "← មុន",
    next: "បន្ទាប់ →",
    total: "សរុប",
    open_document: "📄 បើកឯកសារដែលបានបង្កើត",
    not_editable: (status: string) => `បញ្ជាទិញនេះស្ថិតក្នុងស្ថានភាព ${status}; អាចកែសម្រួលបានបន្ទាប់ពីវាបញ្ចប់ ឬបរាជ័យ`,
    add_item: "+ បន្ថែមទំនិញ",
    regenerate: "🔁 បង្កើតឡើងវិញ",
    sending: "កំពុងផ្ញើ…",
    regenerate_success: "បានបញ្ជូនសំណើបង្កើតឡើងវិញ ✅",
    add_valid_item: "សូមបន្ថែមទំនិញត្រឹមត្រូវយ៉ាងហោចណាស់មួយ",
    no_order_loaded: "មិនមានបញ្ជាទិញផ្ទុក",
    po_id_label: "លេខបញ្ជាទិញ",
    supplier_label: "អ្នកផ្គត់ផ្គង់",
    supplier_placeholder: "ឈ្មោះអ្នកផ្គត់ផ្គង់",
    col_item: "ទំនិញ",
    col_qty: "បរិមាណ",
    col_unit: "ឯកតា",
    col_price: "តម្លៃ",
    delete: "លុប",
    delete_confirm_title: "លុបបញ្ជាទិញនេះ?",
    delete_confirm_body: (id: string) => `"${id}" នឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍ ។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`,
    deleting: "កំពុងលុប…",
    delete_success: "បានលុបបញ្ជាទិញ",
    delete_failed: "មិនអាចលុបបញ្ជាទិញបានទេ",
  },
};

export const STATUS_KEY: Record<string, string> = {
  pending: "status_pending",
  dispatched: "status_dispatched",
  completed: "status_completed",
  failed: "status_failed",
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, ...args: any[]) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("po_lang") as Lang | null;
    if (stored === "en" || stored === "km") {
      setLangState(stored);
    } else {
      const tgLang = getInitDataUnsafeUser()?.language_code;
      setLangState(tgLang === "km" ? "km" : "en");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "km" ? "km" : "en";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem("po_lang", next);
  }, []);

  const t = useCallback(
    (key: string, ...args: any[]) => {
      const entry = STRINGS[lang][key] ?? STRINGS.en[key];
      return typeof entry === "function" ? entry(...args) : entry;
    },
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
