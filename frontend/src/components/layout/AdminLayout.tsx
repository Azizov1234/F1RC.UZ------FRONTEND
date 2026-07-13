import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen,
  Flag, Trophy, Users2, CreditCard, Activity,
  Settings, LogOut, Menu, X, ChevronRight,
  Shield, Zap, Radio, Car, Tag, Wrench, Gift, Bell, MapPinned, Medal
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MobileBottomNav from './MobileBottomNav';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import PremiumIconBox from '@/components/ui/PremiumIconBox';
import { useHealth } from '@/hooks/api/useHealth';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();
  const { user } = useAuth();
  const health = useHealth();

  const navItems = [
    { path: '/admin',              icon: LayoutDashboard, label: t.dashboard,    exact: true },
    { path: '/admin/users',        icon: Users,           label: t.users },
    { path: '/admin/events',       icon: Calendar,        label: t.events },
    { path: '/admin/bookings',     icon: BookOpen,        label: t.bookings },
    { path: '/admin/race-sessions',icon: Flag,            label: t.raceSessions },
    { path: '/admin/leaderboard',  icon: Trophy,          label: t.leaderboard },
    { path: '/admin/teams',        icon: Users2,          label: t.teams },
    { path: '/admin/seasons',      icon: Zap,             label: t.seasons },
    { path: '/admin/vehicles',     icon: Car,             label: t.vehicles },
    { path: '/admin/maintenance',  icon: Wrench,          label: 'Texnik xizmat' },
    { path: '/admin/arenas',       icon: MapPinned,       label: 'Arenalar' },
    { path: '/admin/categories',   icon: Tag,             label: t.categories },
    { path: '/admin/achievements', icon: Medal,           label: 'Achievementlar' },
    { path: '/admin/streams',      icon: Radio,           label: t.streams },
    { path: '/admin/payments',     icon: CreditCard,      label: t.payments },
    { path: '/admin/audit-logs',   icon: Activity,        label: t.auditLogs },
    { path: '/admin/referrals',    icon: Gift,            label: 'Referrallar' },
    { path: '/admin/notifications',icon: Bell,            label: 'Bildirishnomalar' },
  ];

  const mobileNavItems = [
    { path: '/admin',          icon: LayoutDashboard, label: t.dashboard, exact: true },
    { path: '/admin/users',    icon: Users,           label: t.users },
    { path: '/admin/bookings', icon: BookOpen,        label: t.bookings },
    { path: '/admin/events',   icon: Calendar,        label: t.events },
    { path: '/admin/vehicles', icon: Car,             label: t.vehicles },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => base44.auth.logout('/login');

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 flex flex-col
        bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.55)] border border-red-400/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-sidebar-foreground tracking-wider">F1RC.UZ</span>
              <p className="text-[10px] text-primary font-heading tracking-widest uppercase">
                {user?.role?.toLowerCase() === 'superadmin' ? 'Superadmin' : 'Admin'}
              </p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold uppercase tracking-wider
                  transition-all duration-300 group relative active:scale-[0.98]
                  ${active
                    ? 'bg-primary/10 text-white border border-primary/20 shadow-[0_4px_15px_rgba(255,0,0,0.1)]'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                  }
                `}
              >
                <div className="py-1 flex-shrink-0">
                  <PremiumIconBox
                    icon={item.icon}
                    color={active ? 'red' : 'zinc'}
                    size="sm"
                    glow={active}
                    className="hover:scale-100 active:scale-100"
                  />
                </div>
                <span className="tracking-widest font-bold">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-border space-y-1.5 bg-sidebar-background">
          <Link
            to="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold uppercase tracking-wider transition-all duration-300 active:scale-[0.98]
              ${isActive('/admin/settings')
                ? 'bg-primary/10 text-white border border-primary/20 shadow-[0_4px_15px_rgba(255,0,0,0.1)]'
                : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
              }`}
          >
            <div className="py-1">
              <PremiumIconBox icon={Settings} color={isActive('/admin/settings') ? 'red' : 'zinc'} size="sm" glow={isActive('/admin/settings')} />
            </div>
            <span>{t.settings}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="py-1">
              <PremiumIconBox icon={LogOut} color="zinc" size="sm" glow={false} />
            </div>
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col min-h-screen lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground" title={health.data ? `Database: ${health.data.database} · Uptime: ${Math.round(health.data.uptime)}s` : undefined}>
            <div className={`w-1.5 h-1.5 rounded-full ${health.data?.status === 'ok' ? 'bg-green-500 animate-pulse' : health.isError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="font-mono">{health.data?.status === 'ok' ? t.systemOnline : health.isError ? 'Backend offline' : 'Backend tekshirilmoqda'}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <div className="text-right">
                <p className="text-xs font-heading font-semibold text-foreground tracking-wide uppercase">
                  {user?.role?.toLowerCase() === 'superadmin' ? 'SUPERADMIN' : 'ADMIN'}
                </p>
                <p className="text-[10px] text-muted-foreground">{user?.email || 'admin@f1rc.uz'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav items={mobileNavItems} />
    </div>
  );
}
