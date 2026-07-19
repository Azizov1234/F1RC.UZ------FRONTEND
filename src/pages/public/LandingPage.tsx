import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { usePublicEvents } from '@/hooks/api/useEvents';
import { usePublicArenas } from '@/hooks/api/useArenas';
import { usePublicCategories } from '@/hooks/api/useCategories';
import { usePublicAchievements } from '@/hooks/api/useAchievements';
import { usePublicStreams } from '@/hooks/api/useStreams';
import { usePublicSeasons } from '@/hooks/api/useSeasons';
import { useLeaderboard } from '@/hooks/api/useLeaderboard';
import { useAuth } from '@/lib/AuthContext';
import {
  Trophy, Calendar, Radio, ChevronRight, Play, ArrowRight,
  MapPin, Activity, Cpu, Users, Award, Smartphone, Check, Sparkles,
  Car, Clock
} from 'lucide-react';
import { getFileUrl } from '@/lib/getFileUrl';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

interface LandingSectionStateProps {
  loading: boolean;
  error: boolean;
  empty: boolean;
  title: string;
  emptyDescription: string;
  onRetry?: () => void;
}

interface RevealSectionProps {
  children: ReactNode;
  className: string;
}

function RevealSection({ children, className }: RevealSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.section
      className={`landing-deferred ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
    >
      {children}
    </m.section>
  );
}

function LandingSectionState({
  loading,
  error,
  empty,
  title,
  emptyDescription,
  onRetry,
}: LandingSectionStateProps) {
  if (!loading && !error && !empty) return null;

  return (
    <section className="mx-auto max-w-7xl px-4" aria-label={title}>
      <div className="rounded-3xl border border-border bg-card/70 p-5">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3" aria-label={`${title} yuklanmoqda`}>
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            size="sm"
            type="server"
            title={`${title} yuklanmadi`}
            description="Qolgan sahifa ishlashda davom etadi. Ushbu bo'limni qayta yuklab ko'ring."
            onRetry={onRetry}
          />
        ) : (
          <EmptyState size="sm" title={title} description={emptyDescription} />
        )}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const nowIso = useMemo(() => new Date().toISOString(), []);

  // Load public data for section renderings
  const eventsQuery = usePublicEvents({ limit: 3, startsFrom: nowIso });
  const arenasQuery = usePublicArenas({ limit: 3 });
  const categoriesQuery = usePublicCategories({ limit: 4 });
  const achievementsQuery = usePublicAchievements({ limit: 3 });
  const streamsQuery = usePublicStreams({ limit: 2, status: 'LIVE' });
  const seasonsQuery = usePublicSeasons({ limit: 5 });

  const eventsRes = eventsQuery.data;
  const arenasRes = arenasQuery.data;
  const categoriesRes = categoriesQuery.data;
  const achievementsRes = achievementsQuery.data;
  const streamsRes = streamsQuery.data;
  const seasonsRes = seasonsQuery.data;

  const now = new Date(nowIso).getTime();
  const activeSeason = seasonsRes?.data.find((season) => {
    const starts = new Date(season.startDate).getTime();
    const ends = new Date(season.endDate).getTime();
    return season.isActive || (Number.isFinite(starts) && Number.isFinite(ends) && starts <= now && now <= ends);
  });
  const activeCategory = categoriesRes?.data.find(c => c.isActive) ?? categoriesRes?.data[0];

  const leaderboardParams = activeSeason && activeCategory
    ? { seasonId: activeSeason.id, categoryId: activeCategory.id, limit: 3 }
    : undefined;

  const leaderboardQuery = useLeaderboard(leaderboardParams);
  const leaderboardRes = leaderboardQuery.data;

  // Active statistics calculated from real loaded data
  const statEventsCount = eventsRes?.meta?.total ?? eventsRes?.data?.length ?? 0;
  const statArenasCount = arenasRes?.meta?.total ?? arenasRes?.data?.length ?? 0;
  const statStreamsCount = streamsRes?.meta?.total ?? streamsRes?.data?.length ?? 0;

  // Countdown timer state for the current season
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const seasonStart = activeSeason ? new Date(activeSeason.startDate).getTime() : 0;
  const seasonEnd = activeSeason ? new Date(activeSeason.endDate).getTime() : 0;
  const seasonDuration = seasonEnd - seasonStart;
  const seasonProgress = activeSeason && seasonDuration > 0
    ? Math.min(100, Math.max(0, ((now - seasonStart) / seasonDuration) * 100))
    : 0;

  useEffect(() => {
    if (!activeSeason?.endDate) return;
    const updateCountdown = () => {
      const difference = +new Date(activeSeason.endDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeSeason?.endDate]);

  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  const handleBooking = (id?: string | number) => {
    const eventPath = id ? `/events/${id}` : '/events';
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(eventPath)}`);
    } else if (user?.role === 'racer') {
      navigate('/racer/events');
    } else {
      navigate(eventPath);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="space-y-24 pb-16 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-16">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(hsl(0 90% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 90% 50%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Subtle decorative circuit path in the background */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <svg className="w-[80vw] h-[60vh] text-primary" viewBox="0 0 1000 600" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M100,100 Q300,50 500,200 T900,100 Q950,300 800,500 T400,550 Q100,550 100,300 Z" strokeDasharray="10 5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Race Without Limits
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white uppercase leading-none">
            F1RC.UZ
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-muted-foreground leading-relaxed">
            Real RC Racing. FPV Driving Experience. Professional Motorsport Platform. <br className="hidden sm:inline" />
            Haqiqiy boshqaruv va telemetriya olami.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => handleBooking('')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-display text-sm font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-[0_4px_18px_rgba(255,0,0,0.35)]"
            >
              Poygani boshlash
            </button>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-card border border-border text-sm font-heading text-white hover:border-primary/50 transition-all duration-300 active:scale-95"
            >
              Eventlarni ko'rish
            </Link>
            <Link
              to="/live"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-heading text-white hover:bg-zinc-800 transition-all duration-300 active:scale-95"
            >
              Jonli efir
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center gap-2 px-8 py-3.5 rounded-2xl border border-primary/40 text-sm font-heading text-primary hover:bg-primary/10 transition-all duration-300 active:scale-95"
            >
              Ro'yxatdan o'tish
            </Link>
          </div>

          {/* Real Loaded Stats */}
          {(statEventsCount > 0 || statArenasCount > 0 || statStreamsCount > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-16 border-t border-border/40 text-center font-mono">
              {statEventsCount > 0 && (
                <div>
                  <p className="text-3xl font-black text-white">{statEventsCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Rejalangan poygalar</p>
                </div>
              )}
              {statArenasCount > 0 && (
                <div>
                  <p className="text-3xl font-black text-white">{statArenasCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Faol arenalar</p>
                </div>
              )}
              {statStreamsCount > 0 && (
                <div>
                  <p className="text-3xl font-black text-white">{statStreamsCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Jonli uzatkichlar</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. PLATFORMA NIMA */}
      <RevealSection className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white">
            Platforma nima?
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground">
            F1RC.UZ — Formula, Le Mans, Rally, GT, Supercar va Hypercar uslubidagi professional RC motorsport platformasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border hover:border-primary/30 rounded-3xl p-6 space-y-4 shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Real RC Racing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              Haqiqiy avtomobillar poygasi. Moslashtirilgan aylanma arenalar, datchik telemetriyasi va aylanish vaqtlarini hisoblash tizimi.
            </p>
          </div>
          <div className="bg-card border border-border hover:border-primary/30 rounded-3xl p-6 space-y-4 shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-heading font-bold text-white text-lg">FPV Driving Experience</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              Mashina ichida o'tirgandek his qiling. Kokpitga o'rnatilgan HD poyga kameralari orqali yuqori tezlik hayajoni.
            </p>
          </div>
          <div className="bg-card border border-border hover:border-primary/30 rounded-3xl p-6 space-y-4 shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Competitive Seasons</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              Jamoaviy va individual chempionatlar, doimiy mavsumlar, ballar reytingi va mukofotlar jamg'armasi.
            </p>
          </div>
        </div>
      </RevealSection>

      {/* 3. RACING CATEGORIES */}
      <LandingSectionState
        loading={categoriesQuery.isLoading}
        error={categoriesQuery.isError}
        empty={!categoriesQuery.isLoading && !categoriesQuery.isError && (categoriesRes?.data.length ?? 0) === 0}
        title="Poyga toifalari"
        emptyDescription="Hozircha public poyga toifalari mavjud emas."
        onRetry={() => { void categoriesQuery.refetch(); }}
      />
      {categoriesRes?.data && categoriesRes.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
                Poyga Toifalari
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Motorsport racing categories
              </p>
            </div>
            <Link to="/categories" className="text-xs text-primary hover:underline flex items-center gap-1">
              Barchasini ko'rish <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesRes.data.map(cat => (
              <div key={cat.id} className="bg-card border border-border rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-primary/20 transition-all duration-300">
                {cat.imageUrl && (
                  <div className="mb-4 aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                    <img
                      src={getFileUrl(cat.imageUrl)}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-bold text-white uppercase tracking-wide text-base leading-snug group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    {cat.slug && (
                      <span className="text-[9px] font-mono tracking-wider font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {cat.slug}
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-end justify-between gap-3 text-[11px] font-mono text-zinc-300">
                  <div className="space-y-1">
                    <span className="block">{cat.trackType ? `Trek: ${cat.trackType}` : 'Trek turi ko‘rsatilmagan'}</span>
                    {cat.speedRange && <span className="block text-muted-foreground">Tezlik: {cat.speedRange}</span>}
                  </div>
                  <Link to={`/categories/${cat.id}`} className="text-primary flex items-center gap-1 font-heading font-bold">
                    Tafsilotlar <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. FPV DRIVING EXPERIENCE */}
      <RevealSection className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-mono font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" /> FPV cockpit experience
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
            FPV DRIVING EXPERIENCE
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-body">
            Avtomobil kokpitida o'rnatilgan HD poyga kameralari va professional pult/simulyator boshqaruvi orqali xuddi haqiqiy motorsport kokpitida o'tirgandek boshqaring. Kam kechikishli signal uzatkichlar va yuqori chastotali tasvirlar sizga haqiqiy motorsport tezlik shukuhini his qildiradi.
          </p>
          <div className="pt-2">
            <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-heading font-bold text-xs uppercase tracking-widest">
              FPV tajribasini ko'rish
            </Link>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card via-background to-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          {/* Decorative UI preview: these are intentionally not production readings. */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-primary/5 rounded-full blur-xl animate-pulse" />
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> Telemetry UI preview
          </h3>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Dekorativ interfeys — jonli sensor ma'lumoti emas
          </p>
          <div className="space-y-3 font-mono text-xs text-white">
            <div className="border border-border/80 rounded-xl p-3 flex justify-between">
              <span className="text-muted-foreground">LATENCY</span>
              <span className="text-muted-foreground font-bold">-- ms</span>
            </div>
            <div className="border border-border/80 rounded-xl p-3 flex justify-between">
              <span className="text-muted-foreground">SIGNAL STRENGTH</span>
              <span className="text-muted-foreground font-bold">-- %</span>
            </div>
            <div className="border border-border/80 rounded-xl p-3 flex justify-between">
              <span className="text-muted-foreground">RESOLUTION</span>
              <span className="text-muted-foreground font-bold">--</span>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 5. UPCOMING EVENTS */}
      <LandingSectionState
        loading={eventsQuery.isLoading}
        error={eventsQuery.isError}
        empty={!eventsQuery.isLoading && !eventsQuery.isError && (eventsRes?.data.length ?? 0) === 0}
        title="Kelgusi poygalar"
        emptyDescription="Hozircha kelgusi event mavjud emas."
        onRetry={() => { void eventsQuery.refetch(); }}
      />
      {eventsRes?.data && eventsRes.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
                Kelgusi Poygalar
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Upcoming motorsport races
              </p>
            </div>
            <Link to="/events" className="text-xs text-primary hover:underline flex items-center gap-1">
              Barcha musobaqalar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {eventsRes.data.map(event => {
              const formattedDate = event.startsAt
                ? format(new Date(event.startsAt), 'dd.MM.yyyy HH:mm')
                : 'Sana aniqlanmagan';


              return (
                <div key={event.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-primary/20 group">
                  <div className="h-44 bg-muted relative overflow-hidden flex items-center justify-center">
                    {event.coverImageUrl ? (
                      <img src={getFileUrl(event.coverImageUrl)} alt={event.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Calendar className="w-10 h-10 text-muted-foreground" />
                    )}
                    {event.category?.name && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-white uppercase tracking-wider">
                        {event.category.name}
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-display font-extrabold text-white tracking-wide text-base uppercase">
                        {event.name}
                      </h3>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border space-y-1.5 text-[11px] font-mono text-zinc-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>Sana: {formattedDate}</span>
                      </div>
                      {event.arena && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span>Arena: {event.arena.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-2">
                      <Link to={`/events/${event.id}`} className="w-full flex items-center justify-center py-2 rounded-xl bg-muted border border-border text-xs text-white font-heading font-semibold">
                        Batafsil
                      </Link>
                      <button
                        onClick={() => handleBooking(event.id)}
                        className="w-full flex items-center justify-center py-2 rounded-xl bg-primary text-white font-display text-xs font-bold uppercase tracking-widest"
                      >
                        Bron qilish
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. LIVE RACE CENTER PREVIEW */}
      <LandingSectionState
        loading={streamsQuery.isLoading}
        error={streamsQuery.isError}
        empty={!streamsQuery.isLoading && !streamsQuery.isError && (streamsRes?.data.length ?? 0) === 0}
        title="Jonli efir"
        emptyDescription="Hozircha jonli efir mavjud emas."
        onRetry={() => { void streamsQuery.refetch(); }}
      />
      {streamsRes?.data && streamsRes.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
                Jonli Efirlar (Streams)
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Live stream coverage
              </p>
            </div>
            <Link to="/streams" className="text-xs text-primary hover:underline flex items-center gap-1">
              Barcha efirlar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {streamsRes.data.map(stream => {

              return (
                <div key={stream.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg group hover:border-primary/20 transition-all duration-300">
                  <div className="aspect-video bg-muted relative overflow-hidden flex items-center justify-center">
                    {stream.event?.coverImageUrl ? (
                      <img src={getFileUrl(stream.event.coverImageUrl)} alt={stream.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <Radio className="w-12 h-12 text-muted-foreground" />
                    )}

                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      LIVE
                    </div>

                    <Link to={`/live?id=${stream.id}`} className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </Link>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-heading font-semibold text-white tracking-wide text-base group-hover:text-primary transition-colors">
                      {stream.title}
                    </h3>
                    {stream.event?.name && (
                      <p className="text-xs text-muted-foreground font-body">
                        Event: {stream.event.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. CURRENT SEASON & PRIZE POOL */}
      <LandingSectionState
        loading={seasonsQuery.isLoading}
        error={seasonsQuery.isError}
        empty={!seasonsQuery.isLoading && !seasonsQuery.isError && !activeSeason}
        title="Joriy mavsum"
        emptyDescription="Hozircha faol mavsum e'lon qilinmagan."
        onRetry={() => { void seasonsQuery.refetch(); }}
      />
      {activeSeason && (
        <section className="max-w-4xl mx-auto px-4 bg-gradient-to-br from-card via-background to-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              Mavsum tafsilotlari
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              {activeSeason.name}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Sana: {activeSeason.startDate ? format(new Date(activeSeason.startDate), 'dd.MM.yyyy') : '-'} — {activeSeason.endDate ? format(new Date(activeSeason.endDate), 'dd.MM.yyyy') : '-'}
            </p>
            {'eventsCount' in activeSeason && typeof activeSeason.eventsCount === 'number' && (
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Eventlar: {activeSeason.eventsCount}
              </p>
            )}
          </div>

          <div className="mx-auto max-w-lg space-y-2 text-left">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <span>Mavsum jarayoni</span>
              <span>{Math.round(seasonProgress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Mavsum jarayoni" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(seasonProgress)}>
              <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${seasonProgress}%` }} />
            </div>
          </div>

          {/* Countdown timer */}
          <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto pt-4 text-center font-mono">
            <div className="bg-zinc-950 border border-border/80 rounded-2xl p-3.5">
              <span className="text-xl sm:text-2xl font-black text-white block">{timeLeft.days}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider">kun</span>
            </div>
            <div className="bg-zinc-950 border border-border/80 rounded-2xl p-3.5">
              <span className="text-xl sm:text-2xl font-black text-white block">{timeLeft.hours}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider">soat</span>
            </div>
            <div className="bg-zinc-950 border border-border/80 rounded-2xl p-3.5">
              <span className="text-xl sm:text-2xl font-black text-white block">{timeLeft.minutes}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider">min</span>
            </div>
            <div className="bg-zinc-950 border border-border/80 rounded-2xl p-3.5">
              <span className="text-xl sm:text-2xl font-black text-white block">{timeLeft.seconds}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider">sek</span>
            </div>
          </div>
        </section>
      )}

      {/* 8. HOW IT WORKS */}
      <RevealSection className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
            Qanday ishlaydi?
          </h2>
          <p className="max-w-md mx-auto text-xs text-muted-foreground">
            Professional RC motorsport poygalarida ishtirok etish uchun oddiy 4 bosqich.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 relative">
            <span className="text-3xl font-black font-mono text-primary/25 block">01</span>
            <h4 className="font-heading font-semibold text-white">Ro‘yxatdan o‘t</h4>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Platformamizda tezda profil yarating va 'Racer' roliga ega bo'ling.
            </p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 relative">
            <span className="text-3xl font-black font-mono text-primary/25 block">02</span>
            <h4 className="font-heading font-semibold text-white">Slot tanla</h4>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Kelgusi eventlar ro'yxatidan qulay vaqt va avtomobilni bron qiling.
            </p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 relative">
            <span className="text-3xl font-black font-mono text-primary/25 block">03</span>
            <h4 className="font-heading font-semibold text-white">Mashinani boshqar</h4>
            <p className="text-[11px] text-muted-foreground leading-normal">
              FPV kokpitida yoki pult yordamida real vaqtda poygaga qo'shiling.
            </p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 relative">
            <span className="text-3xl font-black font-mono text-primary/25 block">04</span>
            <h4 className="font-heading font-semibold text-white">Ball to'pla</h4>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Aylanish vaqtlari bo'yicha chempionlik ballarini va yutuqlarni qo'lga kiriting.
            </p>
          </div>
        </div>
      </RevealSection>

      {/* 9. LEADERBOARD PREVIEW */}
      <LandingSectionState
        loading={seasonsQuery.isLoading || categoriesQuery.isLoading || leaderboardQuery.isFetching}
        error={seasonsQuery.isError || categoriesQuery.isError || leaderboardQuery.isError}
        empty={!seasonsQuery.isLoading && !categoriesQuery.isLoading && !leaderboardQuery.isFetching && (!leaderboardParams || (leaderboardRes?.data.length ?? 0) === 0)}
        title="Reyting"
        emptyDescription="Reyting uchun faol mavsum, toifa va natijalar hali mavjud emas."
        onRetry={() => {
          void seasonsQuery.refetch();
          void categoriesQuery.refetch();
          if (leaderboardParams) void leaderboardQuery.refetch();
        }}
      />
      {leaderboardRes?.data && leaderboardRes.data.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
              Reyting Etakchilari (Podium)
            </h2>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              Leaderboard leaders preview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {leaderboardRes.data.slice(0, 3).map((entry, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              const rank = entry.rank ?? idx + 1;
              return (
                <div key={entry.id} className="bg-card border border-border rounded-3xl p-6 text-center space-y-3 flex flex-col items-center">
                  <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-yellow-400">
                    {medals[idx]} {rank}-o'rin
                  </span>
                  <div className="w-12 h-12 overflow-hidden rounded-full bg-muted flex items-center justify-center font-heading font-bold text-white">
                    {entry.user?.avatarUrl ? (
                      <img src={getFileUrl(entry.user.avatarUrl)} alt={entry.user.fullName} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      entry.user?.fullName?.[0] || '?'
                    )}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wide">
                      {entry.user?.fullName || 'Ism ko‘rsatilmagan'}
                    </h4>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 border-t border-border/60 pt-3 text-center font-mono text-[9px]">
                    <div><span className="block font-bold text-white">{entry.totalPoints}</span><span className="text-muted-foreground">PTS</span></div>
                    <div><span className="block font-bold text-white">{entry.winsCount}</span><span className="text-muted-foreground">WINS</span></div>
                    {entry.bestLapMs != null && (
                      <div className="col-span-2"><span className="font-bold text-white">{(entry.bestLapMs / 1000).toFixed(3)}s</span><span className="ml-1 text-muted-foreground">BEST LAP</span></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center pt-2">
            <Link to="/leaderboard" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-heading font-semibold uppercase tracking-wider">
              To'liq reyting jadvalini ko'rish <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 10. ARENAS & TRACK LAYOUTS */}
      <LandingSectionState
        loading={arenasQuery.isLoading}
        error={arenasQuery.isError}
        empty={!arenasQuery.isLoading && !arenasQuery.isError && (arenasRes?.data.length ?? 0) === 0}
        title="Arenalar"
        emptyDescription="Hozircha public arena mavjud emas."
        onRetry={() => { void arenasQuery.refetch(); }}
      />
      {arenasRes?.data && arenasRes.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
                Arenalar va Treklar
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Racing arenas and locations
              </p>
            </div>
            <Link to="/arenas" className="text-xs text-primary hover:underline flex items-center gap-1">
              Barcha arenalar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {arenasRes.data.map(arena => (
              <div key={arena.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg group hover:border-primary/20 transition-all duration-300">
                <div className="h-40 bg-muted relative overflow-hidden flex items-center justify-center">
                  {arena.coverImageUrl ? (
                    <img src={getFileUrl(arena.coverImageUrl)} alt={arena.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <MapPin className="w-10 h-10 text-muted-foreground" />
                  )}
                  {arena.city && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-white uppercase tracking-wider">
                      📍 {arena.city}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-display font-extrabold text-white tracking-wide text-base uppercase group-hover:text-primary transition-colors">
                    {arena.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {arena.description || [arena.city, arena.address].filter(Boolean).join(' • ') || 'Arena tavsifi hali kiritilmagan.'}
                  </p>
                  {(typeof arena.trackLayoutsCount === 'number' || typeof arena.zonesCount === 'number') && (
                    <div className="flex flex-wrap gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {typeof arena.trackLayoutsCount === 'number' && <span>Treklar: {arena.trackLayoutsCount}</span>}
                      {typeof arena.zonesCount === 'number' && <span>Zonalar: {arena.zonesCount}</span>}
                    </div>
                  )}
                  <Link to={`/arenas/${arena.id}`} className="text-xs text-primary font-heading font-semibold uppercase tracking-wider flex items-center gap-1 pt-1.5">
                    Tafsilotlar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. TEAMS — public catalogue is intentionally not queried until the backend exposes one. */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-9 shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Users className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-foreground">
                  Poyga jamoalari
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Guest uchun public jamoalar katalogi backendda hali ochilmagan. Bu bo'lim yopiq endpointga so'rov yubormaydi.
                </p>
              </div>
            </div>
            <Link to="/teams" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-xs font-heading font-bold uppercase tracking-wider text-foreground hover:border-primary/40 hover:text-primary">
              Holatni ko'rish <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 12. ACHIEVEMENTS */}
      <LandingSectionState
        loading={achievementsQuery.isLoading}
        error={achievementsQuery.isError}
        empty={!achievementsQuery.isLoading && !achievementsQuery.isError && (achievementsRes?.data.length ?? 0) === 0}
        title="Muvaffaqiyatlar"
        emptyDescription="Hozircha public achievement mavjud emas."
        onRetry={() => { void achievementsQuery.refetch(); }}
      />
      {achievementsRes?.data && achievementsRes.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
                Muvaffaqiyatlar (Achievements)
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Racer badges and trophies
              </p>
            </div>
            <Link to="/achievements" className="text-xs text-primary hover:underline flex items-center gap-1">
              Barchasini ko'rish <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievementsRes.data.map(ach => (
              <div key={ach.id} className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-center relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {ach.iconUrl ? (
                    <img src={getFileUrl(ach.iconUrl)} alt={ach.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <Award className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm tracking-wide leading-tight">
                    {ach.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {ach.description || 'Tavsif hali kiritilmagan.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 13. RACER CHALLENGES PREVIEW */}
      <section className="max-w-4xl mx-auto px-4 bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative text-center">
        <div className="absolute top-4 right-4 w-10 h-10 bg-primary/5 rounded-full blur-xl pointer-events-none" />
        <h2 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
          Racer Challenges
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Racer vs Racer, arena tanlash va event challenge konsepti. Backendda challenge endpointi yo'q, shu sabab bu faqat kelajak funksiyasi preview'i.
        </p>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[9px] font-mono uppercase tracking-widest">
            Coming soon / Yaqin kunlarda
          </span>
        </div>
      </section>

      {/* 14. SUBSCRIPTION PLANS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
            A'zolik Rejalari
          </h2>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Subscription plans
          </p>
        </div>

        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-7 text-center shadow-lg">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
            Coming soon
          </span>
          <h3 className="mt-4 font-display text-xl font-bold uppercase tracking-wide text-foreground">
            Tariflar hali e'lon qilinmagan
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Backend public sozlamalarida tasdiqlangan tarif yoki checkout mavjud emas. Qatnashish narxi va shartlari mavjud bo'lsa, ular event sahifasida ko'rsatiladi.
          </p>
          <Link to="/register" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-3 text-xs font-heading font-bold uppercase tracking-widest text-white">
            Ro'yxatdan o'tish
          </Link>
        </div>
      </section>

      {/* 15. MOBILE EXPERIENCE */}
      <RevealSection className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-mono font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" /> Smart-control system
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight leading-none">
            Mobil tajriba
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-body">
            Quyidagi telefon maketi mobil interfeys konseptini ko'rsatadi. U real backend yozuvi yoki alohida mobil ilova mavjudligini anglatmaydi.
          </p>
          <ul className="space-y-2.5 text-xs font-mono text-white">
            <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary" /> Booking oqimi</li>
            <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary" /> Live stream</li>
            <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary" /> Leaderboard</li>
            <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary" /> Notifications</li>
            <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary" /> Race results</li>
          </ul>
        </div>
        <div className="mx-auto w-full max-w-sm rounded-[2.5rem] border-8 border-zinc-800 bg-card p-4 shadow-2xl" aria-label="Mobil interfeys UI preview">
          <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-zinc-700" aria-hidden="true" />
          <div className="rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Race center</h3>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[8px] font-mono font-bold uppercase text-primary">UI preview</span>
            </div>
            <div className="mt-5 space-y-3">
              {['Booking', 'Live stream', 'Leaderboard', 'Notifications', 'Race results'].map((item) => (
                <div key={item} className="flex min-h-11 items-center justify-between rounded-xl border border-border bg-card px-3 text-xs font-heading text-foreground">
                  <span>{item}</span>
                  <ChevronRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 16. FAQ PREVIEW */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
            FAQ / Ko'p Beriladigan Savollar
          </h2>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Frequently asked questions
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300">
            <button
              onClick={() => setFaqOpenIndex(faqOpenIndex === 0 ? null : 0)}
              aria-expanded={faqOpenIndex === 0}
              aria-controls="landing-faq-answer-0"
              id="landing-faq-button-0"
              className="w-full flex items-center justify-between p-5 text-left font-display font-semibold text-white tracking-wide hover:bg-white/5 focus:outline-none"
            >
              <span>F1RC.UZ nima?</span>
              <ChevronRight className={`w-4.5 h-4.5 text-muted-foreground transition-transform ${faqOpenIndex === 0 ? 'rotate-90 text-primary' : ''}`} />
            </button>
            <div
              id="landing-faq-answer-0"
              role="region"
              aria-labelledby="landing-faq-button-0"
              hidden={faqOpenIndex !== 0}
              className="border-t border-border/50"
            >
              <p className="p-5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                F1RC.UZ — Formula, GT, Rally klassidagi radio-boshqariladigan avtomobillar poygasi uchun professional raqobat va boshqaruv platformasidir.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300">
            <button
              onClick={() => setFaqOpenIndex(faqOpenIndex === 1 ? null : 1)}
              aria-expanded={faqOpenIndex === 1}
              aria-controls="landing-faq-answer-1"
              id="landing-faq-button-1"
              className="w-full flex items-center justify-between p-5 text-left font-display font-semibold text-white tracking-wide hover:bg-white/5 focus:outline-none"
            >
              <span>RC racing qanday ishlaydi?</span>
              <ChevronRight className={`w-4.5 h-4.5 text-muted-foreground transition-transform ${faqOpenIndex === 1 ? 'rotate-90 text-primary' : ''}`} />
            </button>
            <div
              id="landing-faq-answer-1"
              role="region"
              aria-labelledby="landing-faq-button-1"
              hidden={faqOpenIndex !== 1}
              className="border-t border-border/50"
            >
              <p className="p-5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                Siz arenalarimizda o'rnatilgan RC avtomobillarini simulator boshqaruv kokpitlari va datchiklar yordamida telemetriyada haydaysiz.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/faq" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-heading font-semibold uppercase tracking-wider">
            Barcha savollarni ko'rish <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 17. FINAL CTA */}
      <RevealSection className="max-w-4xl mx-auto px-4 bg-gradient-to-r from-red-950 via-primary to-red-950 border border-primary/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-wide leading-tight">
            Tayyormisiz? <br /> READY TO RACE?
          </h2>
          <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
            F1RC.UZ bilan professional RC motorsport olamiga kiring va real vaqtdagi aylanma yo'llarda tezlik rekordlarini o'rnating.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-4">
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-display text-xs font-bold uppercase tracking-widest">
              Ro'yxatdan o'tish
            </Link>
            <Link to="/events" className="inline-flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/60 border border-white/20 text-white rounded-xl font-display text-xs font-bold uppercase tracking-widest">
              Musobaqalar
            </Link>
            <Link to="/live" className="inline-flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/60 border border-white/20 text-white rounded-xl font-display text-xs font-bold uppercase tracking-widest">
              Jonli poyga
            </Link>
          </div>
        </div>
      </RevealSection>
    </div>
    </LazyMotion>
  );
}
