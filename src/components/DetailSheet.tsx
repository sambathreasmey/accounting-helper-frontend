"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useI18n, STATUS_KEY } from "@/lib/i18n";
import { STATUS_ICON, fmtDate, poTotal } from "@/lib/format";
import { useToast } from "@/lib/toast";
import { haptic, showConfirm } from "@/lib/telegram";
import type { PO, POItem } from "@/lib/types";

interface EditableRow extends POItem {
  key: string;
}

let rowKeySeq = 0;
function newRow(item: Partial<POItem> = {}): EditableRow {
  rowKeySeq += 1;
  return {
    key: `row-${rowKeySeq}`,
    department: item.department || "Kitchen",
    name: item.name || "",
    qty: item.qty ?? 1,
    packing: item.packing || "",
    price: item.price ?? 0,
  };
}

export default function DetailSheet({
  poId,
  onClose,
  onChanged,
}: {
  poId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  const [po, setPo] = useState<PO | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [editedPoId, setEditedPoId] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPo(null);
    api<PO>(`/api/webapp/po/${poId}`)
      .then((data) => {
        if (cancelled || !data) return;
        setPo(data);
        setRows(data.items.map((it) => newRow(it)));
        setSupplierName(data.supplier_name);
        setEditedPoId(data.po_id);
      })
      .catch((e) => {
        if (cancelled) return;
        toast(e instanceof ApiError ? e.message : "Something went wrong");
        onClose();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId]);

  const editable = po?.status === "failed" || po?.status === "completed";

  const updateRow = (key: string, patch: Partial<EditableRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addItem = () => {
    haptic("light");
    setRows((prev) => [...prev, newRow()]);
  };

  const removeRow = (key: string) => {
    haptic("light");
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  };

  const submitDelete = async () => {
    if (!po) return;
    haptic("medium");
    const ok = await showConfirm(`${t("delete_confirm_title")}\n\n${t("delete_confirm_body", po.po_id)}`);
    if (!ok) return;

    setDeleting(true);
    try {
      await api(`/api/webapp/po/${po.id}`, { method: "DELETE" });
      haptic("medium");
      toast(t("delete_success"));
      onClose();
      onChanged();
    } catch (e) {
      haptic("heavy");
      toast(e instanceof ApiError ? e.message : t("delete_failed"));
      setDeleting(false);
    }
  };

  const submitRegenerate = async () => {
    if (!po) return;

    const items = rows
      .map((r) => ({
        department: r.department || "Kitchen",
        name: r.name.trim(),
        qty: Number(r.qty) || 0,
        packing: (r.packing || "").trim(),
        price: Number(r.price) || 0,
      }))
      .filter((i) => i.name && i.qty > 0);

    if (!items.length) {
      toast(t("add_valid_item"));
      return;
    }

    setSending(true);
    try {
      const updated = await api<PO>(`/api/webapp/po/${po.id}/regenerate`, {
        method: "POST",
        body: JSON.stringify({
          po_id: editedPoId.trim() || po.po_id,
          supplier_name: supplierName.trim() || po.supplier_name,
          items,
        }),
      });
      haptic("medium");
      toast(t("regenerate_success"));
      onClose();
      onChanged();
      void updated;
    } catch (e) {
      haptic("heavy");
      toast(e instanceof ApiError ? e.message : "Something went wrong");
      setSending(false);
    }
  };

  return (
    <div className="sheet">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-content">
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={onClose}>
          ✕
        </button>
        <div id="sheet-body">
          {!po ? (
            <>
              <div className="skeleton" style={{ height: 22, width: "60%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 20 }} />
              <div className="skeleton skeleton-card" style={{ marginBottom: 8 }} />
              <div className="skeleton skeleton-card" />
            </>
          ) : (
            <>
              <div className="detail-title">
                {po.po_id} — {po.supplier_name}
              </div>
              <div className="detail-sub">
                <span className={`badge ${po.status}`}>
                  {STATUS_ICON[po.status] || ""} {t(STATUS_KEY[po.status] || "status_pending")}
                </span>
                <span>{fmtDate(po.created_at, lang)}</span>
                <span>
                  · {t("total")} ${poTotal(po)}
                </span>
              </div>

              {po.error_message ? <div className="error-text">{po.error_message}</div> : null}
              {po.file_url ? (
                <a className="link-btn" href={po.file_url} target="_blank" rel="noreferrer">
                  {t("open_document")}
                </a>
              ) : null}

              {editable ? (
                <>
                  <div className="row-labels">
                    <span>{t("po_id_label")}</span>
                    <span style={{ gridColumn: "span 3" }}>{t("supplier_label")}</span>
                  </div>
                  <div className="header-edit-row">
                    <input
                      value={editedPoId}
                      placeholder={t("po_id_label")}
                      onChange={(e) => setEditedPoId(e.target.value)}
                    />
                    <input
                      value={supplierName}
                      placeholder={t("supplier_placeholder")}
                      onChange={(e) => setSupplierName(e.target.value)}
                    />
                  </div>
                </>
              ) : null}

              <div className="row-labels">
                <span>{t("col_item")}</span>
                <span>{t("col_qty")}</span>
                <span>{t("col_unit")}</span>
                <span>{t("col_price")}</span>
                {editable ? <span /> : null}
              </div>
              <div id="items-editor">
                {rows.map((row) => (
                  <div className="item-row" key={row.key}>
                    <input
                      className="f-name"
                      value={row.name}
                      placeholder={t("col_item")}
                      disabled={!editable}
                      onChange={(e) => updateRow(row.key, { name: e.target.value })}
                    />
                    <input
                      className="f-qty"
                      type="number"
                      step="any"
                      value={row.qty}
                      placeholder={t("col_qty")}
                      disabled={!editable}
                      onChange={(e) => updateRow(row.key, { qty: Number(e.target.value) })}
                    />
                    <input
                      className="f-packing"
                      value={row.packing}
                      placeholder={t("col_unit")}
                      disabled={!editable}
                      onChange={(e) => updateRow(row.key, { packing: e.target.value })}
                    />
                    <input
                      className="f-price"
                      type="number"
                      step="any"
                      value={row.price}
                      placeholder={t("col_price")}
                      disabled={!editable}
                      onChange={(e) => updateRow(row.key, { price: Number(e.target.value) })}
                    />
                    {editable ? (
                      <button
                        type="button"
                        className="f-remove"
                        disabled={rows.length <= 1}
                        onClick={() => removeRow(row.key)}
                        title={t("remove_item")}
                      >
                        ✕
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              {editable ? (
                <div className="actions">
                  <button className="btn btn-secondary" onClick={addItem}>
                    {t("add_item")}
                  </button>
                  <button className="btn btn-primary" disabled={sending} onClick={submitRegenerate}>
                    {sending ? t("sending") : t("regenerate")}
                  </button>
                  <button className="btn btn-danger" disabled={deleting} onClick={submitDelete} title={t("delete")}>
                    🗑️
                  </button>
                </div>
              ) : (
                <>
                  <div className="detail-sub" style={{ marginTop: 14 }}>
                    {t("not_editable", t(STATUS_KEY[po.status] || "status_pending"))}
                  </div>
                  <div className="actions">
                    <button className="btn btn-danger" disabled={deleting} onClick={submitDelete}>
                      🗑️ {deleting ? t("deleting") : t("delete")}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}