"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { LayoutDashboard, History } from "lucide-react"; // 1. Import the vector icons
import { useI18n } from "@/lib/i18n";
import { haptic } from "@/lib/telegram";

export type TabKey = "dashboard" | "history";

// 2. Define a type safe array structure for the layout components
interface TabConfig {
  key: TabKey;
  Icon: React.ComponentType<{ size?: number | string; className?: string }>;
  labelKey: string;
}

export default function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const { t, lang } = useI18n();

  // 3. Swapped emojis for component references
  const tabs: TabConfig[] = [
    { key: "dashboard", Icon: LayoutDashboard, labelKey: "tab_dashboard" },
    { key: "history", Icon: History, labelKey: "tab_history" },
  ];

  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const measure = () => {
    const nav = navRef.current;
    const el = tabRefs.current[active];
    if (!nav || !el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicator({ left: elRect.left - navRect.left, width: elRect.width });
  };

  // Re-measure whenever the active tab or visible language changes
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lang]);

  // Re-measure on mount, on resize, once web fonts finish swapping in
  // (Khmer glyphs load separately and can reflow tab width after first paint),
  // and whenever a tab's own size changes for any other reason.
  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && navRef.current) {
      observer = new ResizeObserver(measure);
      observer.observe(navRef.current);
      Object.values(tabRefs.current).forEach((el) => el && observer!.observe(el));
    }

    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className="tabbar" ref={navRef}>
      {indicator ? (
        <div
          className="tab-indicator"
          style={{
            width: `${indicator.width}px`,
            transform: `translateX(${indicator.left}px)`,
          }}
        />
      ) : null}

      {tabs.map(({ key, Icon, labelKey }) => {
        const isActive = active === key;

        return (
          <button
            key={key}
            ref={(el) => {
              tabRefs.current[key] = el;
            }}
            className={`tab${isActive ? " active" : ""}`}
            onClick={() => {
              haptic("light");
              onChange(key);
            }}
          >
            {/* 4. Render the component dynamically with a sleek line weight */}
            <span className="tab-icon">
              <Icon size={18} />
            </span>
            <span>{t(labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}