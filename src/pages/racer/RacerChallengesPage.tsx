import { useState } from 'react';
import { Award, CheckCircle2, Lock, Sparkles, Trophy } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useMyAchievements, usePublicAchievements } from '@/hooks/api/useAchievements';
import { getFileUrl } from '@/lib/getFileUrl';
import type { Achievement } from '@/types';

type ViewTab = 'mine' | 'all';

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Sana ko‘rsatilmagan';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' }).format(date);
}

function formatCriterion(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

function criteriaText(achievement: Achievement): string {
  if (!achievement.criteria || Object.keys(achievement.criteria).length === 0) {
    return 'Bajarish mezonlari backendda ko‘rsatilmagan.';
  }
  return Object.entries(achievement.criteria)
    .map(([key, value]) => `${key}: ${formatCriterion(value)}`)
    .join(' · ');
}

export default function RacerChallengesPage() {
  const [tab, setTab] = useState<ViewTab>('mine');
  const publicQuery = usePublicAchievements({ limit: 100, isActive: true, sortBy: 'points', sortOrder: 'desc' });
  const mineQuery = useMyAchievements({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  const mine = mineQuery.data?.data ?? [];
  const available = publicQuery.data?.data ?? [];
  const unlockedIds = new Set(mine.map((achievement) => achievement.id));
  const achievements = tab === 'mine' ? mine : available;
  const activeQuery = tab === 'mine' ? mineQuery : publicQuery;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
          <Trophy className="h-5 w-5 text-yellow-400" /> Yutuqlar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Backenddagi achievement shartlari va sizga berilgan mukofotlar
        </p>
      </header>

      <div className="flex gap-2 rounded-xl border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === 'mine' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Mening yutuqlarim {mineQuery.data?.meta ? `(${mineQuery.data.meta.total})` : ''}
        </button>
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Barcha yutuqlar {publicQuery.data?.meta ? `(${publicQuery.data.meta.total})` : ''}
        </button>
      </div>

      {activeQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : activeQuery.isError ? (
        <ErrorState onRetry={() => { void activeQuery.refetch(); }} retrying={activeQuery.isFetching} />
      ) : achievements.length === 0 ? (
        <EmptyState
          icon={Award}
          title={tab === 'mine' ? 'Hali yutuq berilmagan' : 'Faol yutuqlar yo‘q'}
          description={tab === 'mine' ? 'Yutuq berilganda u shu yerda paydo bo‘ladi.' : 'Backend hozircha faol achievement qaytarmadi.'}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {achievements.map((achievement) => {
            const earned = tab === 'mine' || Boolean(achievement.isUnlocked) || unlockedIds.has(achievement.id);
            const awardedAt = achievement.awardedAt || achievement.unlockedAt;
            return (
              <article
                key={achievement.id}
                className={`rounded-xl border bg-card p-5 transition-colors ${earned ? 'border-emerald-500/25' : 'border-border hover:border-primary/30'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${earned ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-border bg-muted/40'}`}>
                    {achievement.iconUrl ? (
                      <img src={getFileUrl(achievement.iconUrl)} alt="" className="h-full w-full object-cover" />
                    ) : earned ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{achievement.type}</p>
                        <h2 className="mt-1 font-heading font-bold text-foreground">{achievement.name}</h2>
                      </div>
                      <span className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-bold text-yellow-400">
                        <Sparkles className="h-3 w-3" /> {achievement.points} ball
                      </span>
                    </div>
                    {achievement.description && <p className="mt-2 text-sm leading-5 text-muted-foreground">{achievement.description}</p>}
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mezonlar</p>
                  <p className="mt-1 break-words text-xs leading-5 text-foreground">{criteriaText(achievement)}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className={earned ? 'font-semibold text-emerald-400' : 'text-muted-foreground'}>
                    {earned ? 'Qo‘lga kiritilgan' : 'Hali ochilmagan'}
                  </span>
                  {earned && <time className="text-muted-foreground">{formatDate(awardedAt)}</time>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
