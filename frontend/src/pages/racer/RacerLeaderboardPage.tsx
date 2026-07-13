import { useState } from 'react';
import { ChevronLeft, ChevronRight, Crown, Medal, Search, Star, Trophy } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';
import { usePublicCategories } from '@/hooks/api/useCategories';
import { useLeaderboard } from '@/hooks/api/useLeaderboard';
import { usePublicSeasons } from '@/hooks/api/useSeasons';
import { useAuth } from '@/lib/AuthContext';
import type { LeaderboardEntry } from '@/types';

function formatLap(milliseconds: number | null | undefined): string {
  if (milliseconds === null || milliseconds === undefined) return '—';
  const minutes = Math.floor(milliseconds / 60_000);
  const seconds = Math.floor((milliseconds % 60_000) / 1_000);
  const remainder = milliseconds % 1_000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${remainder.toString().padStart(3, '0')}`;
}

function racerName(entry: LeaderboardEntry): string {
  return entry.user?.fullName || `User #${entry.userId}`;
}

export default function RacerLeaderboardPage() {
  const { user } = useAuth();
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const seasonsQuery = usePublicSeasons({ limit: 100 });
  const categoriesQuery = usePublicCategories({ limit: 100 });
  const seasons = seasonsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const seasonId = selectedSeasonId ?? seasons.find((season) => season.isActive)?.id ?? seasons[0]?.id;
  const categoryId = selectedCategoryId ?? categories.find((category) => category.isActive)?.id ?? categories[0]?.id;
  const hasFilters = seasonId !== undefined && categoryId !== undefined;
  const leaderboardQuery = useLeaderboard(hasFilters ? {
    seasonId,
    categoryId,
    page,
    limit: 50,
    search: search.trim() || undefined,
    sortOrder: 'desc',
  } : undefined);
  const entries = leaderboardQuery.data?.data ?? [];
  const meta = leaderboardQuery.data?.meta;
  const topEntries = page === 1 ? entries.slice(0, 3) : [];
  const currentUserId = user && /^\d+$/.test(user.id) ? Number(user.id) : undefined;
  const myEntry = currentUserId === undefined ? undefined : entries.find((entry) => entry.userId === currentUserId);

  const changeSeason = (value: string) => {
    const nextId = Number(value);
    if (Number.isFinite(nextId) && nextId > 0) setSelectedSeasonId(nextId);
    setPage(1);
  };

  const changeCategory = (value: string) => {
    const nextId = Number(value);
    if (Number.isFinite(nextId) && nextId > 0) setSelectedCategoryId(nextId);
    setPage(1);
  };

  const filtersLoading = seasonsQuery.isLoading || categoriesQuery.isLoading;
  const filtersError = seasonsQuery.isError || categoriesQuery.isError;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
          <Trophy className="h-5 w-5 text-yellow-500" /> Reyting
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Mavsum va kategoriya bo‘yicha rasmiy leaderboard</p>
      </header>

      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
        <label className="space-y-1 text-xs text-muted-foreground">
          Mavsum
          <select
            value={seasonId ?? ''}
            onChange={(event) => changeSeason(event.target.value)}
            disabled={filtersLoading || seasons.length === 0}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
          >
            {seasons.length === 0 && <option value="">Mavsum yo‘q</option>}
            {seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Kategoriya
          <select
            value={categoryId ?? ''}
            onChange={(event) => changeCategory(event.target.value)}
            disabled={filtersLoading || categories.length === 0}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
          >
            {categories.length === 0 && <option value="">Kategoriya yo‘q</option>}
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Racer qidirish
          <span className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Ism yoki telefon"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </span>
        </label>
      </section>

      {filtersError ? (
        <ErrorState
          title="Leaderboard filterlari yuklanmadi"
          onRetry={() => {
            void seasonsQuery.refetch();
            void categoriesQuery.refetch();
          }}
          retrying={seasonsQuery.isFetching || categoriesQuery.isFetching}
        />
      ) : filtersLoading ? (
        <CardSkeleton />
      ) : !hasFilters ? (
        <EmptyState icon={Trophy} title="Leaderboardni ochib bo‘lmaydi" description="Avval faol mavsum va kategoriya yaratilishi kerak." />
      ) : leaderboardQuery.isLoading ? (
        <div className="rounded-xl border border-border bg-card"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div>
      ) : leaderboardQuery.isError ? (
        <ErrorState onRetry={() => { void leaderboardQuery.refetch(); }} retrying={leaderboardQuery.isFetching} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Reyting yozuvlari topilmadi"
          description="Tanlangan mavsum va kategoriya uchun backend leaderboard qaytarmadi."
          isFiltered={Boolean(search)}
        />
      ) : (
        <>
          {currentUserId !== undefined && (
            <section className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-yellow-500/40 bg-yellow-500/20">
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sizning joriy sahifadagi natijangiz</p>
                {myEntry ? (
                  <p className="font-display text-lg font-bold text-primary">#{myEntry.rank ?? '—'} · {myEntry.totalPoints.toLocaleString()} ball</p>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground">Bu sahifada yozuvingiz topilmadi</p>
                )}
              </div>
            </section>
          )}

          {topEntries.length > 0 && (
            <section className="grid gap-2 sm:grid-cols-3">
              {topEntries.map((entry, index) => {
                const rank = entry.rank ?? index + 1;
                const Icon = rank === 1 ? Crown : rank === 2 ? Medal : Star;
                const color = rank === 1 ? 'text-yellow-400 border-yellow-500/30' : rank === 2 ? 'text-slate-300 border-slate-400/20' : 'text-orange-400 border-orange-500/20';
                return (
                  <article key={entry.id} className={`rounded-xl border bg-card p-4 text-center ${color}`}>
                    <Icon className="mx-auto mb-2 h-6 w-6" />
                    <p className="font-display text-xs font-bold">#{rank}</p>
                    <h2 className="mt-1 truncate text-sm font-semibold text-foreground">{racerName(entry)}</h2>
                    <p className="mt-2 font-display text-lg font-bold">{entry.totalPoints.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.winsCount} g‘alaba · {entry.podiumsCount} podium</p>
                  </article>
                );
              })}
            </section>
          )}

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead className="border-b border-border bg-muted/20">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">O‘rin</th>
                    <th className="px-4 py-3">Racer</th>
                    <th className="px-4 py-3 text-right">Ball</th>
                    <th className="px-4 py-3 text-right">Poyga</th>
                    <th className="px-4 py-3 text-right">G‘alaba / podium</th>
                    <th className="px-4 py-3 text-right">Eng yaxshi lap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {entries.map((entry, index) => {
                    const isMe = currentUserId !== undefined && entry.userId === currentUserId;
                    return (
                      <tr key={entry.id} className={isMe ? 'bg-primary/5' : 'hover:bg-muted/20'}>
                        <td className="px-4 py-3"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-display text-xs font-bold ${isMe ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>{entry.rank ?? index + 1}</span></td>
                        <td className="px-4 py-3"><p className={`text-sm font-semibold ${isMe ? 'text-primary' : 'text-foreground'}`}>{racerName(entry)} {isMe && '(Siz)'}</p><p className="text-[10px] text-muted-foreground">User #{entry.userId}</p></td>
                        <td className="px-4 py-3 text-right font-display text-sm font-bold text-foreground">{entry.totalPoints.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">{entry.racesCount}</td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">{entry.winsCount} / {entry.podiumsCount}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{formatLap(entry.bestLapMs)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Jami {meta.total} racer · {meta.page}/{meta.totalPages} sahifa</p>
              <div className="flex gap-2">
                <button type="button" disabled={!meta.hasPrevPage} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-border p-2 text-foreground disabled:opacity-40" aria-label="Oldingi sahifa"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" disabled={!meta.hasNextPage} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-border p-2 text-foreground disabled:opacity-40" aria-label="Keyingi sahifa"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
