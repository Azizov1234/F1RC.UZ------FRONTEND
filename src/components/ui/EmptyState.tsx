import { type LucideIcon, SearchX, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Filter natijasi uchun - boshqacha xabar */
  isFiltered?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
  isFiltered = false,
}: EmptyStateProps) {
  const DefaultIcon = isFiltered ? SearchX : Database;
  const DisplayIcon = Icon ?? DefaultIcon;

  const defaultTitle = isFiltered
    ? 'Natija topilmadi'
    : 'Ma\'lumot yo\'q';

  const defaultDesc = isFiltered
    ? 'Filter yoki qidiruv parametrlaringizni o\'zgartiring.'
    : 'Hali birorta yozuv qo\'shilmagan.';

  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const boxSize = size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        size === 'sm' && 'py-6 px-4',
        size === 'lg' && 'py-20 px-8',
        className
      )}
    >
      <div
        className={cn(
          'rounded-2xl border border-border bg-muted/30 flex items-center justify-center mb-4',
          boxSize
        )}
      >
        <DisplayIcon
          className={cn(iconSize, 'text-muted-foreground')}
          aria-hidden="true"
          strokeWidth={1.5}
        />
      </div>

      <h3 className={cn(
        'font-heading font-semibold text-foreground mb-1',
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
      )}>
        {title ?? defaultTitle}
      </h3>

      <p className={cn(
        'text-muted-foreground font-body max-w-xs',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {description ?? defaultDesc}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
