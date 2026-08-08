# Phase A: Content Generation Engine — Implementation Plan

> Spec: `docs/superpowers/specs/2026-08-07-content-generation-engine-design.md`
> Status: Ready for execution (2026-08-07)
> Method: TDD for pure logic modules, then incremental UI wiring.

## Goal
Generate per-type structured content via Gemini REST with deterministic Thai template fallback, persist as versioned envelopes, render real bodies in ContentPage, surface in Library/Dashboard, and track analytics. No backend or new framework. `.env.example` documents `VITE_GEMINI_API_KEY`.

---

## Task Breakdown (ordered low → high risk)

### 1. Schema definitions + sanitizer (`src/data/schemas.js`, `src/utils/sanitizer.js`)
Create per-output-type body schemas: field shapes, caps, and an empty/default template. Pure data + pure function (`sanitizeBody`) that coerces, caps sizes, fills blanks, never throws.
- **Files:** `src/data/schemas.js`, `src/utils/sanitizer.js`, `tests/sanitizer.test.mjs`, `tests/schemas.test.mjs`
- **Acceptance:** All 6 types have a `createEmptyBody(type)` and `validateBody(type, obj)`; `sanitizeBody(type, raw)` returns a valid body for arbitrary/malformed input without throwing; quiz capped at 15 items.
- **Validation:** `npm run test` green; `npm run lint`, `npm run build` pass.

### 2. Prompt parser (`src/utils/promptParser.js`)
Extract `topic`, `durationMinutes`, `quantity` from the Thai prompt via regex. Pure function; used by template generator + prompt-building.
- **Files:** `src/utils/promptParser.js`, `tests/promptParser.test.js`
- **Acceptance:** Given the 4 `EXAMPLE_PROMPTS` and drill/blank prompts, returns sensible topic/quantity/duration or safe defaults.
- **Validation:** `npm run test` green; lint passes.

### 3. JSON extraction (`src/utils/jsonExtractor.js`)
Robustly extract + `JSON.parse` an object from Gemini text: strip markdown fences, trim wrapping prose/backticks, fall back to regex-bracket capture; return `null` on failure (never throw).
- **Files:** `src/utils/jsonExtractor.js`, `tests/jsonExtractor.test.js`
- **Acceptance:** Arrays of fixtures (fenced, wrapped, executable with code fences, plain, garbage) parse or return `null` deterministically; no throw.
- **Validation:** `npm run test` green; lint.

### 4. Template generator (`src/services/templateGenerator.js`)
Deterministic Thai content builder producing `validateBody`-compatible bodies from `{prompt, subject, grade, outputType}` via `promptParser`. Pure (no I/O).
- **Files:** `src/services/templateGenerator.js`, `tests/templateGenerator.test.js`
- **Acceptance:** Outputs valid, non-empty body per type, Thai labels echo `outputType`, quiz quantity from parser.
- **Validation:** `npm run test` green; lint.

### 5. `generationService` (`src/services/generationService.js`)
Orchestrator: if `import.meta.env.VITE_GEMINI_API_KEY` → REST call w/ prompt built from type schema; extract → `validateBody` → `sanitizeBody` → `source:"gemini"`. Any failure (no key/network/timeout/JSON/validation) → template fallback → `source:"template"`. Returns `{ metadata:{prompt,subject,grade,outputType,source}, body }`.
- **Files:** `src/services/generationService.js`
- **Acceptance:** Unit: no-key path returns template with `source:"template"`. Integration: real key path returns sanitized body with `source:"gemini"` on success, template on failure. Body never empty; no throw.
- **Validation:** `npm run lint`, `npm run build`; manual smoke (below).

### 6. Content v1 envelope + migration (`src/services/contentService.js`)
Wrap created records with `{id, version:1, metadata, body}`; add `metadata` reads + `normalizeRecord` lazy-upgrade for Phase-1 flat records → `source:"template"`. Keep `create/get/list/update/remove`.
- **Files:** `src/services/contentService.js`, `tests/contentService.test.js`
- **Acceptance:** `create` stores envelope with `version:1`; legacy flat records readable as v1 via `normalizeRecord`; `metadata.outputType/source` resolve for both new & legacy.
- **Validation:** `npm run test`, `lint`, `build`; manual legacy-persistence check.

### 7. Activity enrichment (`src/services/activityService.js`)
`track` stores `{type:"generate", outputType, source, contentId, createdAt}`; keep existing fields for compat. Used by Generator + Dashboard Recent.
- **Files:** `src/services/activityService.js`
- **Acceptance:** entries carry `source`; listRecent returns newest; no throw.
- **Validation:** `lint`, `build`; manual.

### 8. Generator integration (`src/pages/Generator.jsx`)
On generate: call `generationService.generate` → `contentService.create({metadata,body})` → `activityService.track({...})` → navigate `/content/:id`. Keep 4-step progress overlay.
- **Files:** `src/pages/Generator.jsx`
- **Acceptance:** selecting/output → success create; body+metadata persisted; navigates to ContentPage; progress UI unchanged.
- **Validation:** manual smoke; `lint`, `build`.

### 9. ContentPage rendering (`src/pages/ContentPage.jsx`)
Read envelope (`content.metadata.heading` + `content.body`); render each type's body via a `BodyRenderer`; replace mock `ContentPreview`; add source `Pill` (AI / เทมเพลต); keep labels from `metadata.subject/grade/outputType`.
- **Files:** `src/pages/ContentPage.jsx`
- **Acceptance:** Real body renders for all 6 types; legacy flat record still renders (normalize fallback); export button visible.
- **Validation:** manual per-type; `lint`, `build`.

### 10. Library + Dashboard surfacing
Library list + Dashboard Recent read `metadata` for prompt/title/subject; show `source` badge; keep search/filter by `metadata`.
- **Files:** `src/pages/Library.jsx`, `src/pages/Dashboard.jsx`
- **Acceptance:** New + legacy records listed; recent items show subject/name/source badge; filters work on `metadata`.
- **Validation:** manual; `lint`, `build`.

### 11. Env + config + audit (`package.json`, `.env.example`)
Add `npm test` script (`node --test`); document `VITE_GEMINI_API_KEY` in `.env.example`. Re-run full audit (lint/build) and manual smoke.
- **Files:** `package.json`, `.env.example`
- **Acceptance:** `npm test` green; `npm run build` green; fresh-clone `.env.example` documents key.
- **Validation:** full suite + manual smoke.

---

## Dependency Graph

```
schemas + sanitizer ─┬─► generationService (needs extractor + template)
                     ├─► promptParser
promptParser ────────┴─► templateGenerator ─► generationService
jsonExtractor ─────────► generationService
generationService ─────► Generator integration
contentService(v1/migrate) ─► Generator integration ─► ContentPage / Library / Dashboard
activityService ──────────► Generator integration (track)
tasks 8,9,10 depend on 5,6,7; task 11 last.
```

## Server-side REST prompt-building (inside task 5)

Prompt includes: Thai instructions, strict JSON-only output, `<owner>` ↔ Thai section headers, outputType key, `—` for empty; flag to return the type-specific JSON shape (`sanitizeBody`/`validateBody` as safety net).

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Gemini returns malformed JSON | High | `jsonExtractor` never throws + validation fallback + template path |
| Workflow precedes migration of Phase-1 records | Med | `normalizeRecord` lazy-upgrade; no data loss |
| Long timeout (empty thinking blocks) | Med | `AbortController` + explicit fetch timeout (~30s) |
| String format bias (word "quiz" with 0 items) | Med | parser defaults `quantity` |
| `import.meta.env` unavailable in pure test node run | Low | only services importing env run in build, not in node test |
| Client-side API key exposure | Low (accepted) | `VITE_` prefix + `.env.gitignore` dialogue |

## Recommended Execution Order

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

Why not DB first: each pure-logic task is independently testable and verified; only cards higher-risk at end. `schemas`/`sanitizer` lock down the data contract for every later layer.