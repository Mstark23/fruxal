import { KpiCard } from "./KpiCard";

interface Props {
  fhScore: number;
  fhChange?: number;
  totalLeak: number;
  leakCount: number;
  monitoringActive: boolean;
  businessName?: string;
  isFR: boolean;
}

export function ExecutivePanel({ fhScore, fhChange, totalLeak, leakCount, monitoringActive, isFR }: Props) {
  const t = (en: string, fr: string) => isFR ? fr : en;
  const fhSub = fhChange && fhChange !== 0
    ? `${fhChange > 0 ? "+" : ""}${fhChange} ${t("vs last month", "vs mois dernier")}`
    : t("Based on current data", "Basé sur les données actuelles");

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <KpiCard
        label={t("Financial Health", "Santé financière")}
        value={`${fhScore}`}
        sub={fhSub}
        accent={fhScore >= 70 ? "positive" : fhScore >= 40 ? "default" : "negative"}
      />
      <KpiCard
        label={t("Estimated Annual Leak", "Fuite annuelle estimée")}
        value={`$${totalLeak.toLocaleString()}`}
        sub={`${leakCount} ${t("active leaks", "fuites actives")}`}
        accent="negative"
      />
      <KpiCard
        label={t("Monitoring", "Surveillance")}
        value={monitoringActive ? t("Active", "Actif") : t("Paused", "En pause")}
        sub={monitoringActive ? t("Continuous protection", "Protection continue") : t("Free tier — connect data to activate", "Gratuit — connectez vos données")}
        accent={monitoringActive ? "positive" : "default"}
      />
    </div>
  );
}
