"use client";

import { useRef, useState } from "react";
import { Trash2, Package } from "lucide-react"; // 1. Import the clean UI vector icons
import { useI18n, STATUS_KEY } from "@/lib/i18n";
import { STATUS_ICON, fmtDate, poTotal } from "@/lib/format";
import { haptic } from "@/lib/telegram";
import type { PO } from "@/lib/types";

const REVEAL_WIDTH = 76; // px the card slides to expose the delete action

export default function POCard({
  po,
  index,
  removing = false,
  onOpen,
  onDelete,
  onRemoved,
}: {
  po: PO;
  index: number;
  removing?: boolean;
  onOpen: (po: PO) => void;
  onDelete: (po: PO) => void;
  onRemoved: (po: PO) => void;
}) {
  const { t, lang } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);
  const [swiped, setSwiped] = useState(false);
  const drag = useRef({ startX: 0, startY: 0, dx: 0, dragging: false, axis: null as "x" | "y" | null });

  const applyTransform = (dx: number) => {
    if (cardRef.current) cardRef.current.style.transform = `translateX(${dx}px)`;
  };

  const closeSwipe = () => {
    setSwiped(false);
    if (cardRef.current) cardRef.current.style.transform = "";
  };

  const onStart = (clientX: number, clientY: number) => {
    const d = drag.current;
    d.startX = clientX;
    d.startY = clientY;
    d.dx = swiped ? -REVEAL_WIDTH : 0;
    d.dragging = true;
    d.axis = null;
    cardRef.current?.classList.add("dragging");
  };

  const onMove = (clientX: number, clientY: number) => {
    const d = drag.current;
    if (!d.dragging) return;
    const deltaX = clientX - d.startX;
    const deltaY = clientY - d.startY;

    if (d.axis === null) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      d.axis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
    }
    if (d.axis === "y") return; // let the page scroll vertically

    const base = swiped ? -REVEAL_WIDTH : 0;
    d.dx = Math.min(0, Math.max(-REVEAL_WIDTH - 20, base + deltaX));
    applyTransform(d.dx);
  };

  const onEnd = () => {
    const d = drag.current;
    if (!d.dragging) return;
    d.dragging = false;
    cardRef.current?.classList.remove("dragging");
    if (d.axis !== "x") return;

    if (d.dx < -REVEAL_WIDTH / 2) {
      setSwiped(true);
      applyTransform(-REVEAL_WIDTH);
      haptic("light");
    } else {
      closeSwipe();
    }
  };

  const handleCardClick = () => {
    if (swiped) {
      closeSwipe();
      return;
    }
    haptic("light");
    onOpen(po);
  };

  const handleDeleteClick = () => {
    onDelete(po);
  };

  return (
    <div
      className={`po-card-wrapper${removing ? " removing" : ""}`}
      style={{ animationDelay: removing ? "0ms" : `${Math.min(index, 8) * 35}ms` }}
      onAnimationEnd={() => {
        if (removing) onRemoved(po);
      }}
    >
      {/* 2. Swapped 🗑️ emoji for a centered Trash2 vector icon */}
      <div className="po-card-delete-action flex items-center justify-center" onClick={handleDeleteClick}>
        <Trash2 size={20} />
      </div>
      <div
        ref={cardRef}
        className={`po-card${swiped ? " swiped" : ""}`}
        onClick={handleCardClick}
        onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={onEnd}
        onTouchCancel={onEnd}
      >
        <div className="po-card-main">
          {/* 3. Swapped 🛍️ emoji for a clean Package frame icon */}
          <div className="po-card-icon flex items-center justify-center">
            <Package size={20} className="text-purple-400" />
          </div>
          <div className="po-card-text">
            <div className="po-card-title">
              {po.po_id} — {po.supplier_name}
            </div>
            {/* 4. Removed 📅 emoji to keep the date subtitle string sharp */}
            <div className="po-card-sub">
              {fmtDate(po.created_at, lang)} &nbsp;•&nbsp; ${poTotal(po)}
            </div>
          </div>
        </div>
        {/* 5. Removed direct emoji handling here, letting clean badges group it */}
        <span className={`badge ${po.status}`}>
          {t(STATUS_KEY[po.status] || "status_pending")}
        </span>
      </div>
    </div>
  );
}