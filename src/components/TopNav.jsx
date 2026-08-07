import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Home, Sparkles, Store, Users, Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "./ui.jsx";
import logo from "../assets/logo.png";
import { settingsService } from "../services/settingsService";

const ROUTES = [
  { to: "/", label: "แดชบอร์ด", icon: Home, end: true },
  { to: "/generator", label: "สร้างสื่อ", icon: Sparkles },
  { to: "/library", label: "คลัง", icon: Store },
  { to: "/assistant", label: "ผู้ช่วย AI", icon: Users },
];

function useTheme() {
  const [dark, setDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    settingsService.getTheme().then((stored) => {
      if (cancelled) return;
      if (stored === "dark" || stored === "light") {
        setDark(stored === "dark");
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (hydrated) settingsService.setTheme(dark ? "dark" : "light");
  }, [dark, hydrated]);

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
