import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Crown, Medal, Pencil, Plus, Search, Trophy } from 'lucide-react';
import { seasonsApi } from '@/api/seasons.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import { usePublicCategories } from '@/hooks/api/useCategories';
import {
  useAdminLeaderboard,
  useAdminLeaderboardEntry,
  useCreateLeaderboardEntry,
  useLeaderboard,
  useUpdateLeaderboardEntry,
} from '@/hooks/api/useLeaderboard';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import type { LeaderboardEntry } from '@/types';
import { useAuth } from '@/lib/AuthContext';

type View = 'public' | 'admin';
const inputClass = 'h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary';

function racerName(entry: LeaderboardEntry) {
  return entry.user?.fullName || `User #${entry.userId}`;
}

function formatLap(value?: number | null) {
  if (value === undefined || value === null) return '—';
  const minutes = Math.floor(value / 60_000);
  const seconds = Math.floor((value % 60_000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(value % 1000).padStart(3, '0')}`;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo‘lmadi.';
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [view, setView] = useState<View>('public');
  const [seasonId, setSeasonId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<LeaderboardEntry>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>();

  const seasonsQuery = useQuery({
    queryKey: queryKeys.seasons.list({ limit: 100, scope: isAdmin ? 'admin' : 'public' }),
    queryFn: () => isAdmin
      ? seasonsApi.getAdminSeasons({ limit: 100 })
      : seasonsApi.getPublicSeasons({ limit: 100 }),
    staleTime: 60_000,
  });
  const categoriesQuery = usePublicCategories({ limit: 100 });
  const seasons = useMemo(() => seasonsQuery.data?.data ?? [], [seasonsQuery.data?.data]);
  const categories = useMemo(() => categoriesQuery.data?.data ?? [], [categoriesQuery.data?.data]);

  useEffect(() => {
    if (!seasonId && seasons.length) setSeasonId(String(seasons.find(item => item.isActive)?.id ?? seasons[0].id));
  }, [seasonId, seasons]);
  useEffect(() => {
    if (!categoryId && categories.length) setCategoryId(String(categories.find(item => item.isActive)?.id ?? categories[0].id));
  }, [categoryId, categories]);

  const publicParams = seasonId && categoryId ? { seasonId: Number(seasonId), categoryId: Number(categoryId), page: 1, limit: 100 } : undefined;
  const publicQuery = useLeaderboard(publicParams);
  const adminQuery = useAdminLeaderboard({
    seasonId: seasonId ? Number(seasonId) : undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    search: search || undefined,
    page: 1,
    limit: 100,
    sortBy: 'totalPoints',
    sortOrder: 'desc',
  }, isAdmin && view === 'admin');
  const detailQuery = useAdminLeaderboardEntry(selectedId);
  const entries = view === 'public' ? (publicQuery.data?.data ?? []) : (adminQuery.data?.data ?? []);
  const activeQuery = view === 'public' ? publicQuery : adminQuery;

  return (
    <div className="space-y-5">
      <PageHeader title="Leaderboard" subtitle="Mavsum va kategoriya kesimidagi real reyting" icon={Trophy} actions={view === 'admin' ? <Button onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus /> Entry qo‘shish</Button> : undefined} />

      {isAdmin && <div className="flex gap-2 rounded-2xl border border-border bg-card/70 p-2">
        <button type="button" onClick={() => setView('public')} className={`h-11 flex-1 rounded-xl text-sm font-heading font-semibold transition ${view === 'public' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>Public reyting</button>
        <button type="button" onClick={() => setView('admin')} className={`h-11 flex-1 rounded-xl text-sm font-heading font-semibold transition ${view === 'admin' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>Admin boshqaruvi</button>
      </div>}

      <section className="grid gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr]">
        <label className="text-xs text-muted-foreground">Mavsum
          <select value={seasonId} onChange={event => setSeasonId(event.target.value)} className={`mt-1 w-full ${inputClass}`}><option value="">Mavsum tanlang</option>{seasons.map(season => <option key={season.id} value={season.id}>{season.name}{season.isActive ? ' · active' : ''}</option>)}</select>
        </label>
        <label className="text-xs text-muted-foreground">Kategoriya
          <select value={categoryId} onChange={event => setCategoryId(event.target.value)} className={`mt-1 w-full ${inputClass}`}><option value="">Kategoriya tanlang</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}{category.isActive ? ' · active' : ''}</option>)}</select>
        </label>
        {view === 'admin' ? <label className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-1">Qidirish<div className="relative mt-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Racer qidirish" className={`w-full pl-10 ${inputClass}`} /></div></label> : <div className="flex items-end"><p className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300">Public endpoint faqat ikkala majburiy filter tanlangandan keyin yuboriladi.</p></div>}
      </section>

      {view === 'public' && (!seasonId || !categoryId) ? (
        <EmptyState icon={Trophy} title="Filterlarni tanlang" description="Leaderboard so‘rovi uchun seasonId va categoryId majburiy." />
      ) : activeQuery.isError ? (
        <ErrorState onRetry={() => activeQuery.refetch()} retrying={activeQuery.isRefetching} />
      ) : activeQuery.isLoading ? (
        <div className="space-y-3"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div>
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="Reyting natijalari yo‘q" />
      ) : (
        <>
          {view === 'public' && <Podium entries={entries.slice(0, 3)} />}
          <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
            <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Racer</th><th className="px-4 py-3">Ball</th><th className="px-4 py-3">Poyga</th><th className="px-4 py-3">G‘alaba</th><th className="px-4 py-3">Podium</th><th className="px-4 py-3">Best lap</th>{view === 'admin' && <th className="px-4 py-3 text-right">Amal</th>}</tr></thead><tbody className="divide-y divide-border/70">{entries.map((entry, index) => <tr key={entry.id} className={selectedId === entry.id ? 'bg-primary/5' : ''}><td className="px-4 py-3 font-display font-bold text-primary">{entry.rank ?? index + 1}</td><td className="px-4 py-3"><button type="button" onClick={() => view === 'admin' && setSelectedId(entry.id)} className="font-heading text-sm font-semibold text-foreground hover:text-primary">{racerName(entry)}</button></td><td className="px-4 py-3 font-display font-bold text-foreground">{entry.totalPoints ?? 0}</td><td className="px-4 py-3 text-sm text-muted-foreground">{entry.racesCount ?? 0}</td><td className="px-4 py-3 text-sm text-muted-foreground">{entry.winsCount ?? 0}</td><td className="px-4 py-3 text-sm text-muted-foreground">{entry.podiumsCount ?? 0}</td><td className="px-4 py-3 font-mono text-xs text-green-400">{formatLap(entry.bestLapMs)}</td>{view === 'admin' && <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => { setEditing(entry); setEditorOpen(true); }}><Pencil /> Tahrirlash</Button></td>}</tr>)}</tbody></table></div>
          </div>
          {selectedId && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-primary">Admin entry detail</p><p className="mt-1 font-semibold text-foreground">{detailQuery.isLoading ? 'Yuklanmoqda…' : racerName(detailQuery.data ?? entries[0])}</p></div><button type="button" onClick={() => setSelectedId(undefined)} className="text-xs text-muted-foreground">Yopish</button></div></div>}
        </>
      )}

      {editorOpen && <EntryEditor record={editing} defaultSeasonId={seasonId} defaultCategoryId={categoryId} onClose={() => setEditorOpen(false)} />}
    </div>
  );
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const ordered = entries.length >= 3 ? [entries[1], entries[0], entries[2]] : entries;
  return <div className="grid gap-3 sm:grid-cols-3">{ordered.map(entry => { const rank = entry.rank ?? entries.indexOf(entry) + 1; return <div key={entry.id} className={`relative overflow-hidden rounded-2xl border bg-card/70 p-5 text-center ${rank === 1 ? 'border-yellow-500/30 sm:-translate-y-2' : 'border-border'}`}>{rank === 1 && <Crown className="mx-auto mb-2 h-7 w-7 text-yellow-400" />}{rank !== 1 && <Medal className={`mx-auto mb-2 h-6 w-6 ${rank === 2 ? 'text-zinc-300' : 'text-orange-400'}`} />}<p className="font-heading font-bold text-foreground">{racerName(entry)}</p><p className="mt-2 font-display text-2xl font-bold text-primary">{entry.totalPoints ?? 0}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">#{rank}</p></div>; })}</div>;
}

function EntryEditor({ record, defaultSeasonId, defaultCategoryId, onClose }: { record?: LeaderboardEntry; defaultSeasonId: string; defaultCategoryId: string; onClose: () => void }) {
  const [userId, setUserId] = useState(record ? String(record.userId) : '');
  const [seasonId, setSeasonId] = useState(record ? String(record.seasonId) : defaultSeasonId);
  const [categoryId, setCategoryId] = useState(record ? String(record.categoryId) : defaultCategoryId);
  const [totalPoints, setTotalPoints] = useState(String(record?.totalPoints ?? 0));
  const [racesCount, setRacesCount] = useState(String(record?.racesCount ?? 0));
  const [winsCount, setWinsCount] = useState(String(record?.winsCount ?? 0));
  const [podiumsCount, setPodiumsCount] = useState(String(record?.podiumsCount ?? 0));
  const [bestLapMs, setBestLapMs] = useState(record?.bestLapMs ? String(record.bestLapMs) : '');
  const create = useCreateLeaderboardEntry();
  const update = useUpdateLeaderboardEntry();
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const stats = { totalPoints: Number(totalPoints), racesCount: Number(racesCount), winsCount: Number(winsCount), podiumsCount: Number(podiumsCount), bestLapMs: bestLapMs ? Number(bestLapMs) : undefined }; const options = { onSuccess: onClose, onError: (error: unknown) => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' as const }) }; if (record) update.mutate({ id: record.id, data: stats }, options); else create.mutate({ userId: Number(userId), seasonId: Number(seasonId), categoryId: Number(categoryId), ...stats }, options); };
  return <Modal isOpen onClose={onClose} title={record ? 'Leaderboard entry tahrirlash' : 'Leaderboard entry yaratish'} size="lg"><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{!record && <><label className="text-xs text-muted-foreground">User ID<input required type="number" min="1" value={userId} onChange={event => setUserId(event.target.value)} className={`mt-1 w-full ${inputClass}`} /></label><label className="text-xs text-muted-foreground">Season ID<input required type="number" min="1" value={seasonId} onChange={event => setSeasonId(event.target.value)} className={`mt-1 w-full ${inputClass}`} /></label><label className="text-xs text-muted-foreground">Category ID<input required type="number" min="1" value={categoryId} onChange={event => setCategoryId(event.target.value)} className={`mt-1 w-full ${inputClass}`} /></label></>}<NumberField label="Jami ball" value={totalPoints} setValue={setTotalPoints} /><NumberField label="Poygalar" value={racesCount} setValue={setRacesCount} /><NumberField label="G‘alabalar" value={winsCount} setValue={setWinsCount} /><NumberField label="Podiumlar" value={podiumsCount} setValue={setPodiumsCount} /><NumberField label="Best lap (ms)" value={bestLapMs} setValue={setBestLapMs} /><div className="col-span-full flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={create.isPending || update.isPending}>Saqlash</Button></div></form></Modal>;
}

function NumberField({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void }) {
  return <label className="text-xs text-muted-foreground">{label}<input type="number" min="0" value={value} onChange={event => setValue(event.target.value)} className={`mt-1 w-full ${inputClass}`} /></label>;
}
