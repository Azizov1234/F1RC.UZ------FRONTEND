import { useState, useEffect } from 'react';
import { usePublicSeasons } from '@/hooks/api/useSeasons';
import { usePublicCategories } from '@/hooks/api/useCategories';
import { useLeaderboard } from '@/hooks/api/useLeaderboard';
import { useAuth } from '@/lib/AuthContext';
import { Trophy, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFileUrl } from '@/lib/getFileUrl';

const podiumStyles = [
  { text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', badge: '🥇 1st' },
  { text: 'text-zinc-400', bg: 'bg-zinc-400/10 border-zinc-400/20', badge: '🥈 2nd' },
  { text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', badge: '🥉 3rd' },
];

export default function PublicLeaderboardPage() {
  const { user } = useAuth();
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // 1. Fetch seasons
  const { data: seasonsRes, isLoading: loadingSeasons, isError: errSeasons, refetch: refetchSeasons } = usePublicSeasons({ limit: 100 });
  // 2. Fetch categories
  const { data: categoriesRes, isLoading: loadingCategories, isError: errCategories, refetch: refetchCategories } = usePublicCategories({ limit: 100 });

  const seasons = seasonsRes?.data ?? [];
  const categories = categoriesRes?.data ?? [];

  // Auto-select active or first
  useEffect(() => {
    if (seasonsRes?.data && seasonsRes.data.length > 0 && !selectedSeasonId) {
      const now = Date.now();
      const active = seasonsRes.data.find((season) => {
        const starts = new Date(season.startDate).getTime();
        const ends = new Date(season.endDate).getTime();
        return season.isActive || (starts <= now && now <= ends);
      });
      setSelectedSeasonId(active ? Number(active.id) : Number(seasonsRes.data[0].id));
    }
  }, [seasonsRes?.data, selectedSeasonId]);

  useEffect(() => {
    if (categoriesRes?.data && categoriesRes.data.length > 0 && !selectedCategoryId) {
      const active = categoriesRes.data.find(c => c.isActive);
      setSelectedCategoryId(active ? Number(active.id) : Number(categoriesRes.data[0].id));
    }
  }, [categoriesRes?.data, selectedCategoryId]);

  // 3. Fetch leaderboard once both IDs are ready
  const queryParams = selectedSeasonId && selectedCategoryId
    ? { seasonId: selectedSeasonId, categoryId: selectedCategoryId, limit: 100 }
    : undefined;

  const { data: leaderboardRes, isLoading: loadingLeaderboard, isError: errLeaderboard, refetch: refetchLeaderboard } = useLeaderboard(queryParams);

  const leaderboardEntries = leaderboardRes?.data ?? [];
  const filteredEntries = leaderboardEntries.filter(entry =>
    (entry.user?.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  const isAnyError = errSeasons || errCategories || errLeaderboard;
  if (isAnyError) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><ErrorState type="server" title="Reyting ma'lumotlari yuklanmadi" onRetry={() => {
      void refetchSeasons();
      void refetchCategories();
      if (queryParams) void refetchLeaderboard();
    }} /></div>;
  }

  const top3 = search ? [] : leaderboardEntries.slice(0, 3);
  const remaining = search ? filteredEntries : leaderboardEntries.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white tracking-wide uppercase flex items-center gap-2.5">
          <Trophy className="w-8 h-8 text-yellow-400" />
          Reyting Jadvali
        </h1>
        <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-1">
          F1RC.UZ • Motorsport seasonal leaderboards
        </p>
      </div>

      {/* Filters Card */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Season select */}
          <div className="space-y-1.5">
            <label htmlFor="leaderboard-season" className="block text-[10px] text-muted-foreground font-heading uppercase tracking-widest font-bold">
              Mavsum (Season)
            </label>
            {loadingSeasons ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <select
                id="leaderboard-season"
                value={selectedSeasonId ?? ''}
                onChange={e => setSelectedSeasonId(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 font-heading font-semibold tracking-wider"
              >
                {seasons.length === 0 && <option value="">Mavsum mavjud emas</option>}
                {seasons.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.isActive ? '(FAOL)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Category select */}
          <div className="space-y-1.5">
            <label htmlFor="leaderboard-category" className="block text-[10px] text-muted-foreground font-heading uppercase tracking-widest font-bold">
              Kategoriya
            </label>
            {loadingCategories ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <select
                id="leaderboard-category"
                value={selectedCategoryId ?? ''}
                onChange={e => setSelectedCategoryId(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 font-heading font-semibold tracking-wider"
              >
                {categories.length === 0 && <option value="">Kategoriya mavjud emas</option>}
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label htmlFor="leaderboard-search" className="block text-[10px] text-muted-foreground font-heading uppercase tracking-widest font-bold">
              Qidirish
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="leaderboard-search"
                type="text"
                placeholder="Poygachini qidirish..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary/50 text-white font-heading font-semibold tracking-wider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard content */}
      {loadingLeaderboard ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <EmptyState title="Reyting natijalari mavjud emas" description="Ushbu toifada hozircha poygachilar ballari mavjud emas." />
      ) : (
        <div className="space-y-10">
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {top3.map((entry, idx) => {
                const style = podiumStyles[idx] || podiumStyles[2];
                return (
                  <div
                    key={entry.id}
                    className={`bg-card border ${style.bg} rounded-3xl p-6 text-center space-y-3 shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col items-center`}
                  >
                    <span className={`text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-black/40 ${style.text}`}>
                      {style.badge}
                    </span>
                    <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center font-heading font-bold text-white text-lg relative">
                      {entry.user?.avatarUrl ? (
                        <img src={getFileUrl(entry.user.avatarUrl)} alt={entry.user.fullName} loading="lazy" decoding="async" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{entry.user?.fullName?.[0] || '?'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white text-lg tracking-wide uppercase">
                        {entry.user?.fullName || 'Ism ko‘rsatilmagan'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-border/40 text-center font-mono">
                      <div>
                        <p className="text-xs text-white font-bold">{entry.totalPoints ?? '—'}</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider">PTS</p>
                      </div>
                      <div>
                        <p className="text-xs text-white font-bold">{entry.winsCount ?? '—'}</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider">WINS</p>
                      </div>
                      <div>
                        <p className="text-xs text-white font-bold">
                          {entry.bestLapMs ? `${(entry.bestLapMs / 1000).toFixed(3)}s` : '-'}
                        </p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider">LAP</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Results Table */}
          {remaining.length > 0 && (
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                      <th className="p-5 text-center">Rank</th>
                      <th className="p-5">Racer / Jamoa</th>
                      <th className="p-5 text-center">Races</th>
                      <th className="p-5 text-center">Wins</th>
                      <th className="p-5 text-center">Podiums</th>
                      <th className="p-5 text-center">Best Lap</th>
                      <th className="p-5 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remaining.map((entry, idx) => {
                      const rank = entry.rank ?? (search ? idx + 1 : idx + 4);
                      const isCurrentUser = user && entry.user && Number(entry.user.id) === Number(user.id);
                      return (
                        <tr
                          key={entry.id}
                          className={`border-b border-border/40 text-sm font-heading font-medium tracking-wide transition-colors hover:bg-white/5 ${
                            isCurrentUser ? 'bg-primary/5 text-white border-l-4 border-l-primary' : 'text-muted-foreground'
                          }`}
                        >
                          <td className="p-5 text-center font-bold text-white font-mono">{rank}</td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-white text-xs">
                                {entry.user?.fullName?.[0] || '?'}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{entry.user?.fullName || 'Ism ko‘rsatilmagan'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-center font-mono">{entry.racesCount ?? '—'}</td>
                          <td className="p-5 text-center font-mono">{entry.winsCount ?? '—'}</td>
                          <td className="p-5 text-center font-mono">{entry.podiumsCount ?? '—'}</td>
                          <td className="p-5 text-center font-mono">
                            {entry.bestLapMs ? `${(entry.bestLapMs / 1000).toFixed(3)}s` : '-'}
                          </td>
                          <td className="p-5 text-right font-bold font-mono text-white">{entry.totalPoints ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
