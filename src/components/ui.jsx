export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-krumate-surface rounded-3xl shadow-sm border border-slate-100 dark:border-krumate-border ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 dark:bg-krumate-primary dark:text-white dark:hover:bg-krumate-primary-dark",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-krumate-surface-strong dark:text-krumate-text dark:hover:bg-krumate-surface-soft",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Pill({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-krumate-surface-2 dark:text-krumate-text dark:border-krumate-border ${className}`}>
      {children}
    </span>
  );
}

export function OptionButton({ active, onClick, icon: Icon, label, layout = "row", disabled }) {
  const base = "font-medium transition-colors duration-150 rounded-2xl border cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

  // Active: teal border + soft teal bg + teal text
  const activeClasses = [
    "border-teal-500 bg-teal-50 text-teal-700",
    "dark:border-krumate-primary dark:bg-krumate-primary/20 dark:text-krumate-primary",
  ].join(" ");

  // Inactive: light border + white bg + readable dark text → dark: flip to dark surface + bright text
  const inactiveClasses = [
    "border-slate-200 bg-white text-slate-800",
    "hover:border-slate-300 hover:bg-slate-50",
    "dark:border-krumate-border dark:bg-krumate-surface-strong dark:text-krumate-text",
    "dark:hover:border-krumate-primary/60 dark:hover:bg-krumate-surface-soft dark:hover:text-white",
  ].join(" ");

  if (layout === "col") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${active ? activeClasses : inactiveClasses} flex flex-col items-center justify-center gap-2 py-4 px-2 text-center text-sm`}
      >
        {Icon && <Icon size={22} strokeWidth={2} />}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${active ? activeClasses : inactiveClasses} flex items-center gap-2.5 py-3 px-4 text-sm text-left w-full`}
    >
      {Icon && <Icon size={18} strokeWidth={2} />}
      <span>{label}</span>
    </button>
  );
}
