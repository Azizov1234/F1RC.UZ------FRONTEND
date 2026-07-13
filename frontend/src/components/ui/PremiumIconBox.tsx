import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PremiumIconBoxProps {
  icon: LucideIcon | ComponentType<{ className?: string }>;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'zinc';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

const colorMap = {
  red: {
    bg: 'bg-red-500/10 border-red-500/20 text-red-400',
    glow: 'shadow-red-500/20 hover:shadow-red-500/30 text-red-400',
  },
  blue: {
    bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    glow: 'shadow-blue-500/20 hover:shadow-blue-500/30 text-blue-400',
  },
  green: {
    bg: 'bg-green-500/10 border-green-500/20 text-green-400',
    glow: 'shadow-green-500/20 hover:shadow-green-500/30 text-green-400',
  },
  yellow: {
    bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    glow: 'shadow-yellow-500/20 hover:shadow-yellow-500/30 text-yellow-400',
  },
  purple: {
    bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    glow: 'shadow-purple-500/20 hover:shadow-purple-500/30 text-purple-400',
  },
  orange: {
    bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    glow: 'shadow-orange-500/20 hover:shadow-orange-500/30 text-orange-400',
  },
  zinc: {
    bg: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
    glow: 'shadow-zinc-500/20 hover:shadow-zinc-500/30 text-zinc-400',
  },
};

const sizeMap = {
  sm: {
    container: 'w-8 h-8 rounded-lg border',
    iconSize: 'w-4 h-4',
  },
  md: {
    container: 'w-10 h-10 rounded-xl border',
    iconSize: 'w-5 h-5',
  },
  lg: {
    container: 'w-14 h-14 rounded-2xl border',
    iconSize: 'w-7 h-7',
  },
};

export default function PremiumIconBox({
  icon: Icon,
  color = 'red',
  size = 'md',
  className,
  glow = true,
}: PremiumIconBoxProps) {
  const selectedColor = colorMap[color] || colorMap.red;
  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-md',
        'bg-opacity-5 hover:scale-105 active:scale-95',
        selectedSize.container,
        selectedColor.bg,
        glow && 'shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]',
        glow && selectedColor.glow,
        className
      )}
    >
      {/* Inner subtle glow for premium glass feel */}
      <div className="absolute inset-0.5 rounded-[inherit] bg-gradient-to-tr from-white/0 to-white/10 pointer-events-none" />
      
      <Icon className={cn('transition-all duration-300', selectedSize.iconSize)} />
    </div>
  );
}
