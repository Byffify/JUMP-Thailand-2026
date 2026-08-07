# KruMate OS — UI/UX Redesign Specification

- **Date:** 2026-08-07
- **Product:** KruMate OS — AI Teaching Studio for Thai teachers
- **Scope:** Redesign entire application UI to a modern SaaS experience (Linear/Notion/Stripe/Notion discipline), remove anything not justified by `requirement.md`, preserve the KruMate brand palette, convert sidebar nav to responsive top navbar + mobile drawer.

## Sources of Truth

| Priority | Source | Used for |
|---|---|---|
| 1 | `requirement.md` | Which screens/features/actions exist. Everything must map here. |
| 2 | `src/index.css` | Brand tokens (KruMate navy/teal/amber, semantic colors). **Unchanged.** |
| 3 | `elicit.design.md` (hybrid, selective) | Discipline only: hairline borders, restrained accent use, small mono eyebrow labels, tight spacing. **Not** its academic serif/parchment/chartreuse identity. |

## Design Identity

Modern SaaS AI workspace inspired by Linear, Stripe, Notion, Vercel, Mercury. Clean, minimal, high information density, token-driven. Hybrid borrows Elicit's "archival" discipline (hairlines, no decorative gradients, restrained accent) without importing Elicit's brand (deep teal/chartreuse/serif/parchment).

### Typography
- Inter only (Google Fonts import in `index.css` with system fallback). No serif, no DM Mono body.
- Scale: display 28–32px, page titles 20–22px, section titles 16px semibold, body 14px, caption/meta 12.5–13px.
- Optional mono eyebrow label token (`font-mono text-[11px] uppercase tracking-wider`) for section labels/timestamps only.

### Radius scale
- Inputs/fields: **8px** (`rounded-lg`)
- Cards/surfaces: **12px** (`rounded-xl`)
- Buttons: **10px**
- Chips/tags/pills: full pill only for tiny badges
- No `rounded-3xl`, no pill buttons, no `rounded-2xl` cards.

### Effects
- No gradients, no blurred glow circles, no heavy shadows.
- Separation via 1px hairline borders + surface-color shifts (Elicit discipline).
- Restrained elevation: subtle shadow on hover only (e.g. `shadow-sm → shadow-md`).

### Brand colors (UNCHANGED, from index.css)
- Navy `--color-krumate-navy`, Teal `--color-krumate-primary`, Amber `--color-krumate-highlight`, surfaces, text, borders, semantic. All `krumate-*` tokens preserved in light + dark mode. No raw Tailwind `teal-600`, `slate-*`, `violet-*`, `rose-*`, `emerald-*` in components.

## Information Architecture

### Route map (final — every route justified by requirement.md)
| Route | Page | Requirement source |
|---|---|---|
| `/` | Dashboard | Dashboard Requirements |
| `/generator` | Generator | Generator page |
| `/content/:id` | ContentPage (Generated Content) | Generated Content page |
| `/library` | Library | Content Library |
| `/assistant` | Assistant | AI Assistant page |

**Removed:**
- Sidebar + all sidebar-only concepts (TeamSwitcher, team/workspace switcher, "@example666", ⌘ shortcuts, ตั้งค่า group + dead subs, collapse trigger) — no longer required by navigation architecture; workspace/team not in requirements.
- Bell + Settings icon buttons in Generator header — speculative, not in requirements.

## Navigation Architecture

Responsive top navigation; no sidebar at any breakpoint.

### Desktop (≥1024px)
Top navbar: logo (left) · primary nav links (4: แดชบอร์ด / สร้างสื่อ / คลัง / ผู้ช่วย AI) · right cluster: theme toggle, avatar. Content in a max-width column below.

### Tablet (768–1023px)
Top navbar: compact logo + 4 icon+label links (truncating labels on narrow widths), theme toggle right.

### Mobile (<768px)
Top navbar: logo + hamburger. **Drawer** slides in (left side), full overlay, close button; 4 links as full-width touch targets; theme toggle inside drawer and header.

Components: `TopNav`, `Drawer` (context or simple state). Breakpoint via CSS/Tailwind `md:`/`lg:`; no JS resize listener needed for show/hide (CSS-driven), JS only for drawer open state.

## Shared Component Library

Single source of truth — every page uses only these. No inline `style={}` in pages.

- `Button` — variants: primary (teal), secondary (surface hairline), ghost. Sizes sm/md. Rounded 10px.
- `Card` — 12px radius, 1px hairline, optional hover elevation.
- `Input` / `Textarea` — 8px radius, hairline border, focus ring teal.
- `Pill` — tiny tag/badge, full-pill radius.
- `Skeleton` — loading placeholder.
- `EmptyState` — icon + title + description + optional action.
- `ErrorState` — icon + message + retry.
- `TopNav`, `Drawer` — responsive navigation.

## Screen-by-Screen

### Dashboard (`/`)
- Keep: headline "วันนี้คุณอยากสอนเรื่องอะไร?", prompt box (tabs + textarea + attach + submit), Quick Actions, Stats, Recent Creations, CTA banner, AI Suggestions/example prompts.
- Remove: gradient/glow hero → flat light hero band (white surface, hairline, teal accent). Remove violet/rose/emerald icon tints → token surfaces.
- Simplify: unified `Card`, token surfaces, consistent 12px radius, section titles via shared pattern.

### Generator (`/generator`)
- Keep: prompt textarea, subject/grade/output-type selectors, example prompts, tips card, generation steps.
- Remove: Bell/Settings header buttons.
- Simplify: `OptionButton` → token-driven selectable cards (single shared component), 12px radius, 8px gaps.

### ContentPage (`/content/:id`)
- Keep: back link, pills (subject/grade/type), title, export buttons (PDF/DOCX/PPTX — supports "Export or Save"), preview card, created-at metadata.
- Add: empty state (no content found), error state.
- Simplify: shared `Card`/`Pill`/`Button`, tokens, no `text-slate-*`.

### Library (`/library`)
- Rebuild: strip all inline styles (beige surfaces, emoji icons, manual hover JS). Token system + lucide icons.
- Keep: search, subject filter, grade filter, clear filters, subject → chapter → document drill-down (all required by Content Library).
- Add: skeleton loading, empty state ("ไม่พบรายการที่ค้นหา"), document cards with view/download actions.

### Assistant (`/assistant`)
- Rebuild: strip inline styles + emoji bubbles → token chat (user bubble white/surface, assistant surface-strong, 12px radius, brand primary send button, lucide paperclip/library icons).
- Keep: file attach, library picker modal, mock response flow.
- Add: empty state (pre-first-message prompt), typing indicator kept.

### index.css
- Keep all tokens. Add Inter import + base `font-family`. Add optional mono-eyebrow utility class. No color changes.

### App.css
- Remove Vite boilerplate (`.counter`, `.hero`, `#center`, `#next-steps`, etc.) — unused.

## Requirement Validation Log

| Removed / changed | Why |
|---|---|
| Sidebar navigation | Converted to top navbar (explicit constraint). |
| Team/workspace switcher, "@example666", ⌘ shortcuts | Workspace/team concepts not in requirement.md. |
| ตั้งค่า nav group + subs | Dead links (`link:"#"`), Settings not a required page. |
| Generator header Bell/Settings buttons | Not in requirements; speculative. |
| Gradient hero + glow + heavy shadows | Violates clean/minimal requirement; brand palette preserved via flat surfaces. |
| `App.css` boilerplate | Unused Vite scaffold styles. |
| Inline-style pages (Library, Assistant) | No design system; rebuild on shared tokens. |

## Not in scope
- Real AI generation, real auth, real file storage, real export files, settings page, analytics beyond the three existing stat cards, workspace management.
- Any color token changes to `index.css`.

## Success criteria
- All 5 required routes present with top navbar + drawer responsive nav.
- Every page uses only shared components; no inline styles remain in pages.
- Brand tokens only; no unbranded Tailwind color classes in new code.
- Loading/empty/error states present on data pages (Library, Assistant, ContentPage, Dashboard recent/stats).
- Runs clean under `npm run lint` and `npm run build`.
