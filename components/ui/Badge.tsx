import { clsx } from "clsx";

type Color = "green" | "red" | "yellow" | "blue" | "purple" | "gray";

interface BadgeProps {
  color?: Color;
  children: React.ReactNode;
  className?: string;
}

const COLORS: Record<Color, string> = {
  green:  "bg-green-100 text-green-700",
  red:    "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue:   "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  gray:   "bg-gray-100 text-gray-600",
};

export default function Badge({ color = "gray", children, className }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold", COLORS[color], className)}>
      {children}
    </span>
  );
}

// Convenience wrappers for severity badges
export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, Color> = { CRITICAL: "red", HIGH: "red", MEDIUM: "yellow", LOW: "green" };
  return <Badge color={map[severity] || "gray"}>{severity}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Color> = { OPEN: "red", IN_PROGRESS: "yellow", FIXED: "green", DISMISSED: "gray" };
  return <Badge color={map[status] || "gray"}>{status}</Badge>;
}
