interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className = "" }: CardProps) {
  return (
    <div className={`bg-white border border-border rounded-card overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 pt-5 pb-0">
          {title && <h3 className="font-serif text-h3 text-ink font-normal">{title}</h3>}
          {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
