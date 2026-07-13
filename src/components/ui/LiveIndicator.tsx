import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  /** jonli ko'rsatish uchun */
  active?: boolean;
  label?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  /** Pulsatsiya animatsiyasi */
  pulse?: boolean;
  /** dot only (label ko'rsatma) */
  dotOnly?: boolean;
}

export function LiveIndicator({
  active = true,
  label = 'LIVE',
  className,
  size = 'sm',
  pulse = true,
  dotOnly = false,
}: LiveIndicatorProps) {
  if (!active) return null;

  const dotSize = size === 'xs' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-3 h-3' : 'w-2 h-2';
  const textSize = size === 'xs' ? 'text-[9px]' : size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        !dotOnly && 'bg-red-500/10 border border-red-500/25 rounded-2xl px-2.5 py-1',
        className
      )}
      role="status"
      aria-label={`${label} - jonli efir`}
    >
      {/* Pulse dot */}
      <span className="relative flex-shrink-0 flex items-center justify-center">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex rounded-full bg-red-500 opacity-70 animate-ping',
              dotSize
            )}
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
            dotSize
          )}
        />
      </span>

      {/* Label */}
      {!dotOnly && (
        <span
          className={cn(
            'font-heading font-bold text-red-400 uppercase tracking-widest',
            textSize
          )}
          aria-hidden="true"
        >
          {label}
        </span>
      )}
    </div>
  );
}

/** Active session indicator — green color */
export function ActiveSessionIndicator({
  count,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/25 rounded-2xl px-3 py-1.5',
        className
      )}
      role="status"
      aria-label={`${count ?? ''} faol sessiya`}
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span className="text-xs font-heading font-bold text-green-400 uppercase tracking-wider">
        {count !== undefined ? `${count} faol sessiya` : 'Faol'}
      </span>
    </div>
  );
}
