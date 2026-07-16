"use client";

import { useRef, useState } from "react";
import { haptic } from "@/lib/telegram";

const REVEAL_WIDTH = 64;

export default function ItemRow({
  children,
  onRemove,
  disabled = false,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [swiped, setSwiped] = useState(false);
  const drag = useRef({ startX: 0, startY: 0, dx: 0, dragging: false, axis: null as "x" | "y" | null });

  const applyTransform = (dx: number) => {
    if (rowRef.current) rowRef.current.style.transform = `translateX(${dx}px)`;
  };

  const closeSwipe = () => {
    setSwiped(false);
    if (rowRef.current) rowRef.current.style.transform = "";
  };

  const onStart = (clientX: number, clientY: number) => {
    if (disabled) return;
    const d = drag.current;
    d.startX = clientX;
    d.startY = clientY;
    d.dx = swiped ? -REVEAL_WIDTH : 0;
    d.dragging = true;
    d.axis = null;
    rowRef.current?.classList.add("dragging");
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
    if (d.axis === "y") return;

    const base = swiped ? -REVEAL_WIDTH : 0;
    d.dx = Math.min(0, Math.max(-REVEAL_WIDTH - 16, base + deltaX));
    applyTransform(d.dx);
  };

  const onEnd = () => {
    const d = drag.current;
    if (!d.dragging) return;
    d.dragging = false;
    rowRef.current?.classList.remove("dragging");
    if (d.axis !== "x") return;

    if (d.dx < -REVEAL_WIDTH / 2) {
      setSwiped(true);
      applyTransform(-REVEAL_WIDTH);
      haptic("light");
    } else {
      closeSwipe();
    }
  };

  const handleRemoveClick = () => {
    haptic("medium");
    closeSwipe();
    onRemove();
  };

  return (
    <div className="item-row-wrap">
      <button className="item-row-delete-action" onClick={handleRemoveClick} tabIndex={disabled ? -1 : 0}>
        🗑️
      </button>
      <div
        ref={rowRef}
        className={`item-row${swiped ? " swiped" : ""}`}
        onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={onEnd}
        onTouchCancel={onEnd}
      >
        {children}
      </div>
    </div>
  );
}