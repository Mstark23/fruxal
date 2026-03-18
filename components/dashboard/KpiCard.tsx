interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "negative" | "positive";
}

export function KpiCard({ label, value, sub, accent = "default" }: KpiCardProps) {
  const color = accent === "negative" ? "text-negative" : accent === "positive" ? "text-positive" : "text-ink";
  return (
    <div className="bg-white border border-border rounded-card p-6">
      <div className="text-label uppercase text-ink-muted font-semibold tracking-wider mb-3">{label}</div>
      <div className={`font-serif text-[36px] tracking-tight font-normal ${color}`}>{value}</div>
      {sub && <div className="text-xs text-ink-muted mt-1 font-medium">{sub}</div>}
    </div>
  );
}
