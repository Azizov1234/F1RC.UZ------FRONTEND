import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AuthLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  icon: Icon,
  title,
  subtitle,
  footer,
  children,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 bg-radial-gradient">
        <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Decorative Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Animated Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-primary to-orange-400">
              F1RC.UZ
            </span>
          </div>
        </div>

        {/* Content Card with Glassmorphism and Speed Line */}
        <div className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl racing-glow p-8">
          
          {/* F1 Speed Line Decoration */}
          <div className="absolute top-0 left-0 w-full h-[3px] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <Icon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-heading font-semibold text-foreground tracking-wide">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1.5 font-body">{subtitle}</p>
            )}
          </div>

          <div className="space-y-6">
            {children}
          </div>

          {footer && (
            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center text-sm text-muted-foreground font-body">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
