"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useDeletePO } from "@/lib/useDeletePO";
import { haptic } from "@/lib/telegram";
import POList from "./POList";
import type { HistoryData, PO, POStatus } from "@/lib/types";

const PAGE_SIZE = 20;

const FILTERS: { status: "" | POStatus; icon: string; labelKey: string }[] = [
  { status: "", icon: "", labelKey: "filter_all" },
  { status: "pending", icon: "⏳", labelKey: "status_pending" },
  { status: "dispatched", icon: "🚀", labelKey: "status_dispatched" },
  { status: "completed", icon: "✅", labelKey: "status_completed" },
  { status: "failed", icon: "❌", labelKey: "status_failed" },
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
        {FILTERS.map((f) => (
          <button
            key={f.status}
            className={`chip${status === f.status ? " active" : ""}`}
            onClick={() => {
              haptic("light");
              setStatus(f.status);
              setPage(1);
            }}
          >
            {f.icon ? `${f.icon} ` : ""}
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {error ? (
        <div className="po-list">
          <div className="empty-state">
            <span className="empty-icon">⚠️</span>
            {error}
          </div>
        </div>
      ) : (
        <>
          <POList
            items={data?.items ?? []}
            loading={loading}
            emptyMessage={t("empty_history")}
            emptyIcon="🔎"
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
