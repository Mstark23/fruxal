import { clsx } from "clsx";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  className?: string;
}

export default function StatCard({ icon, label, value, sub, trend, trendValue, className }: StatCardProps) {
  return (
    <div className={clsx("bg-white rounded-xl border p-4", className)}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      {(sub || trendValue) && (
        <div className="flex items-center gap-1.5 mt-1">
          {trendValue && (
            <span className={clsx("text-xs font-bold", trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-gray-400")}>
              {trend === "up" ? "▲" : trend === "down" ? "▼" : "–"} {trendValue}
            </span>
          )}
          {sub && <span className="text-xs text-gray-400">{sub}</span>}
        </div>
      )}
    </div>
  );
}
