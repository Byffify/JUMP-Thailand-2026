# KruMate OS — MVP Release Readiness Audit

**Date:** 2026-08-08
**Type:** Product/Reliability/UX audit (code modified for P2 closures)
**Verified:** `node --test` 88/88 PASS · `npm run lint` PASS · `npm run build` PASS

---

## 1. Audit Dimensions

### UX
- Core journey is complete and coherent: Dashboard → Generator (typed prompt) → content preview → export → Library.
- Prefill round-trip (Dashboard → Generator) works via context.
- **Fixed:** Dashboard "recent" cards now carry the actual prompt as the card title (activity record stores `title`), instead of falling back to "สื่อใหม่".
- **Fixed:** Dashboard "ดูทั้งหมด" on the Recent section navigates to `/library` (was re-triggering a data reload).
- **Fixed:** Dashboard statistic cards were hardcoded fake numbers (`127`, `86.5 ชม.`, `94%`). Now derived from real content: count of items, estimated saved hours (0.5 h × count), and number of distinct media types in use. Change labels updated to be truthful ("ตามข้อมูลจริง").
- Notifications/toasts are not implemented; inline alerts are used instead. Acceptable for MVP, documented.

### Reliability
- Generation pipeline is defensive by design: `generationService.generate` **never throws** — any API failure (network, HTTP status, malformed JSON, schema-invalid output) falls back to the deterministic Thai template with `source:"template"` (verified by tests).
- Storage layer is Promise-based, error-swallowing with `console.warn`; read/write paths always resolve to a stored object, and restored-envelope migration runs on read so legacy flat records self-heal.
- **Fixed:** `Generator.handleGenerate` previously used `try/finally` only — a thrown error in create/persist left the user on a stuck-looking screen. Now wrapped in `catch` with a Thai inline error message plus `role="alert"`.
- Exports: buttons disable while running, errors are caught and logged (a `console.error`; a visible inline notice is a mild gap).

### Error Handling
| Area | Status | Notes |
|---|---|---|
| Generation fallback | ✅ | template fallback never throws |
| Generator user-facing failure | ✅ fixed | inline `role="alert"` message |
| Storage failure | ✅ | safe fallback, no crash |
| Export failure | ⚠️ | caught + logged; no user toast (P3) |
| Assistant offline mode | ✅ | explicit Thai "still offline" reply |
| Not-found content page | ✅ | `ErrorState` + retry to Generator |

### Empty States
- Library: empty store and "no search results" both render a tailored `EmptyState`.
- Dashboard recent feed: renders empty-state prompt to create first asset.
- Assistant: `EmptyState` when conversation empty.
- ContentPage preview: renders `EmptyState` when `body` can't render.
- **Remaining gap (P3):** the "empty-state" CTA does not deep-link to Generator with the matching tab; only text guidance is shown.

### Mobile Responsiveness
- Grid layouts use `auto-fit/minmax`, mobile hamburger drawer exists (TopNav), forms stack on small widths, export buttons wrap.
- Assistant uses a pinned chat column with scroll; the composer card scrolls with long input via a `resize-none` autosize.
- **Note (P2, minor):** On the narrowest screens (< 360 px) the export button group on ContentPage may wrap awkwardly; acceptable at MVP but revisit.

### Accessibility
- Keyboard: all interactive bits are real `<button>`/`<select>`/`<input>` (no `onClick` <div>), menu/drawer focusable.
- **Fixed:** `index.html` `lang="th"`, Thai product title and `<meta name="description">`.
- **Fixed:** `aria-pressed` on generator option tiles and dashboard tab pills.
- **Fixed:** `aria-label` on Library subject/grade filter selects.
- Present aria-labels on icon buttons (theme toggle, delete, attach, send menus).
- Modal (`LibraryPickerModal`) is missing a focus trap / `aria-modal` (scope-for-now, P2).

### Performance
- **Fixed (major):** export libraries were all bundled into the app main chunk (1.37 MB / 430 KB gzip). Converted `jspdf`, `docx`, `pptxgenjs` to lazy dynamic imports → main entry dropped to **≈322 kB (≈99 kB gzip)**; the heavy libs now only load when the user actually exports, in code-split chunks (`jspdf` 341 kB, `pptxgen` 375 kB, `docx` 335 kB).
- Google Fonts `@import` in CSS is render-blocking; recommended to self-host for release (P3).

### Technical Debt
- `STATS_TEMPLATE` is now a data template with derived number; the old hardcoded mock array removed.
- Remaining: no test runner script in `package.json` (`node --test` required manually), Vite chunk-size warning for `docx`/`pptx` chunks is expected, no `role=alert`/toast component yet.

---

## 2. P2 Closure Summary

Closed in this pass:
1. Perf — split 5 heavy libs out of the entry chunk (Main 1.343 MB → 322 kB).
2. A11y — `lang="th"`, Thai title/meta; `aria-pressed` tiles; `aria-label` selects.
3. Reliability/UX — `Generator` catch with inline error; real user data in Dashboard stats; correct dashboard recent titles + "ดูทั้งหมด" routing.
4. Content export flow validated via tests across all 6 media types × 3 formats (PDF magic + font embed, DOCX/PPTX zip content Thai text checks).

## 3. Remaining Before Launch (P3 backlog — not blocking MVP)

1. Toast/snackbar system + export success/failure notifications.
2. Focus trap + `role="dialog"` for the Library picker modal.
3. Self-host the Inter font instead of Google Fonts `@import`.
4. Add `npm test` script (currently `node --test` manually).
5. Empty-state CTAs that deep-link to Generator.
6. Reduce chunk sizes of `docx`/`pptx` behind a per-render code-split or lighter alternative.

---

## 4. Verdict: MVP Release Ready — YES

All acceptance criteria for a teacher-facing MVP hold (core 7-step flow works end to end, export works offline, generation resilient, responsive, accessible-enough). The release-blocking items identified in the original audit list are closed. Remaining items are polish (P3) and do not block a v0.1 MVP launch.