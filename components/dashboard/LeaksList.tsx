import { StatusPill } from "@/components/ui/StatusPill";

export interface Leak {
  id: string;
  name: string;
  category: string;
  severity: "high" | "medium" | "low";
  annualAmount: number;
  confidence: number;
  shortText: string;
}

interface Props { leaks: Leak[]; max?: number; isFR: boolean; }

export function LeaksList({ leaks, max = 4, isFR }: Props) {
  const shown = leaks.slice(0, max);
  const more = leaks.length - max;

  if (leaks.length === 0) return (
    <p className="text-sm text-ink-muted py-4">{isFR ? "Aucune fuite détectée." : "No leaks detected."}</p>
  );

  return (
    <div className="space-y-2">
      {shown.map(l => (
        <div key={l.id} className="flex items-center justify-between p-3.5 bg-bg rounded-sm border border-border-light hover:bg-surface-hover transition-colors">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-body font-medium text-ink truncate">{l.name}</span>
              <StatusPill label={l.severity === "high" ? (isFR ? "Élevé" : "High") : l.severity === "medium" ? (isFR ? "Moyen" : "Medium") : (isFR ? "Faible" : "Low")} variant={l.severity} />
            </div>
            <p className="text-xs text-ink-muted truncate">{l.shortText}</p>
          </div>
          <div className="text-right pl-4 shrink-0">
            <span className="font-serif text-[16px] text-negative font-semibold">${l.annualAmount.toLocaleString()}</span>
            <span className="text-[10px] text-ink-faint ml-0.5">{isFR ? "/an" : "/yr"}</span>
          </div>
        </div>
      ))}
      {more > 0 && (
        <button className="w-full py-2.5 text-xs font-semibold text-brand hover:text-brand-light transition">
          {isFR ? `Voir ${more} de plus` : `View ${more} more`}
        </button>
      )}
    </div>
  );
}
