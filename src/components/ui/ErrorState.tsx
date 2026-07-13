import { AlertTriangle, ServerCrash, WifiOff, Lock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorType = 'generic' | 'network' | 'permission' | 'notfound' | 'server';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const errorConfig: Record<ErrorType, {
  icon: typeof AlertTriangle;
  defaultTitle: string;
  defaultDesc: string;
  iconColor: string;
}> = {
  generic: {
    icon: AlertTriangle,
    defaultTitle: 'Xatolik yuz berdi',
    defaultDesc: 'Ma\'lumot yuklanishida muammo bo\'ldi. Qaytadan urinib ko\'ring.',
    iconColor: 'text-yellow-400',
  },
  network: {
    icon: WifiOff,
    defaultTitle: 'Tarmoq xatoligi',
    defaultDesc: 'Internet aloqasi yo\'q yoki server javob bermayapti.',
    iconColor: 'text-orange-400',
  },
  permission: {
    icon: Lock,
    defaultTitle: 'Ruxsat yo\'q',
    defaultDesc: 'Ushbu sahifani ko\'rish uchun sizda yetarli ruxsat yo\'q.',
    iconColor: 'text-red-400',
  },
  notfound: {
    icon: AlertTriangle,
    defaultTitle: 'Topilmadi',
    defaultDesc: 'Qidirayotgan ma\'lumot mavjud emas yoki o\'chirilgan.',
    iconColor: 'text-muted-foreground',
  },
  server: {
    icon: ServerCrash,
    defaultTitle: 'Server xatoligi',
    defaultDesc: 'Server ichki xatoligi. Bir ozdan keyin qaytadan urinib ko\'ring.',
    iconColor: 'text-red-400',
  },
};

export function ErrorState({
  type = 'generic',
  title,
  description,
  onRetry,
  retrying = false,
  className,
  size = 'md',
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

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
      role="alert"
      aria-live="polite"
    >
      <div
        className={cn(
          'rounded-2xl border flex items-center justify-center mb-4',
          boxSize,
          type === 'network' ? 'bg-orange-500/10 border-orange-500/20' :
          type === 'permission' ? 'bg-red-500/10 border-red-500/20' :
          type === 'server' ? 'bg-red-500/10 border-red-500/20' :
          'bg-muted/50 border-border'
        )}
      >
        <Icon className={cn(iconSize, config.iconColor)} aria-hidden="true" />
      </div>

      <h3 className={cn(
        'font-heading font-semibold text-foreground mb-1',
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
      )}>
        {title ?? config.defaultTitle}
      </h3>

      <p className={cn(
        'text-muted-foreground font-body max-w-xs',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {description ?? config.defaultDesc}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/60 text-sm font-heading text-foreground hover:border-primary/40 hover:text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
          aria-label="Qaytadan urinish"
        >
          <RefreshCw
            className={cn('w-4 h-4', retrying && 'animate-spin')}
            aria-hidden="true"
          />
          {retrying ? 'Yuklanmoqda...' : 'Qaytadan urinish'}
        </button>
      )}
    </div>
  );
}
