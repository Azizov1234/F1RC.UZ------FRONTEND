import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
}

interface MobileBottomNavProps {
  items: NavItem[];
}

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean): boolean => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/80 backdrop-blur-xl border-t border-border/80 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around px-2 py-2.5 h-16">
        {items.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-300 min-w-0 flex-1 active:scale-90`}
            >
              {/* Active pill background indicator */}
              {active && (
                <div className="absolute top-0 w-8 h-1 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(255,0,0,0.5)] transition-all duration-300" />
              )}
              
              <div className={`p-1.5 rounded-full transition-all duration-300 ${active ? 'scale-110 text-primary' : 'text-muted-foreground'}`}>
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors duration-300`}
                />
              </div>

              <span
                className={`text-[9px] font-heading font-semibold uppercase tracking-wider truncate transition-colors duration-300 ${
                  active ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}