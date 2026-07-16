"use client";

import { getInitData } from "./telegram";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const STORAGE_KEY = "tg_miniapp_tokens";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

let tokens: TokenPair | null = null;

function loadFromSession(): TokenPair | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenPair) : null;
  } catch {
    return null;
  }
}

function saveToSession(pair: TokenPair) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pair));
  } catch {
    // sessionStorage blocked — fall back to in-memory only for this tab
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function getAccessToken(): string | null {
  if (!tokens) tokens = loadFromSession();
  return tokens?.accessToken ?? null;
}

export async function loginWithTelegram(): Promise<TokenPair> {
  const res = await fetch(`${API_BASE}/api/webapp/auth/telegram`, {
    method: "POST",
    headers: { "X-Telegram-Init-Data": getInitData() },
  });
  if (!res.ok) throw new Error("Telegram auth failed");
  const data = await res.json();
  tokens = { accessToken: data.access_token, refreshToken: data.refresh_token };
  saveToSession(tokens);
  return tokens;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!tokens) tokens = loadFromSession();
  if (!tokens?.refreshToken) return null;

  const res = await fetch(`${API_BASE}/api/webapp/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: tokens.refreshToken }),
  });
  if (!res.ok) {
    tokens = null;
    clearSession();
    return null;
  }
  const data = await res.json();
  tokens = { accessToken: data.access_token, refreshToken: data.refresh_token };
  saveToSession(tokens);
  return tokens.accessToken;
}

export function logout() {
  tokens = null;
  clearSession();
}