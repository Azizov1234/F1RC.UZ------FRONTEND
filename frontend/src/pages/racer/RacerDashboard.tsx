import { Trophy, Calendar, Flag, ChevronRight, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { achievementsApi } from '@/api/achievements.api';
import { seasonsApi } from '@/api/seasons.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import { usePublicCategories } from '@/hooks/api/useCategories';
import { useLeaderboard } from '@/hooks/api/useLeaderboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

import { eventsApi } from '@/api/events.api';
import { bookingsApi } from '@/api/bookings.api';

export default function RacerDashboard() {
  const { user } = useAuth();

  const { data: seasonsData, isLoading: loadingSeasons, isError: errSeasons } = useQuery({
    queryKey: queryKeys.seasons.list({ scope: 'public', limit: 100 }),
    queryFn: () => seasonsApi.getPublicSeasons({ limit: 100 }),
  });
  const { data: categoriesData, isLoading: loadingCategories, isError: errCategories } = usePublicCategories({ limit: 100 });
  const activeSeason = seasonsData?.data.find(season => season.isActive) ?? seasonsData?.data[0];
  const activeCategory = categoriesData?.data.find(category => category.isActive) ?? categoriesData?.data[0];
  const leaderboardParams = activeSeason && activeCategory
    ? { seasonId: activeSeason.id, categoryId: activeCategory.id, limit: 100 }
    : undefined;
  const { data: rankData, isLoading: loadingRank, isError: errRank } = useLeaderboard(leaderboardParams);

  // Load achievements
  const { data: achievementsData, isLoading: loadingAch, isError: errAch } = useQuery({
    queryKey: queryKeys.achievements.my(),
    queryFn: async () => {
      const res = await achievementsApi.getMyAchievements();
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Load upcoming events
  const { data: upcomingEventsData, isLoading: loadingEvents, isError: errEvents } = useQuery({
    queryKey: queryKeys.events.list({ scope: 'public', limit: 3, status: 'REGISTRATION_OPEN' }),
    queryFn: async () => {
      const res = await eventsApi.getPublicEvents({ limit: 3, status: 'REGISTRATION_OPEN' });
      return res.data;
    }
  });

  // Load racer bookings (to get results/history)
  const { data: bookingsData, isLoading: loadingBookings, isError: errBookings } = useQuery({
    queryKey: queryKeys.bookings.mine({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
    queryFn: async () => {
      const res = await bookingsApi.getMyBookings({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' });
      return res.data;
    },
    enabled: !!user?.id
  });

  const isAnyLoading = loadingSeasons || loadingCategories || loadingRank || loadingAch || loadingEvents || loadingBookings;
  const isAnyError = errSeasons || errCategories || errRank || errAch || errEvents || errBookings;

  const numericUserId = Number(user?.id);
  const rankEntryIndex = Number.isFinite(numericUserId)
    ? rankData?.data.findIndex(entry => entry.userId === numericUserId) ?? -1
    : -1;
  const rankEntry = rankEntryIndex >= 0 ? rankData?.data[rankEntryIndex] : undefined;
  const points = rankEntry?.totalPoints ?? 0;
  const wins = rankEntry?.winsCount ?? 0;
  const races = rankEntry?.racesCount ?? 0;
  const rank = rankEntry?.rank ?? (rankEntryIndex >= 0 ? rankEntryIndex + 1 : '-');
  const earnedAchievements = achievementsData?.filter(achievement => achievement.isUnlocked || achievement.awardedAt) ?? [];

  // Calculate generic win rate
  const winRate = races > 0 ? Math.round((wins / races) * 100) : 0;

  if (isAnyError) {
    return (
      <div className="p-4">
        <ErrorState type="server" title="Racer ma'lumotlari yuklanmadi" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-xs text-muted-foreground font-heading uppercase tracking-widest">Xush kelibsiz,</p>
          <h1 className="text-xl font-heading font-bold text-white mt-0.5">{user?.full_name || 'Racer'} 👋</h1>
          <div className="flex gap-4 mt-3">
            {isAnyLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : (
              [
                { label: 'Umumiy ball', value: points.toLocaleString(), color: 'text-primary' },
                { label: "G'alaba", value: wins, color: 'text-yellow-400' },
                { label: 'Poygalar', value: races, color: 'text-blue-400' },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-lg font-display font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">{s.label}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {isAnyLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border/80 bg-card rounded-xl p-3 h-20 flex flex-col items-center justify-center">
              <Skeleton className="w-5 h-5 mb-2 rounded-full" />
              <Skeleton className="w-10 h-4" />
            </div>
          ))
        ) : (
          [
            { label: 'Reyting', value: `#${rank}`, icon: Trophy, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.15)]' },
            { label: 'Yutuqlar', value: earnedAchievements.length, icon: Star, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Win Rate', value: `${winRate}%`, icon: Flag, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
          ].map(s => (
            <div key={s.label} className={`border rounded-xl p-3 text-center transition-all ${s.color}`}>
              <s.icon className="w-5 h-5 mx-auto mb-1" aria-hidden="true" />
              <p className="text-lg font-display font-bold leading-none">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Upcoming events */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-white text-sm">Kelgusi Eventlar</h2>
          <Link to="/racer/events" className="text-xs text-primary hover:text-primary/80 font-heading flex items-center gap-1">
            Barchasi <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border/50">
          {(upcomingEventsData || []).map(event => (
            <div key={event.id} className="flex items-center gap-3 p-4 hover:bg-white/2 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-medium text-white truncate">{event.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span className="font-mono">
                    {event.startsAt ? new Date(event.startsAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-display font-bold text-primary">
                  {(event.price ?? 0).toLocaleString()} {event.currency ?? ''}
                </p>
                <p className={`text-[10px] font-heading text-green-400`}>
                  Racer
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last results */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-white text-sm">So'nggi Natijalar</h2>
        </div>
        <div className="divide-y divide-border/50">
          {(bookingsData || []).map((booking, i) => (
            <div key={booking.id} className="flex items-center gap-3 p-4">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-bold flex-shrink-0
                ${booking.status === 'COMPLETED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                  booking.status === 'CONFIRMED' ? 'bg-gray-400/20 text-gray-300 border border-gray-400/20' :
                  'bg-orange-500/20 text-orange-400 border border-orange-500/20'}
              `}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-medium text-white truncate">{booking.event?.name || `Event #${booking.eventId}`}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  Status: {booking.status}
                </p>
              </div>
              <span className="text-sm font-display font-bold text-green-400 flex-shrink-0">
                {booking.amount?.toLocaleString() ?? 'вЂ”'} {booking.event?.currency ?? ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
