import { Card } from "@/components/ui/Card";

interface Props {
  fhChange?: number;
  changePeriod: string;
  dataHealth: number;
  transactionCount: number;
  categorizationPct: number;
  isFR: boolean;
}

export function MonitoringSection({ fhChange, changePeriod, dataHealth, transactionCount, categorizationPct, isFR }: Props) {
  const t = (en: string, fr: string) => isFR ? fr : en;
  const changeText = fhChange && fhChange !== 0
    ? `${fhChange > 0 ? "+" : ""}${fhChange} ${t("points", "points")} ${changePeriod}`
    : t("No change detected yet", "Aucun changement détecté");

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title={t("Progress", "Progrès")}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className={`font-serif text-[28px] ${fhChange && fhChange > 0 ? "text-positive" : "text-ink"}`}>{changeText}</span>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          {t(
            "Small improvements, consistently, are what make the structure safer and more profitable over the long term.",
            "De petites améliorations constantes rendent votre structure plus sûre et rentable à long terme."
          )}
        </p>
      </Card>

      <Card title={t("Data Coverage", "Couverture des données")}>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-serif text-[28px] text-ink">{dataHealth}</span>
          <span className="text-sm text-ink-muted">/ 100</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-secondary">{t("Transactions", "Transactions")}</span>
            <span className="text-ink font-medium">{transactionCount > 0 ? (Number(transactionCount) || 0).toLocaleString() : "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-secondary">{t("Categorized", "Catégorisées")}</span>
            <span className="text-ink font-medium">{categorizationPct > 0 ? `${categorizationPct}%` : "—"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
