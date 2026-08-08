# KruMate UI Audit & Redesign Proposal

**Against:** Elicit, Linear, Notion, Gamma
**Scope:** Visual hierarchy, spacing, typography, information density, mobile experience
**Constraints (locked):** architecture, routes, services, brand colors (`krumate-teal #0d9488`, `krumate-navy #102a43`, `krumate-amber #b45309`, `krumate-background #f4f7f7`), functionality, workflows
**Date:** 2026-08-08

---

## 1. UI Audit

### 1.1 Baseline: what exists today

- **Design tokens** — solid 60/30/10 system (`@theme` in `index.css`): dominant neutrals, navy text, teal primary, amber highlight. Dark mode full token set.
- **Fonts:** `Inter` only (latin). No Thai-friendly glyph coverage — Thai text falls back to system fonts, breaking vertical rhythm against latin numerals/headings.
- **Components** (`ui.jsx`): `Button` (sm/md × primary/secondary/ghost, `rounded-[10px]`), `Card` (`rounded-xl` + `border`), `Input`/`Textarea` (`rounded-[8px]`), `Pill`, `SourceBadge`, `Skeleton`, `EmptyState`, `ErrorState`.
- **Pages:** `TopNav` (h-14, drawer on mobile), Dashboard (hero + prompt + quick actions + stats + recent + AI suggestions), Generator (2-col wizard + option cards), Library (search/filter + result grid), ContentPage (preview + export), Assistant (chat, full height).

### 1.2 Audit against reference products

I scored each product dimension 1–5 (5 = best). Findings below are "current vs. target behavior".

| Dimension | Elicit (academic density) | Linear (linear app) | Notion (airy editor) | Gamma (presentation) |
|---|---|---|---|---|
| Hierarchy by scale | Titles all `text-2xl`-ish, few tiered type styles | Strong 3-tier scale | Very strong size/weight hierarchy | Oversized display type |
| Spacing rhythm | Tight 8px grid, dense tables | 4px grid, compact | Generous whitespace, 8px+ | Large rounded cards, whitespace |
| Density | Very high (tables, filters) | High (rows, sidebar) | Low-mid | Low |
| Contrast/noise | Clean, monochrome | Restrained, focus borders | Minimal chrome | Bold color blocks |
| Motion | Subtle | Purposeful | Gentle | Maximal |

**Reference-synthesis ("what KruMate should be")**: an educational tool. Best mix is *Gamma's hierarchy and rounded warmth*, *Notion's whitespace and typographic calm*, *Linear's density and focus discipline*, *Elicit's scannable data rows* (very relevant to the Library grid and Dashboard stats).

### 1.3 Concrete findings

**Visual hierarchy**
1. **Flat dashboard hero** — the big `text-3xl/4xl` heading + center-aligned hero makes the page top-heavy and uninteresting; the "wow" anchor of the product is the prompt, but the form is visually buried in a boxed card behind large display text. → Tier the hero: eyebrow label + wordmark recall, tighter headline, form as the visual center.
2. **One-size-fits-all section titles** — all section headers use the same `text-base font-bold` class; no tiering (sections vs. sub-labels vs. captions). Linear/Notion rely on *size + weight + color* tiers.
3. **Mixed title casing** — pages inconsistently use `text-2xl font-extrabold tracking-tight` vs `text-3xl`; tab pills and labels compete at similar weight with titles.

**Spacing**
4. **Inconsistent rhythm** — Cards use `p-4`, others `p-6`, `p-8`; grid gaps vary `gap-4` vs `gap-6` vs `gap-8`; header uses different paddings. → Space is used as a "close attention" cue; today it reads as drifting.
5. **Button vs. input vertical alignment** — form rows (`Input` + `Button`) don't align to a shared baseline; the Export row in ContentPage puts icon buttons in a tight group.

**Typography**
6. **No Thai-friendly font** — Thai rendered via fallback system font ≠ Inter metrics; hybrid Latin/Thai text (e.g., "Weekly 45 นาที") misaligns. → Load a Thai font (e.g., Google Fonts `"Noto Sans Thai"` or prompt-matched `Sarabun`) and make `--font-thai` part of the stack.
7. **Missing type scale** — no `display/xl`, only `base/md/lg`. No `font-variation` or line-height discipline for Thai ascenders/descenders.
8. **Eyebrow utility** (`label-eyebrow`) exists but is not used consistently — caps/lowercase mix in page chrome.

**Information density**
9. **Empty-ish dashboard first screen** — big hero, huge spare radius on cards. Given a teacher-app, the top 600px should surface *actionable density* (today's counts, due chains, quick actions) like Elicit's top-summary.
10. **Assistant** — the composer at the bottom is good; messages need smaller line-lengths and a better meta line (source badge + thinking label).
11. **ContentPage export utilities** — three export buttons w/ different glyphs already; needs grouping + actual spacing control.

**Mobile experience**
12. **Hero + prompt** — Dashboard hero padding/headers get heavy on small screens; the action button sits below the fold.
13. **Content pages** assume a desktop-ish width; tight grids & wide metadata rows need `sm:`/`lg:` stacking rules.

### 1.4 Score summary

| Attribute | Current | Reference target |
|---|---|---|
| Hierarchy | 3/5 | 4.5/5 |
| Spacing rhythm | 3/5 | 5/5 |
| Typography | 3/5 | 4/5 |
| Information density | 3/5 | 4/5 |
| Mobile | 3/5 | 5/5 |

---

## 2. Wireframe Proposal

Below: three ASCII wireframes — **Dashboard**, **Generator**, **ContentPage** — showing the target composition. Keeps routes, pages, services, tone of brand. Everything designed on a **4×4 spacing grid**, consistent **`rounded-xl` corner radii**, new **type tier system**.

### 2.1 Dashboard (Gamma head + Linear density)

```
┌────────────────────────────────────────────────────────────┐
│ TOP NAV — โลโก้ / หน้าเรียน · คลังผลงาน · สร้าง / [ดาร์ก]  │
├────────────────────────────────────────────────────────────┤
│  EYEBROW  สรุปภาพรวม                                         │
│  TITLE    ดึงศักยภาพห้องเรียน                                │
│  ┌─────────────────────────────────────┐  ┌──────────────┐ │
│  │ [ big prompt textarea … ]          │  │  ดำเนินการ   │ │
│  │ [▼ระดับ] [▼วิชา] [▼ประเภท]  ▶ สร้าง  │  └──────────────┘ │
│  └─────────────────────────────────────┘                  │
│                                                           │
│  SECTION: สถิติล่าสุด                             (2×)    │
│  ┌─────────┬─────────┬─────────┬─────────┐                │
│  │ 12 ผลงาน│ 3 แบบพิมพ์│ 4 ชม.   │  1 กำลัง  │                │
│  └─────────┴─────────┴─────────┴─────────┘                │
│                                                           │
│  SECTION: ผลงานล่าสุด                        [ดูทั้งหมด] │
│  ▸  ชีทแบบทดสอบ … 45 น.  <AI>  [PDF][DOCX][PPTX]        │
│  ▸  แผนบทเรียน … 60 น. <AI>  [...]                       │
├────────────────────────────────────────────────────────────┤
```

**Changes vs. today:** hero re-ordered (`eyebrow → title → prompt block`); stat cards **condensed into a 4-wide track with big numbers** (Elicit/Linear density); "ดูทั้งหมด" is a real link to `/library`; recent items use **dense rows with action affordances** (Linear table) instead of loose tiles.

### 2.2 Generator (2-column of wizard + preview)

```
┌────────────────────────────────────────────────────────────┐
│ TOP NAV                                                    │
├────────────────────────────────────────────────────────────┤
│ [˂ กลับ]  EYEBROW: ตัวช่วยสร้าง   TITLE: สร้างบทเรียน      │
│  STEP 1/4 ●○○○  ระดับชั้น                                   │
│  ┌── WIZARD (70%) ──────────────────┐  ┌─เคล็ดลับ (30%)────┐│
│  │ 1. ระดับชั้น   [ป.1][ป.2][ป.3]..  │  │ ✨ ใช้คำอธิบายสีให้ ││
│  │ 2. วิชา        [คณิต][วิทย์][ไทย] │  │    concrete       ││
│  │ 3. หัวข้อ       [prompt box]      │  │ ✨ …              ││
│  │ 4. ประเภทผลลัพธ์ [⧉][▦][◫] ……      │  └──────────────────┘│
│  │               [▶ สร้างบทเรียน]    │  ─────────────────   │
│  └──────────────────────────────────┘  ──────────────────  │
├─────────────────────────────────────────────────────────────┤
```

**Changes:** explicit **step number + progress rail** (Linear); option choices become denser button rows instead of oversized tiles; generate button **visible within the wizard column** (not pushed below fold); tip panel stays as a secondary column.

### 2.3 ContentPage — focused reader rail

```
┌────────────────────────────────────────────────────────────┐
│ TOP NAV                                                    │
├────────┬───────────────────────────────────────────────────┤
│  sidebar│  [˂ กลับ]  EYEBROW: เอกสาร                        │
│  (lg+) │  TITLE: แผนการสอนเรื่องเศษส่วน                   │
│        │  META ─ คณิตศาสตร์ · ป.6 · 45 น. · <AI·ไทย·ตรง>  │
│        │  ┌───────────────────────────────────────────┐   │
│        │  │  BODY SECTION                             │   │
│        │  │  (clean long-form, max-w, Thai font)      │   │
│        │  │  …                                        │   │
│        │  └───────────────────────────────────────────┘   │
│        │  ────────────────────────────────────────────    │
│        │  [สร้างต้นฉบับ] [ส่งออก PDF] [DOCX] [PPTX]        │
├────────┴───────────────────────────────────────────────────┤
```

**Changes:** optional left rail (`hidden lg:` for chrome consistency); metadata compressed to **one dense tag line** (Elicit-style) replacing the separate created-at card; export controls kept together at bottom; body gets a max-readable-width so Thai paragraphs don't stretch.

---

## 3. Component changes

### 3.1 Theme (index.css) — token additions, non-breaking

| Token | Value | Use |
|---|---|---|
| `--color-krumate-border-strong` | teal-darken (navy · 20%) | `hover`/focus borders |
| `--color-krumate-ink` | duplicate navy (alias) | — |
| `--font-thai` | `"Sarabun", "Noto Sans Thai", system-ui` | Thai alias stack |
| Type scale: `.type-eyebrow` (exists), add `.type-title` / `.type-lg` | — | Tier hierarchy |

**Merge font:** `body { font-family: "Inter", "Sarabun", "Noto Sans Thai", sans-serif; }` with `@import` of Sarabun (already in public/fonts for export) — reuse glyphs for UI so headers/metadata are consistent with exports.

### 3.2 `ui.jsx` components

1. **`Button`** — add `size="lg"` (`px-5 py-2.5`), `size="icon"` (`size-9` for glyph-only), keep variants. Add `rounded-lg` default `[10px]` (already). Align height: make all `min-h` consistent (`h-9`/`h-10`?) via a single `--btn-h` — but this could change rows; lock heights per size (`h-9 sm` h-10 md h-11 lg) for aligned rows.
2. **`Skeleton`** — allow `shape="rect|circle"`; density: stand-alone now fine.
3. **New: `SectionHeading`** — renders `label-eyebrow` + title (`text-lg font-semibold text-krumate-text`) + optional `action` slot; houses the tier hierarchy everywhere (consolidates scattered headings).
4. **New: `MetricCard`** — variant of Card for stats: big number (`text-2xl/3xl`), tight label (2.5 density), optional icon/tint. Replaces ad-hoc stat markup in Dashboard.
5. **New: `ActionRow`/`LinkButton`** — for "ดูทั้งหมด" as quiet link-style button (typographic not pill).
6. **`Card`** — add `padding` prop (`pad="md|lg|xlg"` map to `p-4 | p-6 | p-8`) to end the `p-*` guessing; updates are source-compatible.
7. **`Pill`** — optional `tone="strong|accent|neutral"` to prevent pill-only hierarchy (linear-style).

### 3.3 Layout primitives (new, in `components/`)

- **`PageHeading`(title, eyebrow, actions)** — standardizes page chrome: eyebrow (11px mono, `type-eyebrow`) + title (`text-2xl lg:text-3xl font-semibold tracking-tight`) + actions right. Used by every page. Gives immediate consistent hierarchy.
- **`StatStrip`(items)** — horizontal density track for the 4 stats (replaces 3-card loose grid).
- **`ListCardItem`** — dense row; used in Dashboard "ล่าสุด" and Library's tab content.
- **`FooterNote`** — optional.

---

## 4. Page-by-page redesign plan

Order: **tokens/planes first**, then **`Page` heading** + `MetricCard`/`StatStrip`, then pages. No route changes; classes only inside components/pages.

| 1 | `index.css` | Import `Sarabun` font (weights 400/500/700), extend `@theme` with `--font-thai`, wire `body` stack; add `.type-title` + `.type-h2` tiers; document radius scale. | low |
| 2 | `ui.jsx` | Add `Button size="lg"` / `size="icon"`, min-h lock; add `SectionHeading`, `StatStrip`, `MetricCard`, `ListCardItem`, `LinkButton`; `Card` `pad` prop; `Pill` variant. | med |
| 3 | `pages/TopNav` | Retype nav row with new font stack (Thai), keep routes; align heights (h-14). | low |
| 4 | `pages/Dashboard` | Reorder hero → prompt-first; `SectionHeading` for the two sections; replace stats with `StatStrip`/`MetricCard`; recent → `ListCardItem` rows; "ดูทั้งหมด" correct link; add `PageHeading`. | med |
| 5 | `pages/Generator` | Step index / "X/4" indicator; option cards → tighter grid (rows) + strong labels; tip panel copy + sections; form focus-ring alignment. | med |
| 6 | `pages/ContentPage` | Navrail `hidden lg:`; `PageHeading` w/ metadata row; dense metadata pills; export buttons wrapped in `Button size="icon"` + labels; remove extra created-at gap. | med |
| 7 | `pages/Library` | `PageHeading`; sections use `SectionHeading`; tighten cards via `Card pad="sm"`; mobile keep single-column + gap rhythm. | low |
| 8 | `pages/Assistant` | Messages: `max-w` line length, `type-h2` on assistant labels, source badge alignment; composer `min-h` keep; add footer-safe padding. | low |
| 9 | verify | `node --test`, `lint`, `build`; visual pass at 390/768/1440; dark mode spot-check. | — |

### Sequencing & risk
- Then map one page at a time (Dashboard first = highest-amenity benefit); re-verify per page.
- Mobile: define one breakpoint pass (`sm:` mobile, `lg:` desktop rail on ContentPage).
- **No functionality changes**: form behavior, export paths, fixtures, assistant behavior unchanged — classes/tokens only.

---
**Files expected to change:** `index.css`, `ui.jsx`, `TopNav`, `Dashboard.jsx`, `Generator.jsx`, `ContentPage.jsx`, `Library.jsx`, `Assistant.jsx`. Routes/services untouched. No new dependencies — reuse the Sarabun fonts already served from `public/fonts` for exports.