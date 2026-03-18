import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:   "bg-[#00c853] text-white hover:bg-[#00b848] font-bold",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium",
  danger:    "bg-red-500 text-white hover:bg-red-600 font-bold",
  ghost:     "text-gray-600 hover:bg-gray-100 font-medium",
  outline:   "border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium",
};

const SIZES: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs rounded-lg",
  md: "px-3.5 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", icon, loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 transition-all",
        VARIANTS[variant],
        SIZES[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {loading ? <span className="animate-spin">⏳</span> : icon ? <span>{icon}</span> : null}
      {children}
    </button>
  ),
);

Button.displayName = "Button";
export default Button;
