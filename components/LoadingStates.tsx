"use client";

export function LoadingSpinner({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const s = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-7 h-7";
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${s} border-2 border-gray-200 border-t-[#1a1a2e] rounded-full animate-spin`} />
      {text && <div className="text-sm text-gray-400">{text}</div>}
    </div>
  );
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  description = "",
  actionLabel,
  onAction,
}: {
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-sm font-bold text-gray-600 mb-1">{title}</div>
      {description && <div className="text-xs text-gray-400 max-w-xs mb-4">{description}</div>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-4 py-2 bg-[#1a1a2e] text-white font-bold rounded-xl text-xs hover:bg-[#2a2a3e]">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-2.5 bg-gray-100 rounded mb-2 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
      <SkeletonCard lines={5} />
      <SkeletonCard lines={4} />
    </div>
  );
}
