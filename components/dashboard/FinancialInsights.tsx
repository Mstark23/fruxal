import { Card } from "@/components/ui/Card";
import { RevenueChart } from "./RevenueChart";
import { CostTable, CostRow } from "./CostTable";
import { LeaksList, Leak } from "./LeaksList";
import { AlertsList, Alert } from "./AlertsList";

interface RevenueMetrics { lastMonth: string; mom: string; momPositive: boolean; yoy: string; yoyPositive: boolean; }

interface Props {
  revenueData: number[];
  revenueLabels: string[];
  revenueMetrics?: RevenueMetrics;
  costRows: CostRow[];
  leaks: Leak[];
  alerts: Alert[];
  isFR: boolean;
  onViewAllLeaks?: () => void;
}

export function FinancialInsights({ revenueData, revenueLabels, revenueMetrics, costRows, leaks, alerts, isFR, onViewAllLeaks }: Props) {
  const t = (en: string, fr: string) => isFR ? fr : en;

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Left 2/3 — Revenue + Costs */}
      <div className="lg:col-span-2 space-y-4">
        <Card title={t("Revenue", "Revenus")}>
          <RevenueChart data={revenueData} labels={revenueLabels} />
          {revenueMetrics && (
            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-border-light">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1">{t("Last month", "Mois dernier")}</div>
                <div className="font-serif text-[18px] text-ink">{revenueMetrics.lastMonth}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1">{t("MoM change", "Variation MoM")}</div>
                <div className={`font-serif text-[18px] ${revenueMetrics.momPositive ? "text-positive" : "text-negative"}`}>{revenueMetrics.mom}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1">{t("YoY change", "Variation AoA")}</div>
                <div className={`font-serif text-[18px] ${revenueMetrics.yoyPositive ? "text-positive" : "text-negative"}`}>{revenueMetrics.yoy}</div>
              </div>
            </div>
          )}
        </Card>

        {costRows.length > 0 && (
          <Card title={t("Cost Structure", "Structure des coûts")} subtitle={t("vs industry benchmarks", "vs repères de l'industrie")}>
            <CostTable rows={costRows} isFR={isFR} />
          </Card>
        )}
      </div>

      {/* Right 1/3 — Leaks + Alerts */}
      <div className="space-y-4">
        <Card title={t("Active Leaks", "Fuites actives")} subtitle={`${leaks.length} ${t("detected", "détectées")}`}>
          <LeaksList leaks={leaks} max={3} isFR={isFR} />
          {leaks.length > 3 && onViewAllLeaks && (
            <button onClick={onViewAllLeaks} className="w-full mt-2 py-2 text-xs font-semibold text-brand hover:text-brand-light transition">
              {t("View all leaks →", "Voir toutes les fuites →")}
            </button>
          )}
        </Card>

        <Card title={t("Recent Alerts", "Alertes récentes")} subtitle={`${alerts.filter(a => !a.read).length} ${t("unread", "non lues")}`}>
          <AlertsList alerts={alerts} max={4} isFR={isFR} />
        </Card>
      </div>
    </div>
  );
}
