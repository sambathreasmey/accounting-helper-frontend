"use client";

import React, { useCallback, useEffect, useState } from "react";
import { 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  AlertTriangle, 
  Search 
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useDeletePO } from "@/lib/useDeletePO";
import { haptic } from "@/lib/telegram";
import POList from "./POList";
import type { HistoryData, PO, POStatus } from "@/lib/types";

const PAGE_SIZE = 20;

interface FilterConfig {
  status: "" | POStatus;
  Icon: React.ComponentType<{ size?: number | string; className?: string }>;
  labelKey: string;
  themeClass: string; 
}

const FILTERS: FilterConfig[] = [
  { status: "", Icon: Layers, labelKey: "filter_all", themeClass: "filter-all" },
  { status: "pending", Icon: Clock, labelKey: "status_pending", themeClass: "filter-pending" },
  { status: "dispatched", Icon: RefreshCw, labelKey: "status_dispatched", themeClass: "filter-dispatched" },
  { status: "completed", Icon: CheckCircle2, labelKey: "status_completed", themeClass: "filter-completed" },
  { status: "failed", Icon: XCircle, labelKey: "status_failed", themeClass: "filter-failed" },
];

export default function History({ onOpenPO }: { onOpenPO: (id: string) => void }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<"" | POStatus>("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
      if (status) q.set("status", status);
      const res = await api<HistoryData>(`/api/webapp/history?${q.toString()}`);
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const { removingId, requestDelete, finalizeRemoval } = useDeletePO(load);

  const handleRemoved = (_po: PO) => {
    finalizeRemoval();
  };

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <section className="tab-panel active">
      <div className="filters" id="status-filters">
        {FILTERS.map(({ status: filterStatus, Icon, labelKey, themeClass }, i) => {
          const isActive = status === filterStatus;

          return (
            <button
              key={filterStatus}
              className={`chip ${themeClass} ${isActive ? "active" : ""}`}
              style={{ animationDelay: `${i * 45}ms` }}
              onClick={() => {
                haptic("light");
                setStatus(filterStatus);
                setPage(1);
              }}
            >
              <Icon
                size={14}
                className={`shrink-0 icon-glyph ${filterStatus === "dispatched" && isActive ? "animate-spin-slow" : ""}`}
              />
              <span className="truncate">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="po-list">
          <div className="empty-state flex flex-col items-center justify-center gap-2">
            <AlertTriangle size={32} className="text-amber-500 animate-pulse" />
            {error}
          </div>
        </div>
      ) : (
        <>
          <POList
            items={data?.items ?? []}
            loading={loading}
            emptyMessage={t("empty_history")}
            emptyIcon={<Search size={32} className="text-slate-500 empty-icon" />}
            removingId={removingId}
            onOpen={(po) => onOpenPO(po.id)}
            onDelete={requestDelete}
            onRemoved={handleRemoved}
          />
          <div className="pager">
            <button
              disabled={page <= 1}
              onClick={() => {
                haptic("light");
                setPage((p) => p - 1);
              }}
            >
              {t("prev")}
            </button>
            <span style={{ color: "var(--hint)", fontSize: 13 }}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => {
                haptic("light");
                setPage((p) => p + 1);
              }}
            >
              {t("next")}
            </button>
          </div>
        </>
      )}
    </section>
  );
}