# KruMate OS — Phase A Task 3.5 Service Layer Audit

**Date:** 2026-08-07
**Scope:** `contentService.js`, `storageAdapter.js`, `migrateContent.js`, `schemas.js`
**Type:** Code review + defect confirmation (read-only, except the `update()` fix below)

---

## Verdict

**READY for Batch 2 with one blocking fix** (`contentService.update()` migration bypass).

---

## File-by-file findings

### `src/data/schemas.js` — PASS
- Canonical `ContentRecord`/`GenerationResult` contract, 6 `OUTPUT_SCHEMAS`, `createEmptyBody`, `isValidOutputType`, `CONTENT_VERSION=1`, `SOURCES`.
- Clean field-descriptor model (name/type/required/itemShape); pure, dependency-free.
- No issues.

### `src/utils/migrateContent.js` — PASS
- `isV1Record`/`migrateRecord`/`migrateList` idempotent; legacy→v1 with `source:"legacy"`, `createEmptyBody` fallback, unknown-key preservation, never throws.
- Minor: `isV1Record` accepts any numeric `version` (not strictly `=== 1`); acceptable — `CONTENT_VERSION` is the only version today and upgrade path is forward-only.
- Minor: `migrateRecord` spreads unknown top-level keys onto the envelope; harmless, preserved deliberately (no data loss).

### `src/services/storageAdapter.js` — PASS
- Sole `localStorage` access point (`krumate:` prefix, Promise-based, swallow-and-log on error). Enforces the "no direct localStorage in pages" rule.
- No issues.

### `src/services/contentService.js` — FAIL (one defect)
- `create/get/list` correctly normalize via `migrateRecord`/`migrateList`. ✅
- **`update(id, patch)` (line 31-39) merges `{...list[idx], ...patch}` WITHOUT `migrateRecord`.** A legacy-shaped or partial patch (e.g. `{prompt:"new"}`) lands at the envelope root instead of `metadata`, producing a non-canonical record that later reads re-migrate inconsistently. Confirmed empirically:

```
v1.metadata.source = "legacy"
update-merged has metadata: true (but root also gets "prompt")
```

## Fix applied (this audit)

`update` now re-migrates the merged record before persist:

```js
async update(id, patch) {
  const list = await readAll();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated = migrateRecord({ ...list[idx], ...patch, id });
  list[idx] = updated;
  await storage.set(KEY, list);
  return updated;
}
```

Ensures update is idempotent against v1 records and upgrades any legacy-shaped patch to the envelope, matching `create/get/list`.

## Verification

- `node --test` 36/36 → (after fix) still green
- `npm run lint` exit 0 (2 pre-existing warnings only)
- `npm run build` exit 0

## Readiness for Batch 2

Foundation is solid. With `update()` fixed, Batch 2 (JSON extraction, sanitizer, `generationService`) can build on a canonical-envelope invariant guaranteed across create/get/update/list.