# KruMate OS — Product Architecture & Data Flow Audit

**Date:** 2026-08-07
**Type:** Product Architecture & Data Flow Audit (no code modified)

---

## Scope note

`src/lib/` and `src/services/` **do not exist**. There is no persistence layer anywhere in the code. The only `localStorage` usage in the entire app is the theme toggle (`TopNav.jsx:16,22`). Everything else is in-memory React state or hardcoded mock arrays. The "localStorage-first offline MVP" is the *target*, not the *current state*.

---

## 1. Current Flow Audit

```
┌─ Dashboard ──► setPrefillPrompt → navigate("/generator")
│               STATS/RECENT = hardcoded arrays (mock), Skeleton mimics load
│
├─ Generator ──► prompt + subject + grade + outputType
│               mock step timer (700ms × 4 steps)
│               builds {id: Date.now(), prompt, subject, grade, outputType}
│               setGeneratedContent(content)  ── in-memory only ──► navigate("/content/:id")
│
├─ ContentPage ► reads generatedContent from Context (memory)
│               id must match, else ErrorState
│               Preview = hardcoded static Thai copy (lesson-plan/worksheet/quiz/slides/rubric/activity)
│               PDF/DOCX/PPTX buttons have NO onClick (do nothing)
│
├─ Library ────► reads hardcoded `subjects` from data/subjects.js (2 subjects, static)
│               mock skeleton (500ms), search/filter works over mock array
│               document "open/download" = window.open("#") — dead links
│               NOT connected to Generator output or localStorage
│
└─ Assistant ──► messages in useState (memory)
                getMockAIResponse() = setTimeout + canned string ("ยังไม่เชื่อม AI จริง")
                library picker reads same mock subjects
                file attach = FileReader/preview only; no persistence
```

| Page | User flow | Data flow | Mock parts | Production-like parts |
|---|---|---|---|---|
| Dashboard | Headline → tab → prompt → submit | `setPrefillPrompt` → Generator | STATS (3), RECENT (3), loading timer | Real routing via Context |
| Generator | Fill form → generate | Context `setGeneratedContent` → navigate | 4-step fake progress, no AI | Prefill round-trip works; form state real |
| ContentPage | View preview / hit export | Context read (memory) | Entire preview body; export buttons inert | Correct not-found/ErrorState path |
| Library | Browse → filter → open | None (reads `data/subjects.js`) | All data; doc links `#` | Search/filter logic works against mock array |
| Assistant | Type → send → mock reply | None (memory only) | Entire AI reply, picker data | Chat UI, chips, typing indicator, attachment UX |

**Diagram:**
```
[UI pages] ──Context──► {prefillPrompt, generatedContent}  (React memory)
     │                        ▲
     │                        └────── survives ONLY navigation, LOST on refresh
     └── mock data: data/subjects.js, data/constants.js, STATS/RECENT
```

---

## 2. LocalStorage Readiness Audit

| Store | Suggested key | Currently | Status |
|---|---|---|---|
| contents | generated content objects | in-memory Context only | **Not Ready** |
| chat_history | assistant messages | in-memory useState | **Not Ready** |
| drafts | partial prompts | not captured at all | **Not Ready** |
| settings | theme (+ future prefs) | theme persisted via TopNav | **Ready (partial)** |
| recent_activity | dashboard "Recent" feed | hardcoded `RECENT` array | **Not Ready** |

**Hardcoded today:** `STATS`/`RECENT` (Dashboard), `subjects`/`DOC_TYPES` (Library + Assistant picker), All ContentPreview bodies (ContentPage), All AI replies (Assistant), generation steps.

**Should become persistent:** generated `contents`, `chat_history`, `drafts` (prompt+options autosave), `settings`, and `recent_activity` derived from contents/activity.

**Verdict: NOT READY.** Zero persistence of product data exists. Theme-only storage is implemented.

---

## 3. Service Layer Audit

**Separation-of-concerns violations (current):**
- Pages depend directly on mock arrays (`data/subjects.js`, `data/constants.js`) instead of a service API.
- Generator writes directly to Context (`setGeneratedContent`) instead of `contentService.create()`.
- ContentPage reads via Context instead of `contentService.get(id)`.
- Library/Assistant import `subjects`/`DOC_TYPES` arrays directly.
- Dashboard hardcodes STATS/RECENT inline instead of `activityService` / `contentService.listRecent()`.
- `getMockAIResponse` lives inside the Assistant page file (`Assistant.jsx:6-18`) — AI logic embedded in UI.

**Required refactors:**
1. Create `src/services/` with `contentService`, `chatService`, `settingsService`, `activityService`, each wrapping a thin storage adapter.
2. All pages call services; mock arrays move into the service layer as seed data (only if storage empty).
3. Remove direct `data/*` imports from pages.
4. Move mock-AI response into `aiService` (local heuristic + mock) so swapping in a real API is one file.
5. Context shrinks to orchestration (loading/persisting via services), not data ownership.

---

## 4. Generator Flow Audit

**Target:** Prompt → Generate → Save → persist to localStorage → appears in Library → opens ContentPage.

**Current:** Prompt → (mock steps) → in-memory Context → ContentPage. Nothing saved, nothing appears in Library, ContentPage dies on refresh.

| Requirement | Today? | Gap |
|---|---|---|
| Generate | ✅ (mock) | No real generation |
| Save generated content | ❌ | `setGeneratedContent` = memory only |
| Store in localStorage | ❌ | No persistence |
| Appear in Library | ❌ | Library reads separate hardcoded `subjects` |
| Open ContentPage from Library | ❌ | Library items `#` links; ContentPage only accepts Context id |

**Gap:** Generator is the chokepoint. Fix = `contentService.create(content)` (writes localStorage + returns id) → Library reads `contentService.list()`.

---

## 5. Library Flow Audit

**Target:** read localStorage → filter → search → open.

**Current:** reads `data/subjects.js` (2 static Thai subjects), filter/search operate over the mock array, "open" = `window.open("#")`.

| Requirement | Today? | Gap |
|---|---|---|
| Read from localStorage | ❌ | Reads mock array |
| Filter / search | ✅ | Logic works (over mock data) |
| Open content | ❌ | Doc links `#`; no ContentPage wiring |
| Include user-generated items | ❌ | Completely separate dataset |

**Gap:** Filter/search/sheer UI is reusable but the data source must switch to `contentService.list()`. The subject→chapter→document drill-down is fictional static content — either replace with a flat generated-content grid or keep as "curriculum templates" seeded by the service.

---

## 6. Assistant Flow Audit

**Target:** message → AI response → store conversation → restore on refresh.

**Current:** message → `setTimeout` canned reply → in-memory `messages` → **lost on refresh**.

| Requirement | Today? | Gap |
|---|---|---|
| Chat history persistent | ❌ | useState only |
| Restore on refresh | ❌ | No init from storage |
| Library context reusable | ✅ (partial) | Picker reads mock; selected docs are sent with message |
| Real AI | ❌ | Mock reply; no API call |

**Gap:** `chatService.list()/append()` + hydrate `useState` on mount closes persistence. Library context is already structured (`docLabel`) — good shape. AI mock should move to `aiService`.

---

## 7. Production Without Backend (Offline MVP CRUD)

| Entity | Create | Read | Update | Delete | Status |
|---|---|---|---|---|---|
| Generated Content | ❌ memory | ❌ memory | ❌ n/a | ❌ n/a | In-memory only |
| Chat History | ❌ memory | ❌ memory | ❌ | ❌ | In-memory only |
| Drafts | ❌ not implemented | ❌ | ❌ | ❌ | Missing entirely |
| Settings (theme) | ✅ | ✅ | ✅ | — | Only persistent item |

**Offline MVP Readiness: 2.5 / 10.** The UI shell is production-shaped; every data flow is a simulation. Until `contentService`/`chatService`/`activityService` persist to localStorage, the app "works" only within a single navigation session.

---

## 8. Future Upgrade Path (migration strategy)

- **Now:** Pages call `contentService.create()`, `chatService.append()`, etc. — never `localStorage.setItem` or array-push in components.
- **Layer:** `service` → `storageAdapter` (localStorage impl). Swap adapter for HTTP later:
  ```
  // src/services/storageAdapter.js — today
  const adapter = { get, set, del };
  // tomorrow: adapter hits POST/GET /api/contents
  ```
- Services return **async** Promises (or sync-but-adaptable signatures) so the HTTP swap doesn't change callers.
- Keep a `seed()` in services that hydrates empty storage from `data/*.js` — reuses existing mock content as default library data.
- Move mock AI into `aiService.generate()`; keep signature `(message, context) => {content}` so a real API slot-in is a single file change.
- IDs via `crypto.randomUUID()` (or existing `uuid` dependency) instead of `Date.now()` to avoid collision-prone keys.

---

## 9. Final Report

### 1. Current Architecture Diagram
```
React (Vite) ── 5 pages
   ├─ AppContext.jsx  {prefillPrompt, generatedContent}  ◄─ only cross-page state
   ├─ data/           constants.js, subjects.js, subjectIcons.js  ◄─ hardcoded mocks
   ├─ components/     ui.jsx (shared), TopNav.jsx (only localStorage user: theme)
   └─ NO services/ , NO lib/
```
### 2. Current Data Flow Diagram
```
Dashboard ──► Context(prefillPrompt) ──► Generator ──► Context(generatedContent) ──► ContentPage ──X refresh
Library ──► data/subjects.js (static)                       Assistant ──► useState (static, X refresh)
```
### 3. Remaining Mock Data Locations
- `data/subjects.js` — Library + Assistant picker (static curriculum)
- `data/constants.js` — `EXAMPLE_PROMPTS`, `GENERATION_STEPS` (OK as constants; not user data)
- `Dashboard.jsx` — `STATS`, `RECENT`, `AI_SUGGESTIONS`, loading timer
- `ContentPage.jsx` — all 6 preview bodies, inert PDF/DOCX/PPTX buttons
- `Assistant.jsx` — `getMockAIResponse` inline, typing timer
- `Generator.jsx` — 4-step fake progress

### 4. Required Refactors
1. Add `src/services/` (`contentService`, `chatService`, `settingsService`, `activityService`, `aiService`, `storageAdapter`).
2. `contentService.create()` in Generator; ContentPage/Library read via `get(id)`/`list()`.
3. Chat persistence via `chatService`; hydrate on Assistant mount.
4. Dashboard `RECENT`/stats from `activityService`/`contentService`.
5. Move mock AI out of the page into `aiService`.
6. Add drafts autosave (prompt + selections) into `settings`/`drafts`.
7. Wire Library "open" to `navigate('/content/:id')`.

### 5. Recommended Service Layer
```
src/services/
  storageAdapter.js   get/set/del (localStorage, JSON, seed support)
  contentService.js   create, get, list, update, remove
  chatService.js      list, append, clear
  settingsService.js  get/set (theme + prefs)
  activityService.js  trackRecent, listRecent
  aiService.js        generate(message, context)  [mock → real later]
```

### 6. Offline MVP Readiness Score
**4/10** overall:
- Architecture readiness: 6/10 (clean component/UI separation already good)
- Persistence readiness: 1/10 (only theme persists)
- Data-readiness: 3/10 (search/filter/preview logic reusable, data mocked)

### 7. Top 10 Next Tasks
1. Create `storageAdapter` (get/set/del with JSON + seed-from-`data/`).
2. `contentService` + swap Generator to `create()`.
3. ContentPage: load by id via service; make it refresh-safe.
4. Library: read `contentService.list()`, open via route to ContentPage.
5. `chatService` + hydrate Assistant on mount (persist conversation).
6. Move mock AI to `aiService` (single-file future API swap).
7. Dashboard `recent_activity` from services (replace hardcoded RECENT/STATS).
8. Drafts autosave in Generator (`drafts` store) + restore.
9. Replace `Date.now()` ids with `crypto.randomUUID()`/`uuid`.
10. Wire export buttons (file-saver dep already present) or remove until real.

---

**No code was modified — audit only.**