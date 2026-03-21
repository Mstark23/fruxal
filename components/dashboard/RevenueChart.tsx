interface Props { data: number[]; labels: string[]; }

export function RevenueChart({ data, labels }: Props) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-[140px]">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
          <div
            className="w-full bg-brand/12 hover:bg-brand/20 rounded-t-xs transition-colors min-h-[2px]"
            style={{ height: (v / max) * 100 + "%" }}
            title={`${labels[i]}: $${(Number(v) || 0).toLocaleString()}`}
          />
          <span className="text-[9px] text-ink-faint mt-1.5 font-medium">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
