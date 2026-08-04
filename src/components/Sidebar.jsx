import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Home,
  Moon,
  PanelLeft,
  Plus,
  Settings,
  Sparkles,
  Store,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

// Import โลโก้ของคุณ
import logo from "../assets/logo.png";

/* =========================================================================
 * UTILITIES
 * ========================================================================= */

const cn = (...classes) => classes.filter(Boolean).join(" ");

/* =========================================================================
 * SIDEBAR CONTEXT
 * ========================================================================= */

const SidebarContext = createContext(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children, defaultCollapsed = false }) {
  const [state, setState] = useState(
    defaultCollapsed ? "collapsed" : "expanded",
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme === "dark";
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setState((prev) => (prev === "collapsed" ? "expanded" : "collapsed"));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        state,
        setState,
        isMobile,
        toggleSidebar,
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

/* =========================================================================
 * SIDEBAR - BUILT-IN UI COMPONENTS
 * ========================================================================= */

export function SidebarInset({ children, className = "" }) {
  return (
    <div
      className={cn("flex flex-1 flex-col min-w-0 min-h-0", className)}
    >
      {children}
    </div>
  );
}

// ปุ่ม toggle sidebar: อยู่บนพื้น navy เสมอ -> ใช้ navy-hover/active แทน surface
export function SidebarTrigger({ className = "" }) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-krumate-navy-hover active:bg-krumate-navy-active transition-colors cursor-pointer",
        className,
      )}
      onClick={toggleSidebar}
      type="button"
    >
      <PanelLeft className="h-4 w-4" />
    </button>
  );
}

// ปุ่มสลับธีม: ปรับให้ contrast ผ่านทั้ง 2 โหมด โดยพื้นเป็น navy-hover (เข้ากับ sidebar)
export function ThemeToggleButton({ className = "" }) {
  const { state, isDarkMode, toggleTheme } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border border-white/10 bg-krumate-navy-hover px-2.5 py-2 text-xs font-medium text-white transition-colors hover:bg-krumate-navy-active",
        isCollapsed && "justify-center px-0",
        className,
      )}
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!isCollapsed && <span>{isDarkMode ? "สว่าง" : "มืด"}</span>}
    </button>
  );
}

export function Sidebar({ children, className = "" }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <aside
      className={cn(
        // navy คือโซน 30% (secondary) ของระบบสี คงที่ทั้ง light/dark ไม่ผูกกับ dark: อีกต่อไป
        "flex flex-col border-r shrink-0 border-krumate-navy-hover bg-krumate-navy transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className = "" }) {
  return <div className={cn("p-3", className)}>{children}</div>;
}

export function SidebarContent({ children, className = "" }) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>{children}</div>
  );
}

export function SidebarFooter({ children, className = "" }) {
  return (
    <div className={cn("p-3 border-t border-krumate-navy-hover", className)}>
      {children}
    </div>
  );
}

export function SidebarMenu({ children, className = "" }) {
  return <ul className={cn("flex flex-col gap-1", className)}>{children}</ul>;
}

export function SidebarMenuItem({ children, className = "" }) {
  return <li className={cn("relative", className)}>{children}</li>;
}

// ปุ่มเมนู: hover/active ทั้งหมดอยู่ในตระกูล navy (ไม่ใช้ surface สีขาวอีกต่อไป)
export function SidebarMenuButton({
  children,
  className = "",
  active,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-krumate-navy-hover hover:text-white cursor-pointer",
        active && "bg-krumate-primary text-white font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarMenuSub({ children, className = "" }) {
  return (
    <ul
      className={cn(
        "ml-4 flex flex-col gap-1 border-l border-white/15 pl-2",
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function SidebarMenuSubButton({
  children,
  className = "",
  to = "#",
  ...props
}) {
  return (
    <Link
      className={cn(
        "flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white/75 hover:bg-krumate-navy-hover hover:text-white transition-colors",
        className,
      )}
      to={to}
      {...props}
    >
      {children}
    </Link>
  );
}

/* =========================================================================
 * COLLAPSIBLE
 * ========================================================================= */

export function Collapsible({ children, className = "" }) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export function CollapsibleTrigger({ children, onClick, ...props }) {
  return (
    <div onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export function CollapsibleContent({ isOpen, children }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================================
 * DROPDOWN MENU
 * ========================================================================= */

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-full" ref={ref}>
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
          });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen
            ? React.cloneElement(child, { onClose: () => setIsOpen(false) })
            : null;
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ children, onClick }) {
  return (
    <div className="cursor-pointer" onClick={onClick}>
      {children}
    </div>
  );
}

// Dropdown content ลอยขึ้นมาเหนือ sidebar (พื้น navy) -> ใช้ navy-active เป็นพื้น การ์ด
// เพื่อให้แยกจาก sidebar ได้ (มีความลึก) แต่ยังอยู่ในตระกูลสีเดียวกัน ไม่ใช่สีขาวโผล่แปลกปลอม
export function DropdownMenuContent({ children, className = "", onClose }) {
  return (
    <div
      className={cn(
        "absolute bottom-full left-0 z-50 mb-2 min-w-[12rem] overflow-hidden rounded-xl border border-white/10 bg-krumate-navy-active p-1 shadow-lg",
        className,
      )}
      onClick={onClose}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, className = "", onClick }) {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center rounded-lg px-2 py-1.5 text-xs text-white/85 hover:bg-krumate-primary hover:text-white transition-colors",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children, className = "" }) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-white/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-white/10" />;
}

export function DropdownMenuShortcut({ children }) {
  return (
    <span className="ml-auto text-xs tracking-widest text-white/60">
      {children}
    </span>
  );
}

/* =========================================================================
 * DATA CONSTANTS
 * ========================================================================= */

const dashboardRoutes = [
  {
    id: "home",
    title: "แดชบอร์ด",
    icon: <Home className="h-4 w-4" />,
    link: "/",
  },
  {
    id: "generator",
    title: "สร้างสื่อการสอน",
    icon: <Sparkles className="h-4 w-4" />,
    link: "/generator",
  },
  {
    id: "library",
    title: "คลังสื่อการสอน",
    icon: <Store className="h-4 w-4" />,
    link: "/library",
  },
  {
    id: "assistant",
    title: "ผู้ช่วย AI",
    icon: <Users className="h-4 w-4" />,
    link: "/assistant",
  },
  {
    id: "settings",
    title: "ตั้งค่า",
    icon: <Settings className="h-4 w-4" />,
    link: "#",
    subs: [
      { title: "ทั่วไป", link: "#" },
      { title: "บัญชีผู้ใช้", link: "#" },
    ],
  },
];

const teams = [
  { id: "1", name: "โรงเรียนสาธิตฯ", plan: "Pro Teacher" },
  { id: "2", name: "KruMate Personal", plan: "Free" },
];

/* =========================================================================
 * TEAM / USER SWITCHER
 * ========================================================================= */

export function TeamSwitcher({ teams }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [activeTeam, setActiveTeam] = useState(teams[0]);

  if (!activeTeam) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <SidebarMenuButton
              className={cn(
                "w-full justify-between",
                isCollapsed && "justify-center px-0",
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden text-left">
                {/* ใช้ primary (10% accent) เฉพาะจุดโลโก้ตัวอักษร ให้เด่นเป็นจุดสนใจเดียว */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-krumate-primary font-bold text-white">
                  K
                </div>
                {!isCollapsed && (
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate text-xs font-semibold text-white">
                      {activeTeam.name}
                    </span>
                    <span className="truncate text-[10px] text-white/60">
                      @example666
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/60" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>สังกัด / ผู้ใช้งาน</DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                className="gap-2 p-2"
                key={team.id}
                onClick={() => setActiveTeam(team)}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-krumate-primary text-xs font-bold text-white">
                  K
                </div>
                <span className="text-xs">{team.name}</span>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-white/20">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium">เพิ่มสังกัด</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/* =========================================================================
 * DASHBOARD NAVIGATION
 * ========================================================================= */

export function DashboardNavigation({ routes }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openCollapsible, setOpenCollapsible] = useState(null);

  return (
    <SidebarMenu>
      {routes.map((route) => {
        const isOpen = !isCollapsed && openCollapsible === route.id;
        const hasSubRoutes = !!route.subs?.length;

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <Collapsible>
                <CollapsibleTrigger
                  onClick={() => setOpenCollapsible(isOpen ? null : route.id)}
                >
                  <SidebarMenuButton
                    active={isOpen}
                    className={cn(isCollapsed && "justify-center px-0")}
                  >
                    {route.icon}
                    {!isCollapsed && (
                      <span className="ml-2 flex-1 text-left text-xs">
                        {route.title}
                      </span>
                    )}
                    {!isCollapsed &&
                      (isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ))}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {!isCollapsed && (
                  <CollapsibleContent isOpen={isOpen}>
                    <SidebarMenuSub className="my-1">
                      {route.subs.map((subRoute) => (
                        <li key={subRoute.title}>
                          <SidebarMenuSubButton to={subRoute.link}>
                            {subRoute.title}
                          </SidebarMenuSubButton>
                        </li>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <NavLink
                to={route.link}
                className={({ isActive }) =>
                  cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-white/85 transition-colors hover:bg-krumate-navy-hover hover:text-white",
                    isActive &&
                      "bg-krumate-primary text-white font-semibold hover:bg-krumate-primary",
                    isCollapsed && "justify-center px-0",
                  )
                }
              >
                {route.icon}
                {!isCollapsed && <span>{route.title}</span>}
              </NavLink>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

/* =========================================================================
 * DASHBOARD SIDEBAR
 * ========================================================================= */

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar>
      <SidebarHeader
        className={cn(
          "flex items-center justify-between gap-2 border-b border-krumate-navy-hover",
          isCollapsed && "flex-col justify-center",
        )}
      >
        <Link className="flex items-center gap-2 overflow-hidden" to="/">
          <img alt="Logo" className="h-8 object-contain" src={logo} />
        </Link>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>

      <SidebarFooter>
        <div className="mb-3">
          <ThemeToggleButton />
        </div>
        <TeamSwitcher teams={teams} />
      </SidebarFooter>
    </Sidebar>
  );
}

/* =========================================================================
 * MAIN ROOT LAYOUT
 * ========================================================================= */

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-krumate-background overflow-hidden">
        <DashboardSidebar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
