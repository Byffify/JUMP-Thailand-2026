# KruMate OS UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the KruMate OS app UI into a token-driven, modern SaaS experience with a responsive top-nav + mobile drawer, shared component library, and loading/empty/error states — removing everything not justified by `requirement.md`.

**Architecture:** Replace per-page inline styles and the sidebar layout with a shared component library (`Button`, `Card`, `Input`, `Textarea`, `Pill`, `Skeleton`, `EmptyState`, `ErrorState`) plus responsive `TopNav`/`Drawer`. All pages consume only these shared components and brand tokens. `App.jsx` swaps `Sidebar` for a new `AppLayout` top-nav shell. Sidebar.jsx is deleted; ui.jsx is rebuilt.

**Tech Stack:** React 19, React Router 7, Tailwind CSS v4 (via `@tailwindcss/vite`), lucide-react, framer-motion (drawer animations), Vite. No test framework; verify via `npm run lint` (oxlint) and `npm run build`.

## Global Constraints

- Brand tokens in `src/index.css` are **UNCHANGED**. Never edit or add to the `@theme`/`:root`/`.dark` color tokens.
- No unbranded Tailwind color classes in new code: no `slate-*`, `teal-600/700`, `violet-*`, `rose-*`, `emerald-*`, `amber-*` except `amber` via `krumate-highlight`. Use `krumate-*` tokens (`bg-krumate-surface`, `text-krumate-text`, `text-krumate-muted`, `border-krumate-border`, `bg-krumate-primary`, etc.) with `dark:` variants.
- All page copy stays in Thai, matching existing strings.
- Radius language: fields 8px (`rounded-lg`), cards 12px (`rounded-xl`), buttons 10px, tiny tags pill. No `rounded-3xl`, no pill buttons on primary actions.
- No gradients, no blurred glow, no `shadow-2xl`; separation via 1px hairlines (`border-krumate-border`); hover elevation is `shadow-sm -> shadow-md` at most.
- Pages may only use: shared components (`src/components/ui.jsx`), tokens, lucide-react icons. **No inline `style={}` in page components.**
- Inter is the only font family (Google Fonts import in `index.css`).
- Every remaining route must map to `requirement.md` (`/`, `/generator`, `/content/:id`, `/library`, `/assistant`).
- Run `npm run lint` and `npm run build` after each task; both must pass before committing.

---

### Task 1: Add Inter font + shared UI component library

Rebuild the empty `src/components/ui.jsx` into the single shared component library and wire Inter globally.

**Files:**
- Modify: `src/index.css` (add Inter import + font-family + mono-eyebrow utility; do NOT alter tokens)
- Create/Overwrite: `src/components/ui.jsx`

**Interfaces:**
- Produces: exports `cn` (classnames join), `Button({variant,size,className,children,...props})` variants `primary|secondary|ghost`, sizes `sm|md`, `Card({className,children,...props})`, `Input({className,...props})`, `Textarea({className,...props})`, `Pill({className,children})`, `Skeleton({className})`, `EmptyState({icon:Icon,title,description,action,className})`, `ErrorState({message,onRetry,className})`. All classNames merge with caller's `className` (caller wins).

- [ ] **Step 1: Add Inter + base font + eyebrow utility to `index.css`**

At the very top of `src/index.css`, before `@import "tailwindcss";`, nothing changes order; instead add the font import as the first line **above** the Tailwind import (Tailwind v4 `@import` rules require font `@import url(...)` to precede it when using `@import "tailwindcss"`):

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import "tailwindcss";
```

Inside the existing `@layer base` block, add a body font-family override by appending to the existing `body { ... }` rule:

```css
  body {
    min-height: 100vh;
    background-color: var(--color-krumate-background);
    color: var(--color-krumate-text);
    font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
    transition:
      background-color 0.25s ease,
      color 0.25s ease;
  }
```

Add a mono-eyebrow utility class at the end of the file (outside any layer, a plain CSS class):

```css
.label-eyebrow {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

- [ ] **Step 2: Run lint + build**

Run: `npm run lint`
Expected: PASS (no errors).
Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Write the shared component library `src/components/ui.jsx`**

Replace the entire file with the following:

```jsx
export const cn = (...classes) => classes.filter(Boolean).join(" ");

const BTN_SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
};

const BTN_VARIANTS = {
  primary:
    "bg-krumate-primary text-white hover:bg-krumate-primary-dark disabled:opacity-50",
  secondary:
    "border border-krumate-border bg-krumate-surface text-krumate-text hover:bg-krumate-surface-strong",
  ghost: "text-krumate-muted hover:bg-krumate-surface-strong hover:text-krumate-text",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] font-medium transition-colors disabled:cursor-not-allowed",
        BTN_SIZES[size],
        BTN_VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-krumate-border bg-krumate-surface",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-[8px] border border-krumate-border bg-krumate-surface px-3 py-2 text-sm text-krumate-text placeholder:text-krumate-muted focus:border-krumate-primary focus:outline-none focus:ring-2 focus:ring-krumate-primary/25",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={cn(
        "w-full resize-y rounded-[8px] border border-krumate-border bg-krumate-surface px-3 py-2 text-sm text-krumate-text placeholder:text-krumate-muted focus:border-krumate-primary focus:outline-none focus:ring-2 focus:ring-krumate-primary/25",
        className,
      )}
      {...props}
    />
  );
}

export function Pill({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-krumate-border bg-krumate-surface-soft px-2 py-0.5 text-xs font-medium text-krumate-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-krumate-surface-strong",
        className,
      )}
    />
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-krumate-border bg-krumate-surface px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && <Icon size={28} className="text-krumate-muted" />}
      <p className="text-sm font-semibold text-krumate-text">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-krumate-muted">{description}</p>
      )}
    </div>
  );
}

export function ErrorState({ message = "เกิดข้อผิดพลาด", onRetry, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-krumate-border bg-krumate-surface px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm font-semibold text-krumate-text">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          ลองอีกครั้ง
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run lint + build**

Run: `npm run lint`
Expected: PASS.
Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/ui.jsx
git commit -m "feat: add Inter font and shared UI component library"
```

---

### Task 2: Build TopNav + Drawer responsive layout

**Files:**
- Create: `src/components/TopNav.jsx`
- Modify: `src/App.jsx` (use new layout), delete `src/components/Sidebar.jsx`

**Interfaces:**
- Consumes: `cn`, `Button` from `src/components/ui.jsx`; `NavLink`, `Link`, `Outlet` from react-router-dom; `Home`, `Sparkles`, `Store`, `Users`, `PanelLeft`, `X`, `Moon`, `Sun` from lucide-react.
- Produces: default export `AppLayout({routes})` that renders a top navbar + `<Outlet/>`. Routes used internally: array of `{to, label, icon}`. TopNav renders a `nav` with brand link, desktop link row, theme toggle, and a mobile hamburger toggling a `Drawer` overlay.

- [ ] **Step 1: Create `src/components/TopNav.jsx`**

Theme toggle is managed with `useState` initialized from `localStorage`/`prefers-color-scheme`, toggling the `.dark` class on `document.documentElement` and persisting to `localStorage` — same behavior previously in Sidebar.

```jsx
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Home, Sparkles, Store, Users, Menu, X, Moon, Sun } from "lucide-react";
import { Button, cn } from "./ui.jsx";
import logo from "../assets/logo.png";

const ROUTES = [
  { to: "/", label: "แดชบอร์ด", icon: Home, end: true },
  { to: "/generator", label: "สร้างสื่อ", icon: Sparkles },
  { to: "/library", label: "คลัง", icon: Store },
  { to: "/assistant", label: "ผู้ช่วย AI", icon: Users },
];

function useTheme() {
  const [dark, setDark] = useState(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}

function NavLinks({ onNavigate }) {
  return (
    <ul className="flex items-center gap-1">
      {ROUTES.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-krumate-muted transition-colors hover:bg-krumate-surface-strong hover:text-krumate-text",
                isActive && "bg-krumate-primary/10 text-krumate-primary-dark dark:text-krumate-primary",
              )
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function ThemeToggle({ dark, toggle, className = "" }) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="สลับธีม"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border border-krumate-border bg-krumate-surface text-krumate-muted transition-colors hover:bg-krumate-surface-strong hover:text-krumate-text",
        className,
      )}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default function AppLayout() {
  const [dark, toggleTheme] = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-krumate-background">
      <header className="sticky top-0 z-30 border-b border-krumate-border bg-krumate-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src={logo} alt="KruMate" className="h-8 object-contain" />
          </Link>

          <nav className="ml-6 hidden flex-1 md:block" aria-label="หลัก">
            <NavLinks />
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle dark={dark} toggle={toggleTheme} />
            <button
              type="button"
              aria-label="เปิดเมนู"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-krumate-border bg-krumate-surface text-krumate-muted transition-colors hover:bg-krumate-surface-strong hover:text-krumate-text md:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-krumate-border bg-krumate-surface p-4 transition-transform md:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2">
            <img src={logo} alt="KruMate" className="h-8 object-contain" />
          </Link>
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setDrawerOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-krumate-border bg-krumate-surface text-krumate-muted"
          >
            <X size={18} />
          </button>
        </div>
        <nav
          className="flex-1"
          onClick={() => setDrawerOpen(false)}
          aria-label="Mobile navigation"
        >
          <NavLinks />
        </nav>
        <ThemeToggle dark={dark} toggle={toggleTheme} />
      </div>
    </div>
  );
}
```

The drawer uses CSS transition and conditional render for the overlay; acceptable. `bg-krumate-surface/90` uses Tailwind v4 opacity-on-CSS-var support (color-mix) — leave as written.

- [ ] **Step 2: Rewire `src/App.jsx`**

Replace the import of `Sidebar.jsx`/`AppLayout`:

```jsx
import AppLayout from "./components/TopNav.jsx";
```

Keep `AppProvider` and the exact `Routes`/`Route` structure rendered inside `AppLayout` (child routes unchanged):

```jsx
function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="generator" element={<Generator />} />
            <Route path="content/:id" element={<ContentPage />} />
            <Route path="library" element={<Library />} />
            <Route path="assistant" element={<Assistant />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
```

- [ ] **Step 3: Delete `src/components/Sidebar.jsx`**

```bash
git rm src/components/Sidebar.jsx
```

- [ ] **Step 4: Run lint + build**

Run: `npm run lint`
Expected: PASS (delete of Sidebar removes no-longer-needed exports; no other file imports Sidebar after App.jsx change).
Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/TopNav.jsx
git rm src/components/Sidebar.jsx
git commit -m "feat: replace sidebar with responsive top nav and drawer"
```

---

### Task 3: Rebuild Dashboard on shared components

**Files:**
- Modify: `src/pages/Dashboard.jsx` (full rewrite)

**Interfaces:**
- Consumes: `Card`, `Button`, `Textarea`, `Input`, `Pill`, `Skeleton`, `EmptyState`, `ErrorState` from `src/components/ui.jsx`; `useApp`; lucide icons from `@tabler/icons-react`.
- Produces: keeps exact state shape + handlers (`activeTab`, `prompt`, `attachedFiles`, `handleSubmit`, `handleFileSelect`), navigates to `/generator`.

- [ ] **Step 1: Rewrite the page**

Remove the teal gradient hero band and its glow circles. Replace with a white `Card` hero containing: headline, subcopy, the tab pills (as `Pill`/buttons), and the prompt form (paperclip attach + `Textarea` + submit `Button`). Convert all `bg-white`/`text-slate-*`/`teal-*`/`violet-*`/`rose-*`/`emerald-*` to `krumate-*` tokens. Replace `StatCard`/`RecentCard` builds to use `Card`, a token icon-chip, and `Pill` for tags. Add a mock `loading` state flag that shows `Skeleton` rows for stats/recent while simulating data (setTimeout clearing `loading`); render `EmptyState` when `RECENT.length === 0`; keep the CTA banner as a `Card` with a `Button`. Keep all requirement-mandated sections.

- [ ] **Step 2: Run lint + build**
Run: `npm run lint` then `npm run build`. Expected: both PASS. Manually verify via `npm run dev`.

- [ ] **Step 3: Commit**
```bash
git add src/pages/Dashboard.jsx
git commit -m "refactor: rebuild dashboard on shared components and tokens"
```

---

### Task 4: Rebuild Generator on shared components

**Files:**
- Modify: `src/pages/Generator.jsx` (full rewrite)

**Interfaces:**
- Consumes: `Card`, `Button`, `Textarea`, `Pill` from `src/components/ui.jsx`; `useApp`; `constance`. Remove `Bell`/`Settings` imports and header buttons; remove import of `OptionButton` from `../components/ui` (it no longer exists) — if it did, Task 1 removed it; `Generator` must no longer import it.
- Produces: single reusable `OptionCard` component local to the file (token-driven, selects subject/grade/output) so `OptionButton` usage is replaced.

- [ ] **Step 1: Rewrite header (remove Bell/Settings)**

Delete the two icon `<button>`s in the header row. Keep the form and generation logic identical. Replace `OptionButton` usages with a local `OptionCard`.

- [ ] **Step 2: Replace OptionButtons with a shared selectable card**

Define once in the file:

```jsx
function OptionCard({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left font-medium transition-colors",
        active
          ? "border-krumate-primary bg-krumate-primary/10 text-krumate-primary-dark dark:text-krumate-primary"
          : "border-krumate-border bg-krumate-surface text-krumate-text hover:border-krumate-primary/40",
      )}
    >
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </button>
  );
}
```

Use it for subject (row), grade (small grid), and output type (col/grid). Remove `layout` prop handling — single variant.

- [ ] **Step 3: Fix the import**
Change `import { Card, Button, OptionButton } from "../components/ui";` to `import { Card, Button, Textarea, Pill } from "../components/ui";`. `OptionButton` no longer exists; remove any reference.

- [ ] **Step 4: Run lint + build**
Run: `npm run lint` then `npm run build`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/pages/Generator.jsx
git commit -m "refactor: rebuild generator on shared components"
```

---

### Task 5: Rebuild Library on shared components

**Files:**
- Modify: `src/pages/Library.jsx` (full rewrite, remove all inline styles)

**Interfaces:**
- Consumes: `Card`, `Button`, `Input`, `Pill`, `EmptyState`, `Skeleton` from `src/components/ui.jsx`; `cn`; lucide `Search`, `FolderOpen`, `FileText`, `ChevronRight`, `ArrowLeft`, `Download`, `Play`; `subjects`, `DOC_TYPES`, `SUBJECT_ICON` from `src/data/subjects`.
- Produces: same drill-down state (`search`, `filterSubject`, `filterGrade`, `selectedSubject`, `selectedChapter`); `skeleton` loading flag → `Skeleton` grid; `EmptyState` for no results.

- [ ] **Step 1: Rewrite the page**

Replace all inline style objects with tokenized Tailwind classes. Filter row: `Input` (search) + two `<select>` for subject/grade + clear `Button`. Grid: `Card` per subject with lucide icon (use a token icon-mapped mapping that keeps `SUBJECT_ICON` bg/color but renders icon via `<Icon>`), title, `Pill` badges, "เปิด" as `Button variant secondary size sm`. Chapter list: `Button` (back) + `Card` rows. Document grid: `Card` per `DOC_TYPE` with `Button` for view/download. Add `skeleton` state (setTimeout ~500ms → false) and `EmptyState` when filtered list empty.

- [ ] **Step 2: Run lint + build**
Run: `npm run lint` then `npm run build`. Expected: PASS.

- [ ] **Step 3: Commit**
```bash
git add src/pages/Library.jsx
git commit -m "refactor: rebuild library on shared components"
```

---

### Task 6: Rebuild Assistant on shared components

**Files:**
- Modify: `src/pages/Assistant.jsx` (full rewrite, remove all inline styles)

**Interfaces:**
- Consumes: `Card`, `Button`, `Textarea`, `EmptyState`, `Input` from `src/components/ui.jsx`; lucide `Paperclip`, `Library`, `Send`, `X`, `ChevronRight`; `useState`,`useRef`,`useEffect`. Keeps mock response flow `getMockAIResponse`, message array, typing indicator.
- Produces: tokenized chat; user bubble `bg-krumate-primary text-white`, assistant bubble `bg-krumate-surface-strong text-krumate-text`, 12px radius; send `Button`; attach + library `Buttons`; `LibraryPickerModal` rebuilt into a `Card`-based modal (fixed overlay, white `Card`, lucide icons) with no inline hover JS. Add `EmptyState` for the pre-first-message state.

- [ ] **Step 1: Rewrite bubbles and composer**
Replace chips/emoji with lucide icons + token chips. Keep attach/library picker modal flow.

- [ ] **Step 2: Rebuild LibraryPickerModal**
Use `Card`, `Button`, overlay div; token colors; replace inline `onMouseEnter` style swaps with Tailwind hover classes.

- [ ] **Step 3: Run lint + build**
Run: `npm run lint` then `npm run build`. Expected: PASS.

- [ ] **Step 4: Commit**
Run: `npm run build`; then `git add src/pages/Assistant.jsx; git commit -m "refactor: rebuild assistant on shared components"`.

---

### Task 7: Rebuild ContentPage on shared components

**Files:**
- Modify: `src/pages/ContentPage.jsx`

**Interfaces:**
- Consumes: `Card`, `Button`, `Pill` from `src/components/ui.jsx`; `useApp`; lucide icons already used (`FileDown`, `FileText`, `ArrowLeft`).
- Produces: `EmptyState` (no content) + `ErrorState` (with onRetry → navigate `/generator`) replacing the basic "ไม่พบ" block; token colors, `Card`/`Pill`/`Button` for the rest.

- [ ] **Step 1: Rewrite page**
Replace `text-slate-*` with `krumate-*`; replace `Button` `variant="secondary"` usage already exists (kept). Use `EmptyState`/`ErrorState`. Keep preview switch (`ContentPreview`) and `Section` helper but update their color classes to tokens.

- [ ] **Step 2: Run lint + build**
Run: `npm run lint` then `npm run build`. Expected: PASS.

- [ ] **Step 3: Commit**
```bash
git add src/pages/ContentPage.jsx
git commit -m "refactor: rebuild content page on shared components"
```

---

### Task 8: Strip unused global CSS

**Files:**
- Modify: `src/App.css` (remove Vite boilerplate)

**Interfaces:**
- Consumes: nothing.

- [ ] **Step 1: Empty `src/App.css`**
Delete all content (`.counter`, `.hero`, `#center`, `#next-steps`, etc.). Replace with a single comment line: `/* Global app styles live in index.css */`.

- [ ] **Step 2: Verify no page depends on App.css classes**
Determine by searching for `.hero`, `.counter`, `#center`, `#next-steps` across `src`. Confirm none are referenced (they are not).

- [ ] **Step 3: Run lint + build**, then **Commit**
```bash
git add src/App.css; git commit -m "chore: remove unused Vite app styles"
```

---

### Task 9: Final verification

**Files:** none

- [ ] **Step 1: Run lint**
Run: `npm run lint`. Expected: PASS (exit 0, no errors).

- [ ] **Step 2: Run build**
Run: `npm run build`. Expected: PASS (dist generated).

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`, open each route in a browser and confirm:
- `/` top navbar renders; resizing below 768px shows hamburger + drawer with all 4 links; theme toggle toggles `.dark`.
- Every page (`/`, `/generator`, `/content/:id`, `/library`, `/assistant`) renders without inline styles; `Textarea`, `Button`, `Card` consistent.
- Loading (`Skeleton`/spinner), empty (`EmptyState`) and error states on data pages return correct UI.
- No `slate-`, `teal-6`, `violet-`, `rose`, `emerald-` unbranded colors visible (grep `src/pages` + `src/components` for `slate-|teal-[6,7,]|violet-|rose-|emerald-`). Note: TopNav uses `bg-black/40` overlay — allowed.

- [ ] **Step 4: Grep for leftover unbranded colors**
Run:
```
rg -n "slate-[0-9]|teal-[6-9]|violet-|rose-|emerald-|shadow-2xl" src/pages src/components
```
Expected: no matches (or only intentional `bg-black/40` overlay in TopNav).

- [ ] **Step 5: Commit any final fixes**
```bash
git add -A; git commit -m "chore: final UI verification"
```
```