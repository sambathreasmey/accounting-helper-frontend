"use client";

import { useI18n } from "@/lib/i18n";
import { haptic } from "@/lib/telegram";

export type TabKey = "dashboard" | "history";

export default function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const { t } = useI18n();

  const tabs: { key: TabKey; icon: string; labelKey: string }[] = [
    { key: "dashboard", icon: "📊", labelKey: "tab_dashboard" },
    { key: "history", icon: "🗂️", labelKey: "tab_history" },
  ];

  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab${active === tab.key ? " active" : ""}`}
          onClick={() => {
            haptic("light");
            onChange(tab.key);
          }}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span>{t(tab.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
