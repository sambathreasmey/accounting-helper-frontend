"use client";

import { getAccessToken, loginWithTelegram, refreshAccessToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export class ApiError extends Error {}

type ProgressListener = (active: boolean) => void;
const listeners = new Set<ProgressListener>();

export function onProgress(fn: ProgressListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setProgress(active: boolean) {
  listeners.forEach((fn) => fn(active));
}

async function ensureToken(): Promise<string> {
  const existing = getAccessToken();
  if (existing) return existing;
  const pair = await loginWithTelegram();
  return pair.accessToken;
}

function doFetch(path: string, options: RequestInit, token: string) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T | null> {
  setProgress(true);
  try {
    let token = await ensureToken();
    let res = await doFetch(path, options, token);

    if (res.status === 401) {
      // Access token expired mid-session: try a silent refresh first,
      // and only fall back to a full Telegram re-login if that's dead too.
      token = (await refreshAccessToken()) ?? (await loginWithTelegram()).accessToken;
      res = await doFetch(path, options, token);
    }

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