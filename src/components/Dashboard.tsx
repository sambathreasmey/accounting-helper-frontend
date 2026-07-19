"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, FileText, ReceiptText, AlertTriangle } from "lucide-react";
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
        <div className="empty-state flex flex-col items-center justify-center gap-2">
          <AlertTriangle size={32} className="text-amber-500" />
          {error}
        </div>
      ) : (
        <div className="stats-grid">
          {ORDER.map((key, i) => (
            <div
              className={`stat-card ${key}`}
              key={key}
              style={{ animationDelay: `${i * 60}ms` }}
            >
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

      <div className="section-title-row flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2">
          <FileText size={20} className="text-slate-500" />
          <span>{t("recent_orders")}</span>
        </h2>
        {onViewAll ? (
          <button className="view-all-link flex items-center gap-0.5" onClick={onViewAll}>
            <span>{t("view_all")}</span>
            <ChevronRight size={16} />
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="po-list">
          <div className="empty-state flex flex-col items-center justify-center gap-2">
            <AlertTriangle size={32} className="text-amber-500" />
            {error}
          </div>
        </div>
      ) : (
        <POList
          items={data?.recent ?? []}
          loading={loading}
          emptyMessage={t("empty_dashboard")}
          emptyIcon={<ReceiptText size={32} className="text-slate-500" />}
          removingId={removingId}
          onOpen={(po) => onOpenPO(po.id)}
          onDelete={requestDelete}
          onRemoved={handleRemoved}
        />
      )}
    </section>
  );
}