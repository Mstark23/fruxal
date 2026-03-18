import { StatusPill } from "@/components/ui/StatusPill";

export interface Alert {
  id: string;
  level: "critical" | "important" | "low";
  title: string;
  shortText: string;
  timestamp: string;
  read: boolean;
}

interface Props { alerts: Alert[]; max?: number; isFR: boolean; }

const levelMap = { critical: "Critical", important: "Important", low: "Info" };

export function AlertsList({ alerts, max = 5, isFR }: Props) {
  const shown = alerts.slice(0, max);

  if (alerts.length === 0) return (
    <p className="text-sm text-ink-muted py-4">{isFR ? "Aucune alerte." : "No alerts."}</p>
  );

  return (
    <div className="space-y-2">
      {shown.map(a => (
        <div key={a.id} className={`flex items-center justify-between p-3.5 rounded-sm border border-border-light transition-colors ${a.read ? "bg-white opacity-60" : "bg-bg"}`}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-body font-medium text-ink truncate">{a.title}</span>
              <StatusPill label={levelMap[a.level]} variant={a.level} />
            </div>
            <p className="text-xs text-ink-muted truncate">{a.shortText}</p>
          </div>
          <span className="text-[11px] text-ink-faint shrink-0 pl-4">{a.timestamp}</span>
        </div>
      ))}
    </div>
  );
}
