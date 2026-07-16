# PO Dashboard — Telegram Mini App (Next.js)

A migration of the original vanilla HTML/JS Telegram Mini App to Next.js,
built as a static export so it can be hosted on Cloudflare Pages exactly the
way your `accounting-helper-frontend` project is already configured.

## What changed vs. the old frontend

- Same screens, same behavior: Dashboard tab (stats + recent orders), History
  tab (status filter chips + pagination), swipe-to-delete on cards, bottom
  detail sheet with editable line items, regenerate, delete.
- Same two languages (English / Khmer) and the same light/dark toggle,
  now driven by React context instead of global functions.
- Talks to the same FastAPI endpoints under `/api/webapp/...`, using the
  same `X-Telegram-Init-Data` header for auth.
- Because this is now a separately-hosted static site rather than files
  served by FastAPI itself, API calls go to a **full URL** you configure via
  `NEXT_PUBLIC_API_BASE_URL` (see below) instead of a relative path.
- The stylesheet is new — the old project referenced a `style.css` that
  wasn't included in what you shared, so this is a fresh, native-feeling
  implementation (light/dark, rounded cards, status colors) rather than a
  pixel copy. Everything is plain CSS in `src/app/globals.css`, easy to
  retheme.

## Project structure

```
src/
  app/
    layout.tsx        Root layout — loads the Telegram WebApp SDK script
    page.tsx           Screen composition (tabs, sheet, toasts)
    globals.css        All styling
  components/          One component per UI piece (Dashboard, History,
                       DetailSheet, POCard, TabBar, etc.)
  lib/
    api.ts             fetch wrapper + auth header + in-flight counter
    telegram.ts        Thin wrapper around window.Telegram.WebApp
    i18n.tsx            en/km strings + language context
    theme.tsx           light/dark context
    toast.tsx           toast context
    useDeletePO.ts      shared confirm → delete → animate-out flow
    types.ts            PO / DashboardData / HistoryData types
```

## 1. Configure the API base URL

Your FastAPI backend and this static site will live on different domains, so
requests need an absolute URL. Set this **before building**:

```bash
cp .env.example .env.local
# then edit .env.local:
# NEXT_PUBLIC_API_BASE_URL=https://your-app.fastapicloud.dev
```

On Cloudflare Pages, set it under **Settings → Variables and secrets** as a
build-time variable named `NEXT_PUBLIC_API_BASE_URL` (Production and Preview
environments both, if you use previews).

## 2. Enable CORS on the FastAPI side

Since the Mini App is now on a different origin than the API, add CORS
middleware to your FastAPI app (if it isn't already there) so the browser is
allowed to call it:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://accounting-helper-frontend.pages.dev"],  # + your custom domain if any
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "X-Telegram-Init-Data"],
)
```

Without this, `fetch()` calls from the deployed Mini App will fail with a
CORS error in the browser console even though the API works fine when
called directly.

## 3. Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Outside of Telegram, `window.Telegram` is
undefined, so the Telegram-only bits (haptics, native confirm dialogs,
init data) fall back gracefully — the app still renders, but `/api/webapp/me`
etc. will 401 until you're testing inside an actual Telegram chat, since the
backend validates real Telegram `initData`.

## 4. Build & deploy to Cloudflare Pages

This matches the settings already in your screenshot — no changes needed
there:

- **Build command:** `npx next build`
- **Build output directory:** `out`
- **Root directory:** (leave as-is, i.e. repo root, if you push this whole
  folder as the repo)

Push this project to the `sambathreasmey/accounting-helper-frontend` repo
(replacing the old static files), and Cloudflare Pages will pick it up on
the next push to `main` since automatic deployments are already enabled.

## 5. Point Telegram at it

In BotFather, make sure your Mini App / Web App button still points at the
Cloudflare Pages URL (or your custom domain). Nothing changes there — the
same URL now serves the Next.js build instead of the old static files.
