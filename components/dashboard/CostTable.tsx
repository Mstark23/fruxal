export interface CostRow {
  category: string;
  pctRevenue: number;
  benchmark: number;
  status: "healthy" | "above" | "high";
}

interface Props { rows: CostRow[]; isFR: boolean; }

export function CostTable({ rows, isFR }: Props) {
  if (rows.length === 0) return null;
  return (
    <div>
      <div className="grid grid-cols-[1fr_80px_80px_64px] gap-2 text-[10px] uppercase tracking-widest text-ink-faint font-semibold pb-2 border-b border-border-light">
        <span>{isFR ? "Catégorie" : "Category"}</span>
        <span className="text-right">{isFR ? "Votre %" : "Your %"}</span>
        <span className="text-right">{isFR ? "Repère" : "Bench"}</span>
        <span className="text-right">{isFR ? "Statut" : "Status"}</span>
      </div>
      {rows.map(r => (
        <div key={r.category} className="grid grid-cols-[1fr_80px_80px_64px] gap-2 py-2.5 border-b border-border-light last:border-0 items-center">
          <span className="text-body text-ink font-medium">{r.category}</span>
          <span className="text-body text-ink text-right">{r.pctRevenue.toFixed(1)}%</span>
          <span className="text-body text-ink-muted text-right">{r.benchmark.toFixed(1)}%</span>
          <span className="text-right">
            <span className={`inline-block w-2 h-2 rounded-full ${r.status === "high" ? "bg-negative" : r.status === "above" ? "bg-caution" : "bg-positive"}`} />
          </span>
        </div>
      ))}
    </div>
  );
}
