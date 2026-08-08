# Secure Gemini API Access for Production (P1)

**Date:** 2026-08-08
**Status:** Implemented, validated, deployment-ready
**Scope:** Move all Gemini API calls behind Vercel Serverless Functions; remove the Gemini API key from the client bundle.

---

## 1. Architecture Before / After

### Before (insecure)

```
Browser (client bundle contains VITE_GEMINI_API_KEY)
   │
   ├─ generationService.generate()
   │     └─ fetch https://generativelanguage.googleapis.com/v1beta/models/…:generateContent?key=VITE_GEMINI_API_KEY
   │
   └─ aiService.generate()
         └─ fetch https://generativelanguage.googleapis.com/v1beta/models/…:generateContent?key=VITE_GEMINI_API_KEY
```

The key was a Vite env var (`VITE_*`), so Vite inlined it into the shipped JS bundle. Anyone inspecting the bundle/network tab could extract it and spend your quota.

### After (secure)

```
Browser (no key anywhere)
   │
   ├─ generationService.generate()  →  POST /api/generate  (same-origin)
   │                                          │
   │                                          ▼
   │                                 Vercel Function (Node, GEMINI_API_KEY via process.env)
   │                                          └─ fetch generativelanguage.googleapis.com…:generateContent
   │                                                key sent via `x-goog-api-key` header
   └─ aiService.generate()          →  POST /api/chat     (same-origin)
                                                │
                                                ▼
                                       Vercel Function (Node, GEMINI_API_KEY via process.env)
                                                └─ fetch generativelanguage.googleapis.com…:generateContent
```

- The browser only ever calls same-origin `/api/generate` and `/api/chat`.
- The key lives in Vercel Environment Variables (`GEMINI_API_KEY`), never in the bundle, requests, or source maps.
- The key is sent to Gemini from the server via the `x-goog-api-key` header (never in the URL query string).

---

## 2. Files Changed

| File | Change |
|---|---|
| `api/_gemini.js` | **New.** Shared server helper `callGemini()`: resolves key from `process.env.GEMINI_API_KEY` (or injected option), builds the REST endpoint, sends `x-goog-api-key` header, parses candidate text. Returns `{ ok, text, error }`, never throws, 30s timeout. |
| `api/generate.js` | **New.** Vercel Function `POST /api/generate`. Validates method/`promptText`, calls Gemini with JSON mode config, responds `{ ok, text, error }`. Exports `makeGenerateHandler({ fetchImpl })` for testability + a default bound handler for Vercel. |
| `api/chat.js` | **New.** Vercel Function `POST /api/chat`. Same shape, chat temperature config, lower `maxOutputTokens`. |
| `src/services/generationService.js` | Removed direct Gemini call + `?key=` URL + `import.meta.env.VITE_GEMINI_API_KEY`/`VITE_GEMINI_MODEL`. Now POSTs the prompt to `/api/generate`; same fallback chain (extract → sanitize → validate → template). Public interface kept (`apiKey` accepted-but-ignored → `_apiKey`). |
| `src/services/aiService.js` | Removed direct Gemini call + key gating. Now POSTs to `/api/chat`; offline heuristic reply on any server failure. Public interface kept. |
| `.env.example` | `VITE_GEMINI_API_KEY` / `VITE_GEMINI_MODEL` replaced with server-side `GEMINI_API_KEY` / `GEMINI_MODEL`. |
| `vercel.json` | **New.** SPA rewrite (`/(.*) → /index.html`) with `/api/*` passthrough so React Router works on Vercel and functions stay reachable. |
| `package.json` | Added `"test": "node --test"` script. |
| `tests/geminiServer.test.js` | **New.** 11 tests for `callGemini` + both handlers (success, missing key, HTTP error, malformed response, HTTP status codes, key never in response). |
| `tests/aiService.test.js` | Rewritten for the `/api/chat` contract (server response shape, no client key). |
| `tests/generationService.test.js` | Rewritten for the `/api/generate` contract. |

---

## 3. Security Verification Report

### Scanned artifacts — `dist/` (production build, 2026-08-08)

| Check | Result |
|---|---|
| `AIza…` (Gemini key prefix) in any bundle file | ✅ **Clean** — not found |
| `GEMINI_API_KEY` in any bundle file | ✅ **Clean** — not found |
| `VITE_GEMINI` in any bundle file | ✅ **Clean** — not found |
| `generativelanguage.googleapis.com` in any bundle file | ✅ **Clean** — direct API host not referenced by client code |
| `x-goog-api-key` in any bundle file | ✅ **Clean** — header used only server-side |
| Source maps (`.map`) in `dist/` | ✅ **Clean** — none emitted |
| Browser request to Gemini host | ✅ **Clean** — client only calls same-origin `/api/generate` and `/api/chat` (confirmed present in bundle) |
| Network requests carry a key | ✅ **Clean** — client sends `{ promptText, model }` only; tests assert `apiKey` is `undefined` in request bodies |
| Key in server response body | ✅ **Clean** — handler response is `{ ok, text, error }`; test asserts key not echoed |

### Source-level

- `grep VITE_GEMINI|import.meta.env` over `src/` returns only the unrelated `import.meta.env?.BASE_URL` in `exportService.js` (font paths). No Gemini key or endpoint in client source.
- The `apiKey` parameter is still accepted by both services for interface compatibility but is ignored (`_apiKey`) and never transmitted.

### Tests that pin the security guarantees

- `tests/aiService.test.js` → "request is POSTed to /api/chat with promptText and no apiKey"
- `tests/generationService.test.js` → "request is POSTed to /api/generate with promptText and no apiKey"
- `tests/geminiServer.test.js` → "callGemini -> success returns text with x-goog-api-key header, never in URL" and "handlers never include the API key in the response body"

---

## 4. Test Results

```
node --test           → 100/100 PASS  (incl. 25 new/changed across aiService, generationService, geminiServer)
npm run lint          → PASS (exit 0; 2 pre-existing only-export-components warnings in ui.jsx / AppContext.jsx)
npm run build         → PASS (dist generated; main chunk ≈322 kB; lazy export chunks unchanged)
```

### Verification checklist

- [x] generation flow still works — `generationService` calls `/api/generate`, falls back to Thai template on any server failure (tests green).
- [x] assistant flow still works — `aiService` calls `/api/chat`, falls back to offline heuristic reply (tests green).
- [x] Tests added where appropriate (server helper, both handlers, both client services).
- [x] Lint, build, test suite all pass.

---

## 5. Vercel Deployment Instructions

### One-time project setup

1. Push this branch/repo to GitHub (functions under `api/` + `vercel.json` are committed).
2. In the Vercel dashboard: **Add New → Project → Import** your repo.
3. Vercel auto-detects Vite (framework preset: Vite). Build command `npm run build`, output directory `dist` — already default, confirmed by `vercel.json` rewrites.
4. **Environment Variables** (Settings → Environment Variables), for Production (and Preview/Development as needed):

   | Name | Value | Scope |
   |---|---|---|
   | `GEMINI_API_KEY` | your Gemini API key (starts with `AIza…`) | Server only (functions) |
   | `GEMINI_MODEL` | optional override, e.g. `gemini-2.0-flash` | Server only |

   Do **not** create any `VITE_*` Gemini variables. Mark `GEMINI_API_KEY` as sensitive if the UI allows it.

5. **Deploy.** The functions at `api/generate.js` and `api/chat.js` are bundled server-side; the client bundle contains no key.

### Verify after deploy

1. Open the production URL → generate a lesson plan. Dashboard/Library badge should read **AI** (source `gemini`) once a valid key is set.
2. Open Assistant → send a message → get a real Thai AI reply.
3. Confirm fallback still works: with `GEMINI_API_KEY` empty, generation shows **เทมเพลต** and the assistant replies "ยังไม่สามารถเชื่อม AI ได้…".
4. DevTools → Network: requests should only hit `/api/generate` and `/api/chat` on your domain — never `generativelanguage.googleapis.com`.
5. DevTools → Sources: no `.map` files; search bundle for `AIza` → zero hits.

### Local development

- The functions call `process.env.GEMINI_API_KEY`. For local runs set it in the Vercel CLI environment:
  - `vercel env add GEMINI_API_KEY` then `vercel dev` (serves both SPA and functions).
- Without a local key, the app degrades gracefully (template/offline replies), matching the no-key UX.

---

## 6. Required Environment Variables

| Variable | Where | Required | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | Vercel Env Var (server) | Yes | Authenticates server→Gemini REST calls |
| `GEMINI_MODEL` | Vercel Env Var (server) | No | Overrides default `gemini-3.1-flash-lite` |

No client-side (`VITE_*`) Gemini variables are required or recommended.

---

## 7. Remaining Risks

1. **Unused `apiKey` parameter** in `aiService`/`generationService` is kept for interface compatibility. A future cleanup may drop it; until then it is intentionally ignored and never sent.
2. **No rate limiting / auth on `/api/generate` and `/api/chat`.** Any public visitor can call the functions (spending your Gemini quota). Acceptable for an MVP where the UI is the only consumer; production hardening would add a Vercel Auth/Firebase gate or a per-user rate limit.
3. **Prompt injection.** The server forwards user text into the model; the app already sanitizes output schema, but prompt text itself is unguarded. Mitigated by fixed system prompts; hardening could add a moderation check.
4. **Function cold starts** add a small latency (Node runtime) on first call after idle.
5. **Vercel Functions are region-bound** to the deployment region (default) — set the region close to your users if latency matters.
6. **`vercel.json` rewrite** routes all non-API paths to `index.html`; any future static route outside React Router will be shadowed (standard SPA trade-off).
7. **Key rotation** is manual: update `GEMINI_API_KEY` in Vercel env vars and redeploy; there is no key-rotation automation.
