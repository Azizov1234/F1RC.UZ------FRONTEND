import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Flag, QrCode, Menu, X, LogOut, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MobileBottomNav from './MobileBottomNav';
import { useAuth } from '@/lib/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';
import PremiumIconBox from '@/components/ui/PremiumIconBox';

export default function OperatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();

  const navItems = [
    { path: '/operator',          icon: Home,     label: t.dashboard,   exact: true },
    { path: '/operator/bookings', icon: BookOpen, label: t.bookings },
    { path: '/operator/sessions', icon: Flag,     label: t.raceSessions },
    { path: '/operator/checkin',  icon: QrCode,   label: 'Check-In' },
    { path: '/operator/notifications', icon: Bell, label: 'Bildirishnomalar' },
  ];

  const isActive = (path: string, exact?: boolean) => exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.55)] border border-blue-400/20">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-sidebar-foreground tracking-wider">F1RC.UZ</span>
              <p className="text-[10px] text-blue-400 font-heading tracking-widest uppercase">Operator</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-sidebar-foreground"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1.5 scrollbar-thin">
          {navItems.map(item => {
            const active = isActive(item.path, item.exact);
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold uppercase tracking-wider transition-all duration-300 relative active:scale-[0.98]
                  ${active ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-[0_4px_15px_rgba(37,99,235,0.1)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'}`}>
                <div className="py-1 flex-shrink-0">
                  <PremiumIconBox
                    icon={item.icon}
                    color={active ? 'blue' : 'zinc'}
                    size="sm"
                    glow={active}
                  />
                </div>
                <span className="tracking-widest font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border bg-sidebar-background">
          <button onClick={() => base44.auth.logout('/')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 active:scale-[0.98]">
            <div className="py-1">
              <PremiumIconBox icon={LogOut} color="zinc" size="sm" glow={false} />
            </div>
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>
      <div className="flex flex-col min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 h-14">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground p-1"><Menu className="w-5 h-5" /></button>
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-mono">OPERATOR PANEL</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/operator/notifications" aria-label="Bildirishnomalar" className="w-10 h-10 rounded-xl bg-card/60 border border-border/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-white hover:border-primary/50 shadow-md transition-all duration-300 active:scale-90"><Bell className="w-4 h-4" /></Link>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-heading font-bold text-blue-400">{user?.full_name?.[0] || 'O'}</div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6"><Outlet /></main>
      </div>
      <MobileBottomNav items={navItems} />
    </div>
  );
}
