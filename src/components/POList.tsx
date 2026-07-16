"use client";

import POCard from "./POCard";
import type { PO } from "@/lib/types";

export function Skeleton({ count, className }: { count: number; className: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${className}`} />
      ))}
    </>
  );
}

export default function POList({
  items,
  loading,
  emptyMessage,
  emptyIcon = "📭",
  removingId,
  onOpen,
  onDelete,
  onRemoved,
}: {
  items: PO[];
  loading: boolean;
  emptyMessage: string;
  emptyIcon?: string;
  removingId: string | null;
  onOpen: (po: PO) => void;
  onDelete: (po: PO) => void;
  onRemoved: (po: PO) => void;
}) {
  if (loading) {
    return (
      <div className="po-list">
        <Skeleton count={3} className="skeleton-card" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="po-list">
        <div className="empty-state">
          <span className="empty-icon">{emptyIcon}</span>
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="po-list">
      {items.map((po, i) => (
        <POCard
          key={po.id}
          po={po}
          index={i}
          removing={removingId === po.id}
          onOpen={onOpen}
          onDelete={onDelete}
          onRemoved={onRemoved}
        />
      ))}
    </div>
  );
}
