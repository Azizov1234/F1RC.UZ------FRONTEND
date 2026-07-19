import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Activity, Calendar, Trophy, Car, MapPin, Grid, Layers, Info, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import SEO, { SITE_URL, type SEOProps } from '@/components/SEO';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

type PublicSeoConfig = Pick<SEOProps, 'title' | 'description'>;

const PUBLIC_SEO: Record<string, PublicSeoConfig> = {
  '/': {
    title: 'F1RC.UZ - Race Without Limits',
    description: 'Real RC racing, FPV driving experience va professional poygalarni F1RC.UZ bilan kashf eting.',
  },
  '/events': { title: 'Public Events', description: 'F1RC.UZ public poygalari, sanalari, arenalari va ro‘yxatdan o‘tish holatini ko‘ring.' },
  '/categories': { title: 'Racing Categories', description: 'Backenddan olingan F1RC.UZ racing kategoriyalari va ularning xususiyatlari.' },
  '/vehicles': { title: 'Public Vehicles', description: 'F1RC.UZ public RC vehicle katalogi va real texnik ma’lumotlar.' },
  '/arenas': { title: 'Racing Arenas', description: 'F1RC.UZ public arenalari, trek chizmalari va zonalarini ko‘ring.' },
  '/streams': { title: 'Public Streams', description: 'F1RC.UZ poyga efirlari va mavjud jonli translyatsiyalar.' },
  '/live': { title: 'Live Race Center', description: 'Jonli F1RC.UZ stream, event va public reyting ma’lumotlari.' },
  '/leaderboard': { title: 'Public Leaderboard', description: 'Mavsum va kategoriya bo‘yicha F1RC.UZ public reyting jadvali.' },
  '/teams': { title: 'Public Teams', description: 'F1RC.UZ public jamoalar katalogining joriy holati.' },
  '/achievements': { title: 'Public Achievements', description: 'F1RC.UZ achievement va mukofotlar public preview katalogi.' },
  '/about': { title: 'F1RC.UZ haqida', description: 'F1RC.UZ RC motorsport va FPV platformasi haqida.' },
  '/faq': { title: 'FAQ', description: 'F1RC.UZ, RC racing, FPV, booking va to‘lov haqidagi savollarga javoblar.' },
};

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateNetworkState = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateNetworkState);
    window.addEventListener('offline', updateNetworkState);
    return () => {
      window.removeEventListener('online', updateNetworkState);
      window.removeEventListener('offline', updateNetworkState);
    };
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
    mainRef.current?.focus();
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: t.events || 'Events', path: '/events', icon: Calendar },
    { name: 'Arenas', path: '/arenas', icon: MapPin },
    { name: t.categories || 'Categories', path: '/categories', icon: Grid },
    { name: t.vehicles || 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Live', path: '/live', icon: Activity },
    { name: t.leaderboard || 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: t.teams || 'Teams', path: '/teams', icon: Layers },
    { name: 'About', path: '/about', icon: Info },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    const role = user.role?.toLowerCase();
    if (role === 'admin' || role === 'superadmin') return '/admin';
    if (role === 'operator') return '/operator';
    if (role === 'team_manager') return '/team-manager';
    return '/racer';
  };

  const basePath = location.pathname
    .replace(/^\/(events|categories|vehicles|arenas|teams)\/[^/]+$/, '/$1');
  const seo = PUBLIC_SEO[basePath] ?? PUBLIC_SEO['/'];
  const structuredData = location.pathname === '/'
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'F1RC.UZ',
        url: SITE_URL,
        description: seo.description,
      }
    : undefined;
  const pageOwnsSeo = /^\/events\/[^/]+$/.test(location.pathname);

  const trapDrawerFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body selection:bg-primary selection:text-white transition-colors duration-300">
      {!pageOwnsSeo && (
        <SEO
          title={seo.title}
          description={seo.description}
          canonicalPath={location.pathname}
          structuredData={structuredData}
        />
      )}
      {/* Premium Sticky/Transparent Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-background/80 backdrop-blur-lg border-border/80 shadow-lg shadow-black/10 py-3'
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.4)] border border-red-400/20 group-hover:scale-105 transition-all duration-300">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-black tracking-widest text-foreground">F1RC.UZ</span>
                <span className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase -mt-1">Motorsport</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-card/40 border border-border/40 rounded-full px-2.5 py-1.5 backdrop-blur-md">
              {navLinks.map((link) => {
                const active = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-1.5 rounded-full text-xs font-display font-semibold tracking-wider uppercase transition-all duration-300 ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right-side Utilities & CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />

              {isAuthenticated ? (
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-display text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-[0_4px_14px_rgba(255,0,0,0.3)]"
                >
                  Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-display font-semibold tracking-widest uppercase text-muted-foreground hover:text-white transition-colors"
                  >
                    Kirish
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-display text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-md shadow-white/5"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                ref={menuButtonRef}
                onClick={() => setMobileMenuOpen(true)}
                className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all active:scale-90"
                aria-label="Navigatsiya menyusini ochish"
                aria-expanded={mobileMenuOpen}
                aria-controls="public-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {!isOnline && (
        <div className="fixed left-1/2 top-20 z-40 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-xl border border-orange-500/30 bg-background/95 px-4 py-3 text-center text-xs font-heading text-orange-400 shadow-xl backdrop-blur" role="status" aria-live="assertive">
          Internet aloqasi yo'q. Keshlangan public ma'lumotlar ko'rinishi mumkin; qayta ulanish kutilmoqda.
        </div>
      )}

      {/* Mobile Drawer (Menu) */}
      <div
        id="public-mobile-menu"
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer container */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Public navigatsiya"
          onKeyDown={trapDrawerFocus}
          className={`absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-card border-l border-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out safe-area-padding ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.4)]">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-black tracking-widest text-foreground text-base">F1RC.UZ</span>
            </Link>
            <button
              ref={closeButtonRef}
              onClick={() => setMobileMenuOpen(false)}
              className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              aria-label="Navigatsiya menyusini yopish"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {navLinks.map((link) => {
              const active = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-11 items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-display font-bold tracking-widest uppercase transition-all duration-200 ${
                    active
                      ? 'bg-primary text-white border border-primary/20 shadow-md shadow-primary/10'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Drawer Footer Buttons */}
          <div className="p-5 border-t border-border bg-background space-y-3 pb-8">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-display text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.98] shadow-md shadow-primary/20"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-11 flex items-center justify-center py-2.5 rounded-xl bg-muted text-white border border-border font-display text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-11 flex items-center justify-center py-2.5 rounded-xl bg-white text-black font-display text-xs font-bold tracking-widest uppercase transition-colors shadow-sm"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
            <p className="text-[10px] text-center text-muted-foreground font-mono uppercase tracking-widest">
              Race Without Limits
            </p>
          </div>
        </aside>
      </div>

      {/* Main Public Route Content */}
      <main ref={mainRef} tabIndex={-1} className="flex-grow pt-24 pb-12 outline-none">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-card border-t border-border pt-16 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.4)]">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-display text-lg font-black tracking-widest text-foreground">F1RC.UZ</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Formula, Le Mans, Rally, GT va Supercar uslubidagi RC motorsport platformasi. Public eventlar, arenalar, streamlar va reytinglar.
              </p>
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase text-primary tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Guest Viewer • Public API</span>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white mb-4">Poygalar</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">Kelayotgan Eventlar</Link></li>
                <li><Link to="/live" className="text-muted-foreground hover:text-primary transition-colors">Jonli Race Center</Link></li>
                <li><Link to="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">Foydalanuvchilar reytingi</Link></li>
                <li><Link to="/streams" className="text-muted-foreground hover:text-primary transition-colors">Videotranslyatsiyalar</Link></li>
              </ul>
            </div>

            {/* Column 3: Platform Info */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white mb-4">Platforma</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/arenas" className="text-muted-foreground hover:text-primary transition-colors">Poyga arenalari</Link></li>
                <li><Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">Avtomobil toifalari</Link></li>
                <li><Link to="/vehicles" className="text-muted-foreground hover:text-primary transition-colors">Avtopark</Link></li>
                <li><Link to="/teams" className="text-muted-foreground hover:text-primary transition-colors">Poyga jamoalari</Link></li>
              </ul>
            </div>

            {/* Column 4: Help/FAQ */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white mb-4">Yordam</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ / Ko'p beriladigan savollar</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">Klub haqida</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Tizimga kirish</Link></li>
                <li><Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">Ro'yxatdan o'tish</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-muted-foreground font-mono">
              © {new Date().getFullYear()} F1RC.UZ. Barcha huquqlar himoyalangan.
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">Race Without Limits</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
