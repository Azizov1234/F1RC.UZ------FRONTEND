import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import PremiumIconBox from '@/components/ui/PremiumIconBox';

type ColorKey = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange' | 'zinc';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: ColorKey;
  subtitle?: string;
}

const colorMap: Record<ColorKey, { bg: string; border: string; icon: string; glow: string }> = {
  red:    { bg: 'bg-red-500/5',    border: 'border-red-500/20 hover:border-red-500/40',    icon: 'text-red-400',    glow: 'from-red-500/10 to-transparent' },
  green:  { bg: 'bg-green-500/5',  border: 'border-green-500/20 hover:border-green-500/40',icon: 'text-green-400',  glow: 'from-green-500/10 to-transparent' },
  blue:   { bg: 'bg-blue-500/5',   border: 'border-blue-500/20 hover:border-blue-500/40',  icon: 'text-blue-400',   glow: 'from-blue-500/10 to-transparent' },
  yellow: { bg: 'bg-yellow-500/5', border: 'border-yellow-500/20 hover:border-yellow-500/40',icon: 'text-yellow-400',glow: 'from-yellow-500/10 to-transparent' },
  purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/20 hover:border-purple-500/40',icon: 'text-purple-400',glow: 'from-purple-500/10 to-transparent' },
  orange: { bg: 'bg-orange-500/5', border: 'border-orange-500/20 hover:border-orange-500/40',icon: 'text-orange-400',glow: 'from-orange-500/10 to-transparent' },
  zinc:   { bg: 'bg-zinc-500/5',   border: 'border-zinc-500/20 hover:border-zinc-500/40',  icon: 'text-zinc-400',   glow: 'from-zinc-500/10 to-transparent' },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'red',
  subtitle,
}: StatCardProps) {
  const c = colorMap[color] ?? colorMap.red;

  return (
    <div
      className={`relative bg-card/60 backdrop-blur-md border ${c.border} rounded-2xl p-5 overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]`}
    >
      {/* Premium background backlight glow */}
      <div
        className={`absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr ${c.glow} rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}
      />

      {/* Top right icon corner decoration */}
      <div className="absolute top-4 right-4">
        <PremiumIconBox icon={Icon} color={color === 'zinc' ? 'zinc' : color} size="sm" glow={true} />
      </div>

      {/* Content */}
      <div className="relative pr-10">
        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-widest leading-none mb-2.5">
          {title}
        </p>
        <p className="text-2xl font-display font-bold text-white leading-none tracking-wide group-hover:text-primary transition-colors duration-300">
          {value}
        </p>

        {trendValue !== undefined ? (
          <div
            className={`flex items-center gap-1 mt-3 text-[10px] font-heading font-bold uppercase tracking-wider ${
              trend === 'up' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-green-400 animate-bounce" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span>{trendValue}</span>
          </div>
        ) : subtitle ? (
          <p className="text-[10px] text-muted-foreground font-heading tracking-wide uppercase mt-3 leading-none">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}