const styles: Record<string, string> = {
  high:     "bg-negative/8 text-negative",
  critical: "bg-negative/8 text-negative",
  medium:   "bg-caution/10 text-caution",
  warning:  "bg-caution/10 text-caution",
  important:"bg-caution/10 text-caution",
  low:      "bg-ink-muted/8 text-ink-muted",
  info:     "bg-brand-soft text-brand",
  default:  "bg-ink-muted/8 text-ink-muted",
  positive: "bg-positive/8 text-positive",
};

export function StatusPill({ label, variant = "default" }: { label: string; variant?: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${styles[variant] || styles.default}`}>
      {label}
    </span>
  );
}
