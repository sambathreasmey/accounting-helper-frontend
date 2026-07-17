"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { MeData } from "@/lib/types";

export default function UserHeader() {
  const { t, lang } = useI18n();
  const [me, setMe] = useState<MeData | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<MeData>("/api/webapp/me")
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        // Non-critical — dashboard still works without the greeting.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!me) return null;

  const name = me.first_name || (lang === "km" ? "អ្នក" : "there");

  return (
    <header className="user-header">
      {me.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="user-avatar" src={me.photo_url} alt="" />
      ) : (
        <div className="user-avatar-fallback">🕶️</div>
      )}
      <div className="user-header-text">
        <div className="user-greeting">{t("greeting", name)}</div>
        <div className="user-sub">{t("subtitle")}</div>
      </div>
    </header>
  );
}
