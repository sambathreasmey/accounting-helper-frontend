"use client";

import { useState, useCallback } from "react";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { useToast } from "./toast";
import { haptic, showConfirm } from "./telegram";
import type { PO } from "./types";

export function useDeletePO(onDeleted: () => void) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const requestDelete = useCallback(
    async (po: PO) => {
      haptic("medium");
      const ok = await showConfirm(`${t("delete_confirm_title")}\n\n${t("delete_confirm_body", po.po_id)}`);
      if (!ok) return;

      try {
        await api(`/api/webapp/po/${po.id}`, { method: "DELETE" });
        haptic("medium");
        toast(t("delete_success"));
        setRemovingId(po.id);
      } catch (e) {
        haptic("heavy");
        toast(e instanceof ApiError ? e.message : t("delete_failed"));
      }
    },
    [t, toast]
  );

  const finalizeRemoval = useCallback(() => {
    setRemovingId(null);
    onDeleted();
  }, [onDeleted]);

  return { removingId, requestDelete, finalizeRemoval };
}
