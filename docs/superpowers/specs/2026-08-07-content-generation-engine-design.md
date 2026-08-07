# KruMate OS — Phase A: Content Generation Engine (Design Spec)

> Status: approved 2026-08-07
> Architecture: Generator → generationService → (Gemini REST | template fallback) → contentService → localStorage → ContentPage

## Goal

Replace the static per-type preview with real, generated, structured content. When the user generates, a `generationService` produces a structured JSON `body` (Gemini on success, Thai template fallback otherwise), persisted via `contentService` with an explicit version + metadata envelope, and rendered by `ContentPage` and surfaced in Library/Dashboard.

## Constraints

- No backend, database, auth, cloud sync, or new frontend framework.
- Keep the existing UI/visual design; change only data + wiring.
- Gemini key from `VITE_GEMINI_API_KEY` env var. App must work fully offline via template fallback.
- All persistence through the existing service layer (`storageAdapter`). No direct `localStorage` in pages.

## Core Requirements

### 1. Content Versioning
Every generated content record includes `version: 1`.

**Purpose:** future schema migrations, backward compatibility, export compatibility.

### 2. Metadata Layer
Content stored as the envelope below. **No** prompt/subject/grade/outputType at the root; they live under `metadata`. Dashboard, Library, Search, Filters, and future Analytics read from `metadata`.

### 3. Source Tracking
`metadata.source` is `"gemini"` or `"template"`. Gemini success → `gemini`; any fallback/failure → `template`. No silent fallback. Users can distinguish AI vs template content (small badge).

### 4. Canonical Record (single generation result contract)
All services and consumers use:
```jsonc
{
  "id": "uuid",
  "version": 1,
  "createdAt": 1716576000000,
  "metadata": {
    "prompt": "...",
    "subject": "science",       // id
    "grade": "p6",              // id
    "outputType": "lesson-plan",// id
    "source": "gemini"          // "gemini" | "template"
  },
  "body": { /* per-output-type structured JSON */ }
}
```
Consumers: contentService, Library, Dashboard, ContentPage, future Export, future Analytics.

### 5. JSON Extraction Layer
Do not trust Gemini raw output. Pipeline:
`prompt → Gemini response → extraction (strip fences/wraps/malformed) → validateBody → sanitizeBody → persist`.
Malformed AI output never breaks the app.

### 6. Analytics Preparation
`activityService.track()` stores:
```jsonc
{ "type": "generate", "contentId": "uuid", "outputType": "lesson-plan", "source": "gemini", "createdAt": 123 }
```
for future Dashboard analytics.

## Per-Type Body Schemas (v1)

| outputType | body |
|---|---|
| lesson-plan | `{ title, objective, durationMinutes, materials[..], steps[{name,durationMinutes,description}], assessment }` |
| worksheet | `{ title, instructions, items[{question, answer}] }` |
| quiz | `{ title, items[{question, type, options[], answer, explanation}] }` (≤15) |
| slides | `{ title, slides[{title, bullets[]}] }` |
| rubric | `{ title, criteria[{name, descriptions[{level, text}]}] }` |
| activity | `{ title, durationMinutes, groupSize, materials[], steps[{name, description}] }` |

`sanitizeBody` coerces, caps sizes, fills blanks; never throws.

## File Plan
- New pure modules: `src/data/schemas.js`, `src/utils/{promptParser,jsonExtractor,sanitizer}.js`, `src/services/{templateGenerator,generationService}.js`, `.env.example`, `tests/*.test.mjs`.
- Modified: `contentService.js`, `activityService.js`, `Generator.jsx`, `ContentPage.jsx`, `Library.jsx`, `Dashboard.jsx`, `constants.js`, `package.json` (add `test` script).

## Validation
`npm run test` (node --test, pure modules), `npm run lint`, `npm run build`; manual smoke: generate with & without `VITE_GEMINI_API_KEY`; confirm `metadata.source` badge, Library/Dashboard/ContentPage render real bodies; refresh persistence intact.