import { useEffect, useRef } from "react";
import { sourceLabel } from "../utils/sourceLabel";

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

export function AutosizeTextarea({ maxHeight = 160, className = "", ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [props.value, maxHeight]);

  return <Textarea ref={ref} className={className} {...props} />;
}

const SOURCE_TONE = {
  AI: "bg-krumate-primary/10 text-krumate-primary-dark dark:bg-krumate-primary/20 dark:text-krumate-primary",
  เทมเพลต: "bg-krumate-highlight/10 text-krumate-highlight dark:bg-krumate-highlight/20 dark:text-krumate-primary",
  Legacy: "bg-krumate-surface-strong text-krumate-muted",
};

export function SourceBadge({ source, className = "" }) {
  const label = sourceLabel(source);
  if (!label) return null;
  return (
    <Pill className={cn(SOURCE_TONE[label] ?? "", className)}>
      {label}
    </Pill>
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