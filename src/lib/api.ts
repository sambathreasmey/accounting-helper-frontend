"use client";

import { getInitData } from "./telegram";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export class ApiError extends Error {}

type ProgressListener = (active: boolean) => void;
const listeners = new Set<ProgressListener>();

export function onProgress(fn: ProgressListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function setProgress(active: boolean) {
  listeners.forEach((fn) => fn(active));
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T | null> {
  setProgress(true);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Init-Data": getInitData(),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(body.detail || `Request failed (${res.status})`);
    }
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : null;
  } finally {
    setProgress(false);
  }
}
