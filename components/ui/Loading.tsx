import { clsx } from "clsx";

interface LoadingProps {
  fullPage?: boolean;
  message?: string;
  className?: string;
}

export default function Loading({ fullPage, message, className }: LoadingProps) {
  const content = (
    <div className={clsx("flex flex-col items-center justify-center gap-2", className)}>
      <div className="text-4xl animate-pulse">💧</div>
      {message && <div className="text-sm text-gray-400 font-medium">{message}</div>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">{content}</div>;
  }
  return content;
}

export function LoadingBar({ progress, label }: { progress: number; label?: string }) {
  return (
    <div className="w-full">
      {label && <div className="text-xs text-gray-500 mb-1">{label}</div>}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
          style={{ width: Math.min(100, Math.max(0, progress)) + "%" }}
        />
      </div>
    </div>
  );
}
