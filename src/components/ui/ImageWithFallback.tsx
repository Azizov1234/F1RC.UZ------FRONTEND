import { useState, useEffect } from 'react';
import { Calendar, Car, Grid, MapPin, Video, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FallbackType = 'category' | 'event' | 'arena' | 'vehicle' | 'stream' | 'avatar';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackType: FallbackType;
  className?: string;
}

const fallbackConfig = {
  category: {
    icon: Grid,
    bg: 'from-blue-600/10 via-blue-500/5 to-transparent',
    borderColor: 'border-blue-500/10',
    iconColor: 'text-blue-400/60',
  },
  event: {
    icon: Calendar,
    bg: 'from-emerald-600/10 via-emerald-500/5 to-transparent',
    borderColor: 'border-emerald-500/10',
    iconColor: 'text-emerald-400/60',
  },
  arena: {
    icon: MapPin,
    bg: 'from-amber-600/10 via-amber-500/5 to-transparent',
    borderColor: 'border-amber-500/10',
    iconColor: 'text-amber-400/60',
  },
  vehicle: {
    icon: Car,
    bg: 'from-purple-600/10 via-purple-500/5 to-transparent',
    borderColor: 'border-purple-500/10',
    iconColor: 'text-purple-400/60',
  },
  stream: {
    icon: Video,
    bg: 'from-red-600/10 via-red-500/5 to-transparent',
    borderColor: 'border-red-500/10',
    iconColor: 'text-red-400/60',
  },
  avatar: {
    icon: User,
    bg: 'from-zinc-700/20 to-transparent',
    borderColor: 'border-zinc-700/30',
    iconColor: 'text-zinc-500',
  },
};

export default function ImageWithFallback({
  src,
  fallbackType,
  className,
  alt = 'Image',
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  // Reset error state if the src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    const config = fallbackConfig[fallbackType] || fallbackConfig.category;
    const Icon = config.icon;

    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center bg-gradient-to-br border relative overflow-hidden select-none min-h-[140px]',
          config.bg,
          config.borderColor,
          className
        )}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-radial-gradient from-white/[0.02] to-transparent pointer-events-none" />
        
        <Icon className={cn('w-10 h-10 mb-2 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]', config.iconColor)} aria-hidden="true" />
        <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/50">
          No image
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
