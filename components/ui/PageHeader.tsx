interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ icon, title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h1 className="text-2xl font-black text-gray-900">{title}</h1>
          {badge && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">{badge}</span>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-1 ml-9">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
