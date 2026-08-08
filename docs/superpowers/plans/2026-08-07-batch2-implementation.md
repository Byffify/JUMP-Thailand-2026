# Phase A Batch 2 — Orchestration Core (JSON Extraction, Sanitizer, generationService) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pipeline that turns a user prompt into a sanitized, schema-valid content body: robust JSON extraction from Gemini output, a never-throws sanitizer, and a `generationService` orchestrator that falls back to the template generator when the API path fails.

**Architecture:** Three pure/received modules composed by an orchestrator. `jsonExtractor` parses JSON out of messy LLM text. `sanitizer` coerces/validates/caps any input into a valid v1 body. `generationService` calls `schemas` + `templateGenerator` + optional Gemini REST, returns `{ metadata, body }` with `source` pinned. All pure modules stay Node-compatible (no `window`/`import.meta`), so they test via `node --test`; only `generationService` uses `import.meta.env` and is verified by lint/build + manual smoke.

**Tech Stack:** Node 24 `node --test`, Vite 8, no new runtime deps. `import.meta.env.VITE_GEMINI_API_KEY` gates the live API path.

## Global Constraints

- Output `body` must always satisfy `validateBody(outputType, body).valid === true` for one of the 6 `OUTPUT_TYPES`.
- `generationService.generate` NEVER throws on user-AI-provided input; on ANY API failure it returns a template-sourced body.
- `metadata.source` is exactly one of `SOURCES` = `["gemini", "template", "legacy"]`.
- Deterministic for a fixed API response; no `Date.now`/random in pure modules (`sanitizer`/`jsonExtractor`).
- No new npm dependencies. No `window`, no `localStorage` outside `storageAdapter`, no UI/JSX.
- Test via `node --test` (repo root auto-discovery; `node --test tests/` does not work on Windows). Do not modify `package.json`.
- Do not use `git add -A`; stage only task files. On Windows run `npm.cmd`, not `npm`.
- Interfaces come from Batch 1 (see Task interfaces below); do not redefine them.

## Interfaces from Batch 1 (already merged)

`src/data/schemas.js`:
- `OUTPUT_TYPES`, `SOURCES`, `CONTENT_VERSION`, `OUTPUT_SCHEMAS`
- `createEmptyBody(outputType)`, `isValidOutputType(t)`

`src/utils/validateSchema.js`:
- `validateBody(outputType, obj)` → `{ valid, errors, normalized }`

`src/services/templateGenerator.js`:
- `templateGenerator.generate({ prompt, subject, grade, outputType })` → `{ body }`

`src/services/contentService.js`:
- `contentService.create(item)` accepts a `{ metadata, body }` envelope or legacy item; returns persisted record.

---

### Task 4: JSON Extraction

**Files:**
- Create: `src/utils/jsonExtractor.js`
- Test: `tests/jsonExtractor.test.js`

**Interfaces:**
- Consumes: nothing (standalone pure util).
- Produces: `extractJson(text) → object | null` — single parse attempt that never throws, returns `null` if not yield a JSON object from Gemini's raw text.

- [ ] **Step 1: Write the failing tests**

Run: first create `tests/jsonExtractor.test.js` with fixtures. Import `{ extractJson }` from `../src/utils/jsonExtractor.js`. Cover:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJson } from "../src/utils/jsonExtractor.js";

test("extracts fenced json", () => {
  const text = "Here:\\n```json\\n{\"title\":\"x\"}\\n```\\nthanks";
  assert.deepEqual(extractJson(text), { title: "x" });
});
test("extracts bare object in prose", () => {
  assert.deepEqual(extractJson('The result is {"a":1} end'), { a: 1 });
});
test("returns null on invalid json", () => {
  assert.equal(extractJson("not json at all"), null);
});
test("returns null on array root", () => {
  assert.equal(extractJson("[1,2,3]"), null);
});
test("handles nested quotes/escapes", () => {
  assert.deepEqual(extractJson('{"k":"v with \\"quote\\""}'), { k: 'v with "quote"' });
});
test("returns null for empty input", () => {
  assert.equal(extractJson(""), null);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL with "extractJson is not a function".

- [ ] **Step 3: Write minimal implementation**

```js
export function extractJson(text) {
  if (typeof text !== "string" || text.trim().length === 0) return null;
  const source = text.trim();
  // 1. Try to find a fenced block (```json ... ``` or plain ``` ... ```).
  const fence = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : source;
  return tryParse(candidate) ?? tryParse(findBrace(candidate));
}

function tryParse(str) {
  if (typeof str !== "string") return null;
  try {
    const value = JSON.parse(str);
    return isPlainObject(value) ? value : null;
  } catch {
    return null;
  }
}

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function findBrace(str) {
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = str.slice(start, end + 1);
  // If the surrounding prose left unbalanced braces, better to fail parse than crash.
  return slice;
}
```

Notes: prefer fenced block; else whole string; else first-`{`-to-last-`}` slice. Never throws; returns `null` otherwise.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: PASS (all 6 above).

- [ ] **Step 5: Run lint + build + commit**

Run: `npm.cmd run lint`, `npm.cmd run build`. Expected both PASS.
Commit:
```bash
git add src/utils/jsonExtractor.js tests/jsonExtractor.test.js
git commit -m "feat: add robust json extraction for gemini output"
```

---

## Task 5: Sanitizer

**Files:**
- Create: `src/utils/sanitizer.js`
- Test: `tests/sanitizer.test.js`

**Interfaces:**
- Consumes: `isValidOutputType`, `createEmptyBody`, `OUTPUT_SCHEMAS` from `src/data/schemas.js`.
- Produces: `sanitizeBody({ outputType, body }) → body` — returns a v1-valid body for the given `outputType`. Never throws. Coerces field types per schema (`string`→String, `number`→Number), caps `quiz.items` at 15, drops non-array non-object fields, fills missing required fields with empty defaults.

- [ ] **Step 1: Write the failing tests**

`tests/sanitizer.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeBody } from "../src/utils/sanitizer.js";
import { validateBody } from "../src/utils/validateSchema.js";
import { OUTPUT_TYPES, createEmptyBody } from "../src/data/schemas.js";

test("sanitizeBody returns valid body for every output type given empty", () => {
  for (const t of OUTPUT_TYPES) {
    const b = sanitizeBody({ outputType: t, body: {} });
    assert.equal(validateBody(t, b).valid, true, t);
  }
});
test("sanitizeBody fills missing fields with defaults", () => {
  const b = sanitizeBody({ outputType: "lesson-plan", body: {} });
  assert.equal(b.title, "");
  assert.equal(b.durationMinutes, 0);
  assert.ok(Array.isArray(b.materials));
  assert.equal(validateBody("lesson-plan", b).valid, true);
});
test("sanitizeBody coerces types", () => {
  const b = sanitizeBody({ outputType: "lesson-plan", body: { title: 123, durationMinutes: "50" } });
  assert.equal(b.title, "123");
  assert.equal(b.durationMinutes, 50);
});
test("sanitizeBody caps quiz items at 15", () => {
  const body = createEmptyBody("quiz");
  body.items = Array.from({ length: 20 }, (_, i) => ({
    question: `q${i}`,
    type: "multiple_choice",
    options: ["a", "b", "c", "d"],
    answer: "a",
    explanation: "e",
  }));
  const b = sanitizeBody({ outputType: "quiz", body });
  assert.equal(b.items.length, 15);
  assert.equal(validateBody("quiz", b).valid, true);
});
test("sanitizeBody never throws on garbage", () => {
  assert.doesNotThrow(() => sanitizeBody({ outputType: "worksheet", body: null }));
  assert.doesNotThrow(() => sanitizeBody({ outputType: "worksheet", body: "nope" }));
  assert.doesNotThrow(() => sanitizeBody({ outputType: "quiz", body: { title: [] } }));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL — `sanitizeBody is not a function`.

- [ ] **Step 3: Write minimal implementation**

Two helpers: a `coerce` that maps field types to concrete values, and a `sanitize` that walks `OUTPUT_SCHEMAS[outputType].fields`, builds a new object, coercing each field; arrays get a filtered/coerced inner list using `itemType`, with quiz `items` capped at 15; nested `itemShape` coerced recursively.

```js
import { isValidOutputType, createEmptyBody, OUTPUT_SCHEMAS } from "../data/schemas.js";

export function sanitizeBody({ outputType, body }) {
  const fallback = createEmptyBody(outputType);
  if (!isValidOutputType(outputType)) return fallback ?? {};
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return fallback;
  }

  const schema = OUTPUT_SCHEMAS[outputType];
  const out = {};
  for (const field of schema.fields) {
    const raw = body[field.name];
    out[field.name] = sanitizeField(raw, field);
  }
  return out;
}

function sanitizeField(raw, field) {
  switch (field.type) {
    case "array": {
      if (!Array.isArray(raw)) return [];
      const items = raw
        .filter((item) => item != null)
        .map((item) => sanitizeArrayItem(item, field));
      return field.name === "items" ? items.slice(0, 15) : items;
    }
    case "object":
      return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    case "number": {
      const n = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(n) ? n : 0;
    }
    case "string":
    default:
      return raw == null || typeof raw === "string" ? String(raw ?? "") : String(raw);
  }
}

function sanitizeArrayItem(item, field) {
  const shape = field.itemShape;
  if (!shape || typeof item !== "object" || item === null) return item;
  const out = {};
  for (const sub of shape) {
    out[sub.name] = sanitizeField(item[sub.name], sub);
  }
  return out;
}
```

NOTE: `sanitizeArrayItem` references `sanitizeField` recursively and converts partial items to valid shapes; this guarantees nested object fields remain schema-valid. Empty strings are NOT trimmed away (keeps deterministic, valid strings).

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: PASS.

- [ ] **Step 5: Run lint + build + commit**

Run: `npm.cmd run lint`, `npm.cmd run build`. Both PASS.
commit:
```bash
git add src/utils/sanitizer.js tests/sanitizer.test.js
git commit -m "feat: add deterministic content body sanitizer"
```

---

## Task 6: generationService

**Files:**
- Create: `src/services/generationService.js`
- Create: `.env.example` (documents `VITE_GEMINI_API_KEY`)
- Test: `tests/generationService.test.js` (unit for pure/template path via injected `fetch`), plus manual smoke.

**Interfaces:**
- Consumes: `jsonExtractor`, `templateGenerator`, `validateBody` (from `src/utils/validateSchema.js`), `sanitizeBody` (from `src/utils/sanitizer.js`), and `isValidOutputType`/`createEmptyBody` if needed.
- Produces: `generationService.generate({ prompt, subject, grade, outputType }) → { ok, body, source, error }`.

Contract:
- `{ ok: true, body, source: "gemini" }` on API success (body sanitized & valid).
- `{ ok: true, body, source: "template" }` on any API failure / no key.
- Returns object; never throws for valid input. `source` ∈ `SOURCES`.
- Uses `import.meta.env.VITE_GEMINI_API_KEY` to decide whether to attempt the live Gemini path; if absent, go straight to template.
- `skip` the live fetch when env is missing (avoids SSR/build issues).
- `fetch` must be injectable for tests (`newFetch` arg) to avoid network in test suite.

- [ ] **Step 1: Write the failing tests**

Create `tests/generationService.test.js`. Import `generationService` and `sanitizeBody` / `validateBody`.

Test layout:
1. No API key → returns template source, valid body.
2. API key + fetch returns valid Gemini JSON → gemini source, body valid.
3. API key + fetch returns invalid/malformed → template source, no throw.
4. API key + fetch throws (rejected) → template source, no throw.
5. Invalid outputType → template fallback, body valid.

Because `import.meta.env` is Vite-specific and unavailable in `node --test`, stub it in the test module scope via `globalThis` and import the service after stub. Simpler approach: make `generationService` read `getApiKey()` from a small injectable function. Design the module so the pure tests pass without Vite: set `process.env`? The cleanest is: `generationService.generate({ prompt, subject, grade, outputType, fetchImpl = fetch, apiKey })` — pass `apiKey` in tests, avoiding `import.meta.env` in the test entirely. The service uses `apiKey ?? import.meta.env?.VITE_GEMINI_API_KEY ?? ""`.

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { generationService } from "../src/services/generationService.js";
import { validateBody } from "../src/utils/validateSchema.js";

const okBody = { title: "x", objective: "y", durationMinutes: 50, materials: [], steps: [{ name: "s", durationMinutes: 5, description: "d" }], assessment: "a" };

test("no api key -> template source, valid body", async () => {
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", apiKey: "" });
  assert.equal(res.ok, true);
  assert.equal(res.source, "template");
  assert.equal(validateBody("lesson-plan", res.body).valid, true);
});

test("api success -> gemini source", async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(okBody) }] } }] }),
  });
  const res = await generationService.generate({
    prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", apiKey: "k", fetchImpl,
  });
  assert.equal(res.source, "gemini");
  assert.equal(validateBody("lesson-plan", res.body).valid, true);
});

test("gemini malformed json -> template source, no throw", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "not json" }] } }] }) });
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", apiKey: "k", fetchImpl });
  assert.equal(res.ok, true);
  assert.equal(res.source, "template");
});

test("fetch reject -> template source, no throw", async () => {
  const fetchImpl = async () => { throw new Error("network"); };
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", apiKey: "k", fetchImpl });
  assert.equal(res.source, "template");
  assert.equal(res.ok, true);
});

test("invalid outputType -> template source, valid fallback body", async () => {
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "nope", apiKey: "" });
  assert.equal(res.source, "template");
  assert.equal(res.ok, true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL — `generationService is not defined`.

- [ ] **Step 3: Write minimal implementation + `.env.example` + `.gitignore`**

Add `.env` and `.env.local` to `.gitignore` (prevents committing `VITE_GEMINI_API_KEY` to source):

```
# Env
.env
.env.local
.env.*.local
```

Create `.env.example`:

```
# Gemini API key (optional). Without it, generation falls back to Thai templates.
VITE_GEMINI_API_KEY=
```

Verify `.env.example` is NOT gitignored (it should be committed; `.env` itself is gitignored).

```js
import { isValidOutputType, OUTPUT_SCHEMAS } from "../data/schemas.js";
import { validateBody } from "../utils/validateSchema.js";
import { sanitizeBody } from "../utils/sanitizer.js";
import { extractJson } from "../utils/jsonExtractor.js";
import { templateGenerator } from "./templateGenerator.js";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(payload, { apiKey, fetchImpl = fetch, timeoutMs = 30000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(ENDPOINT + "?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJson(text);
    return parsed ? { ok: true, text, parsed } : { ok: false };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export const generationService = {
  async generate({ prompt = "", subject = "", grade = "", outputType = "", apiKey, fetchImpl, timeoutMs }) {
    const key = apiKey ?? import.meta.env?.VITE_GEMINI_API_KEY ?? "";
    const fallback = () => {
      const { body } = templateGenerator.generate({ prompt, subject, grade, outputType });
      return { ok: true, body, source: "template", error: null };
    };

    if (!isValidOutputType(outputType) || !key) {
      return fallback();
    }

    const payload = {
      contents: [{ parts: [{ text: buildPrompt({ prompt, subject, grade, outputType }) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 4096 },
    };
    const result = await callGemini(payload, { apiKey: key, fetchImpl, timeoutMs });

    if (!result.ok) {
      return fallback();
    }

    const sanitized = sanitizeBody({ outputType, body: result.parsed });
    if (!validateBody(outputType, sanitized).valid) {
      return fallback();
    }

    return { ok: true, body: sanitized, source: "gemini", error: null };
  },
};

function buildPrompt({ prompt, subject, grade, outputType }) {
  const schema = OUTPUT_SCHEMAS[outputType];
  const fieldsText = schema.fields.map((f) => `- ${f.name} (${f.type})`).join("\n");
  return [
    "You are a Thai teacher-education assistant. Respond with ONLY a JSON object.",
    "",
    "Requirements:",
    `- outputType: ${outputType}`,
    `- subject: ${subject}, grade: ${grade}`,
    `- prompt: ${prompt}`,
    "",
    "Return JSON with these top-level fields and nothing else:",
    fieldsText,
    "",
    "Use Thai language for all content. Do not wrap the JSON in markdown fences.",
  ].join("\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: PASS (Task 6's 5 tests + prior suites).

- [ ] **Step 5: Run lint + build + commit**

Run: `npm.cmd run lint`, `npm.cmd run build`. Both PASS.
Commit:
```bash
git add src/services/generationService.js tests/generationService.test.js .env.example .gitignore
git commit -m "feat: add generation service with gemini + template fallback"
```

---

## Self-Review

1. **Spec coverage:** Task 4 (extraction), Task 5 (sanitizer), Task 6 (generationService + fallback) all map to the approved Phase A Batch 2 scope. No later tasks (UI, activity, migration dependency) included.
2. **Placeholder scan:** All steps carry real code; no TBD.
3. **Type consistency:** `generate` returns `{ ok, body, source, error }` used identically across Task 6's test cases and implementation; `sanitizeBody({outputType, body})` and `validateBody(outputType, body)` signatures match Task 5 + Batch 1; `templateGenerator.generate({prompt,subject,grade,outputType})` matches Batch 1.

## Verification / Smoke Test (after Tasks 4-6)

```
npm.cmd run lint    # exit 0 (pre-existing warnings only)
npm.cmd run build   # dist generated
node --test         # all suites green
```

Manual smoke with a real key:
1. Add `VITE_GEMINI_API_KEY=...` to a local `.env`; `npm run dev`; generate a lesson plan → source "gemini".
2. Remove the key / simulate network failure → source "template", app still renders.
3. Open the ContentPage for a generated item → body renders, no crash on malformed AI output.