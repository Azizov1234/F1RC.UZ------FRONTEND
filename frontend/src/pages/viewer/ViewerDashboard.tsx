import { Link } from 'react-router-dom';
import {
  Trophy, Calendar, Radio, ChevronRight,
  Clock, Play, Star, Flag
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { streamsApi } from '@/api/streams.api';
import { eventsApi } from '@/api/events.api';
import { seasonsApi } from '@/api/seasons.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import { usePublicCategories } from '@/hooks/api/useCategories';
import { useLeaderboard } from '@/hooks/api/useLeaderboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { getFileUrl } from '@/lib/getFileUrl';
const rankColors = ['text-yellow-400', 'text-gray-400', 'text-orange-400'];
const rankBgs    = ['bg-yellow-500/20', 'bg-gray-400/20', 'bg-orange-500/20'];

export default function ViewerDashboard() {
  const { t } = useI18n();

  // Load live streams
  const { data: streamsData, isLoading: loadingStreams, isError: errStreams } = useQuery({
    queryKey: queryKeys.streams.list({ status: 'LIVE' }),
    queryFn: async () => {
      const res = await streamsApi.getPublicStreams({ status: 'LIVE' });
      return res.data;
    }
  });

  // Load upcoming events
  const { data: eventsData, isLoading: loadingEvents, isError: errEvents } = useQuery({
    queryKey: queryKeys.events.list({ limit: 5 }),
    queryFn: async () => {
      const res = await eventsApi.getPublicEvents({ limit: 5 });
      return res.data;
    }
  });

  const { data: seasonsData, isLoading: loadingSeasons, isError: errSeasons } = useQuery({
    queryKey: queryKeys.seasons.list({ scope: 'public', limit: 100 }),
    queryFn: () => seasonsApi.getPublicSeasons({ limit: 100 }),
  });
  const { data: categoriesData, isLoading: loadingCategories, isError: errCategories } = usePublicCategories({ limit: 100 });
  const activeSeason = seasonsData?.data.find(season => season.isActive) ?? seasonsData?.data[0];
  const activeCategory = categoriesData?.data.find(category => category.isActive) ?? categoriesData?.data[0];
  const leaderboardParams = activeSeason && activeCategory
    ? { seasonId: activeSeason.id, categoryId: activeCategory.id, limit: 5 }
    : undefined;
  const { data: leaderboardData, isLoading: loadingLeaderboard, isError: errLeaderboard } = useLeaderboard(leaderboardParams);

  const isAnyLoading = loadingStreams || loadingEvents || loadingSeasons || loadingCategories || loadingLeaderboard;
  const isAnyError = errStreams || errEvents || errSeasons || errCategories || errLeaderboard;

  const liveStreams = streamsData ?? [];
  const upcomingEvents = eventsData ?? [];
  const leaders = leaderboardData?.data ?? [];

  if (isAnyError) {
    return (
      <div className="p-4">
        <ErrorState type="server" title="Ma'lumotlar yuklanmadi" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-background via-card to-background border border-border p-6">
        {/* decorative grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(hsl(0 90% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 90% 50%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <LiveIndicator dotOnly pulse size="xs" />
            <span className="text-xs font-heading text-red-400 font-semibold tracking-widest uppercase">
              {liveStreams.length} Jonli Translyatsiya
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-wide">
            F1RC.UZ <span className="text-primary">Arena</span>
          </h1>
          <p className="text-sm text-muted-foreground font-heading mt-1">
            RC Motorsport Arena{activeSeason ? ` | ${activeSeason.name}` : ''}
          </p>
          <div className="flex gap-3 mt-4">
            <Link
              to="/viewer/streams"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90 transition-all active:scale-[0.97]"
            >
              <Play className="w-4 h-4" /> Jonli Tomosha
            </Link>
            <Link
              to="/viewer/leaderboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm font-heading text-foreground hover:border-primary/50 transition-all active:scale-[0.97]"
            >
              <Trophy className="w-4 h-4 text-yellow-400" /> Reyting
            </Link>
          </div>
        </div>
      </div>

      {/* Live streams */}
      {liveStreams.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Jonli Translyatsiya
            </h2>
            <Link to="/viewer/streams" className="text-xs text-primary hover:text-primary/80 font-heading flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isAnyLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <Skeleton className="h-32 rounded-lg" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : (
              liveStreams.map(s => (
                <Link
                  key={s.id}
                  to="/viewer/streams"
                  className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-200"
                >
                  {/* Thumbnail area */}
                  <div className="h-32 bg-gradient-to-br from-muted to-background flex items-center justify-center relative">
                    {s.event?.coverImageUrl ? (
                      <img src={getFileUrl(s.event.coverImageUrl)} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <Radio className="w-12 h-12 text-primary/60" aria-hidden="true" />
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {/* Live badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-heading font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <p className="text-sm font-heading font-medium text-foreground truncate flex-1">{s.title}</p>
                    <span className="text-[10px] font-mono text-muted-foreground ml-2 flex-shrink-0">
                      {s.startedAt ? new Date(s.startedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : 'LIVE'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Leaderboard + Events */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top 5 leaderboard */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Top Racerlar
            </h2>
            <Link to="/viewer/leaderboard" className="text-xs text-primary hover:text-primary/80 font-heading flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {isAnyLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              ))
            ) : (
              leaders.map((r, index) => {
                const rank = r.rank ?? index + 1;
                return (
                <div key={r.userId} className="flex items-center gap-3 px-4 py-3">
                  {/* Rank */}
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-bold flex-shrink-0 border ${rankBgs[rank - 1] ?? 'bg-muted'} ${rankColors[rank - 1] ?? 'text-muted-foreground'}`}>
                    {rank}
                  </span>
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary flex-shrink-0">
                    {r.user?.fullName?.[0] || 'R'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-heading font-medium text-foreground truncate">{r.user?.fullName || `Racer #${r.userId}`}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-heading">{r.category?.name || `Kategoriya #${r.categoryId}`}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-display font-bold text-primary">{r.totalPoints.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-heading">{r.winsCount} g'alaba</p>
                  </div>
                </div>
              );})
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Kelgusi Eventlar
            </h2>
            <Link to="/viewer/events" className="text-xs text-primary hover:text-primary/80 font-heading flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {isAnyLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : (
              upcomingEvents.map((event) => (
                  <div key={event.id} className="px-4 py-3.5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Flag className="w-4 h-4 text-primary" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading font-medium text-foreground">{event.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span className="font-mono">{new Date(event.startsAt).toLocaleDateString('uz-UZ')} · {new Date(event.startsAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span className="text-[10px] font-heading font-semibold text-green-400">{event.status.split('_').join(' ')}</span>
                        </div>
                        <span className="mt-1 inline-block text-[10px] font-heading px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {event.category?.name || `Kategoriya #${event.categoryId}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          <div className="p-3 border-t border-border text-center">
            <Link to="/viewer/events" className="text-xs text-primary hover:text-primary/80 font-heading">
              Barcha eventlarni ko'rish →
            </Link>
          </div>
        </div>
      </div>

      {/* Season stats */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading font-semibold text-foreground tracking-wide mb-4">{activeSeason?.name || 'Mavsum statistikasi'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Eventlar', value: upcomingEvents.length, icon: Flag, color: 'text-primary' },
            { label: 'Reytingdagilar', value: leaderboardData?.meta.total ?? leaders.length, icon: Trophy, color: 'text-yellow-400' },
            { label: 'Kategoriyalar', value: categoriesData?.meta.total ?? categoriesData?.data.length ?? 0, icon: Star, color: 'text-blue-400' },
            { label: 'Jonli efirlar', value: liveStreams.length, icon: Radio, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
              <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} aria-hidden="true" />
              <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground font-heading">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
