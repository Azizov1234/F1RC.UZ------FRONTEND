import { usePublicAchievements } from '@/hooks/api/useAchievements';
import { Trophy, Award, Search, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFileUrl } from '@/lib/getFileUrl';

export default function PublicAchievementsPage() {
  const [search, setSearch] = useState('');
  const { data: achievementsData, isLoading, isError, refetch } = usePublicAchievements({ limit: 100 });

  if (isError) {
    return <div className="max-w-7xl mx-auto px-4"><ErrorState type="server" title="Achievements yuklanmadi" onRetry={() => { void refetch(); }} /></div>;
  }

  const items = achievementsData?.data ?? [];
  const filtered = items.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-wide uppercase flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Muvaffaqiyatlar
          </h1>
          <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-1">
            F1RC.UZ • Racer achievements list
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Muvaffaqiyatni qidirish..."
            aria-label="Muvaffaqiyatni qidirish"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-h-11 w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
          />
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-5 rounded-2xl space-y-3">
              <div className="flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-1.5 flex-grow">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Muvaffaqiyatlar topilmadi" description="Qidiruv parametringiz bo'yicha hech qanday yutuq topilmadi." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(a => (
            <div
              key={a.id}
              className="bg-card border border-border hover:border-primary/30 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 group"
            >
              <div className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground group-hover:text-primary transition-colors" title={a.isUnlocked === true ? 'Unlocked' : a.isUnlocked === false ? 'Locked' : 'Public preview'}>
                {a.isUnlocked === true ? <Unlock className="w-3.5 h-3.5" /> : a.isUnlocked === false ? <Lock className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
              </div>

              <div className="flex gap-4 items-start relative">
                {/* Icon box */}
                <div className="w-14 h-14 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors overflow-hidden flex-shrink-0">
                  {a.iconUrl ? (
                    <img src={getFileUrl(a.iconUrl)} alt={a.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <Award className="w-7 h-7" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-heading font-semibold text-white tracking-wide text-base leading-snug group-hover:text-primary transition-colors">
                    {a.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono tracking-wider font-bold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {a.type}
                    </span>
                    {a.points && (
                      <span className="text-[10px] font-mono font-bold text-yellow-400">
                        +{a.points} pts
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body pt-1.5">
                    {a.description || 'Tavsif hali kiritilmagan.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
