"use client";

interface FruxalSpinnerProps {
  size?: number;
  text?: string;
}

export default function FruxalSpinner({ size = 40, text }: FruxalSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Rotating outer ring */}
        <div
          className="absolute inset-0 rounded-[10px] border-2 border-[#1B3A2D]/20 border-t-[#1B3A2D] animate-spin"
          style={{ animationDuration: "1.2s" }}
        />
        {/* Fruxal logo icon (static center) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width={size * 0.5}
            height={size * 0.5}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1B3A2D"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
          </svg>
        </div>
      </div>
      {text && (
        <p className="text-[12px] text-[#8E8C85] font-medium">{text}</p>
      )}
    </div>
  );
}

/** Inline version for tight spaces — just the spinning logo, no wrapper */
export function FruxalSpinnerInline({ size = 20 }: { size?: number }) {
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-[5px] border-[1.5px] border-[#1B3A2D]/20 border-t-[#1B3A2D] animate-spin"
        style={{ animationDuration: "1.2s" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1B3A2D"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
        </svg>
      </div>
    </div>
  );
}
