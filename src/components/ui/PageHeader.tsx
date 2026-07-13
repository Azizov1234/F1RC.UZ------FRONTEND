import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  badge?: { label: string; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' };
}

const badgeColors = {
  green: 'bg-green-500/10 border-green-500/20 text-green-400',
  red:   'bg-red-500/10   border-red-500/20   text-red-400',
  yellow:'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  blue:  'bg-blue-500/10  border-blue-500/20  text-blue-400',
  gray:  'bg-muted        border-border        text-muted-foreground',
};

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  breadcrumbs,
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                <button
                  onClick={b.onClick}
                  className={`text-[11px] font-heading tracking-wide transition-colors
                    ${b.onClick
                      ? 'text-muted-foreground hover:text-foreground cursor-pointer'
                      : 'text-muted-foreground cursor-default'
                    }`}
                >
                  {b.label}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Title row */}
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground tracking-wide">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 font-heading">{subtitle}</p>
            )}
          </div>
          {badge && (
            <span className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full border tracking-wider uppercase ${badgeColors[badge.color ?? 'gray']}`}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
