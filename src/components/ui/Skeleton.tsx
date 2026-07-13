import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  /** Qator uzunligi uchun */
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%]',
        {
          'rounded-sm': rounded === 'sm',
          'rounded-md': rounded === 'md',
          'rounded-lg': rounded === 'lg',
          'rounded-xl': rounded === 'xl',
          'rounded-2xl': rounded === '2xl',
          'rounded-full': rounded === 'full',
        },
        className
      )}
      style={{ width, height }}
    />
  );
}

/** Stat card skeleton */
export function StatCardSkeleton() {
  return (
    <div className="relative bg-card/60 border border-border/80 rounded-2xl p-5 overflow-hidden">
      <div className="absolute top-4 right-4">
        <Skeleton className="w-8 h-8" rounded="lg" />
      </div>
      <Skeleton className="h-2.5 w-20 mb-3" />
      <Skeleton className="h-7 w-16 mb-3" />
      <Skeleton className="h-2 w-24" />
    </div>
  );
}

/** Table row skeleton */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Card skeleton */
export function CardSkeleton() {
  return (
    <div className="bg-card/60 border border-border/80 rounded-2xl p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}

/** List item skeleton */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border/50 last:border-0">
      <Skeleton className="w-10 h-10 flex-shrink-0" rounded="xl" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16" rounded="full" />
    </div>
  );
}

/** Page header skeleton */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-28" rounded="xl" />
    </div>
  );
}
