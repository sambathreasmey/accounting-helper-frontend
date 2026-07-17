"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useI18n, STATUS_KEY } from "@/lib/i18n";
import { STATUS_ICON } from "@/lib/format";
import { useDeletePO } from "@/lib/useDeletePO";
import POList, { Skeleton } from "./POList";
import type { DashboardData, PO } from "@/lib/types";

const ORDER: Array<keyof DashboardData["counts"]> = ["pending", "dispatched", "completed", "failed"];

export default function Dashboard({
  onOpenPO,
  onViewAll,
}: {
  onOpenPO: (id: string) => void;
  onViewAll?: () => void;
}) {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<DashboardData>("/api/webapp/dashboard");
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { removingId, requestDelete, finalizeRemoval } = useDeletePO(load);

  const handleRemoved = (po: PO) => {
    finalizeRemoval();
  };

  return (
    <section className="tab-panel active">
      {loading ? (
        <div className="stats-grid">
          <Skeleton count={4} className="skeleton-stat" />
        </div>
      ) : error ? (
        <div className="empty-state">
          <span className="empty-icon">⚠️</span>
          {error}
        </div>
      ) : (
        <div className="stats-grid">
          {ORDER.map((key) => (
            <div className={`stat-card ${key}`} key={key}>
              <div className="stat-icon">{STATUS_ICON[key as string]}</div>
              <div className="stat-info">
                <div className="stat-value">{data?.counts[key] ?? 0}</div>
                <div className="stat-label">{t(STATUS_KEY[key as string])}</div>
                <span className="stat-underline" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-title-row">
        <h2 className="section-title">📄 {t("recent_orders")}</h2>
        {onViewAll ? (
          <button className="view-all-link" onClick={onViewAll}>
            {t("view_all")} ›
          </button>
        ) : null}
      </div>
      {error ? (
        <div className="po-list">
          <div className="empty-state">
            <span className="empty-icon">⚠️</span>
            {error}
          </div>
        </div>
      ) : (
        <POList
          items={data?.recent ?? []}
          loading={loading}
          emptyMessage={t("empty_dashboard")}
          emptyIcon="🧾"
          removingId={removingId}
          onOpen={(po) => onOpenPO(po.id)}
          onDelete={requestDelete}
          onRemoved={handleRemoved}
        />
      )}
    </section>
  );
}
