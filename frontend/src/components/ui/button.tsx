import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'premium';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-heading font-semibold tracking-wide transition-all duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          {
            // default
            'bg-primary text-white shadow-[0_4px_14px_0_rgba(255,0,0,0.3)] hover:bg-primary/95 hover:shadow-[0_6px_20px_0_rgba(255,0,0,0.4)]': variant === 'default',
            // destructive
            'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/95': variant === 'destructive',
            // outline (glassmorphic premium)
            'border border-border bg-card/40 backdrop-blur-md text-foreground hover:bg-white/5 hover:border-white/20 shadow-sm': variant === 'outline',
            // secondary
            'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80': variant === 'secondary',
            // ghost
            'hover:bg-white/5 hover:text-foreground text-muted-foreground': variant === 'ghost',
            // link
            'text-primary underline-offset-4 hover:underline': variant === 'link',
            // premium racing-glow button
            'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_20px_0_rgba(255,0,0,0.35)] hover:shadow-[0_0_30px_0_rgba(255,0,0,0.5)] border border-red-400/25': variant === 'premium',
          },
          {
            'h-11 px-5 py-2.5': size === 'default',
            'h-9 rounded-lg px-4 text-xs': size === 'sm',
            'h-13 rounded-2xl px-8 text-base': size === 'lg',
            'h-11 w-11 rounded-xl': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };

