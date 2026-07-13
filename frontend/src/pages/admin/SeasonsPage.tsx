import { type FormEvent, useState } from 'react';
import { CalendarDays, Eye, Pencil, Plus, Power, Search, Zap } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import TablePagination from '@/components/admin/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import {
  useAdminSeason,
  useAdminSeasons,
  useCreateSeason,
  useToggleSeason,
  useUpdateSeason,
} from '@/hooks/api/useSeasons';
import type { CreateSeasonDto } from '@/api/seasons.api';
import type { Season } from '@/types';

const inputClass =
  'w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10';

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
  }
  return 'Amalni bajarib bo\'lmadi';
}

function displayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' }).format(date);
}

function dateInput(value?: string): string {
  return value ? value.slice(0, 10) : '';
}

function seasonProgress(season: Season): number {
  const start = new Date(season.startDate).getTime();
  const end = new Date(season.endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.max(0, Math.min(100, ((Date.now() - start) / (end - start)) * 100));
}

function SeasonFormModal({ season, onClose }: { season?: Season; onClose: () => void }) {
  const createSeason = useCreateSeason();
  const updateSeason = useUpdateSeason();
  const pending = createSeason.isPending || updateSeason.isPending;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: CreateSeasonDto = {
      name: String(form.get('name') ?? '').trim(),
      slug: String(form.get('slug') ?? '').trim() || undefined,
      description: String(form.get('description') ?? '').trim() || undefined,
      startDate: String(form.get('startDate')),
      endDate: String(form.get('endDate')),
      isActive: form.get('isActive') === 'on',
    };

    try {
      if (season) {
        await updateSeason.mutateAsync({ id: season.id, data: payload });
        toast({ title: 'Season yangilandi' });
      } else {
        await createSeason.mutateAsync(payload);
        toast({ title: 'Season yaratildi' });
      }
      onClose();
    } catch (error: unknown) {
      toast({
        title: season ? 'Season yangilanmadi' : 'Season yaratilmadi',
        description: errorText(error),
        variant: 'destructive',
      });
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={season ? 'Seasonni tahrirlash' : 'Yangi season'}
      description="Backend season ma'lumotlarini kiriting."
      size="lg"
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Nomi
          <input name="name" defaultValue={season?.name} required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Slug
          <input name="slug" defaultValue={season?.slug ?? ''} className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Boshlanish sanasi
          <input name="startDate" type="date" defaultValue={dateInput(season?.startDate)} required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Tugash sanasi
          <input name="endDate" type="date" defaultValue={dateInput(season?.endDate)} required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Tavsif
          <textarea name="description" defaultValue={season?.description ?? ''} rows={4} className={`${inputClass} mt-2 resize-none`} />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-foreground sm:col-span-2">
          <input name="isActive" type="checkbox" defaultChecked={season?.isActive ?? true} className="h-4 w-4 accent-primary" />
          Aktiv season
        </label>
        <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border px-4 text-sm text-muted-foreground hover:text-foreground">Bekor</button>
          <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50">
            {pending ? 'Saqlanmoqda…' : 'Saqlash'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SeasonDetail({
  id,
  onEdit,
}: {
  id: number | string;
  onEdit: (season: Season) => void;
}) {
  const query = useAdminSeason(id);
  const toggle = useToggleSeason();
  const season = query.data;

  async function toggleActive() {
    if (!season) return;
    try {
      await toggle.mutateAsync({ id: season.id, isActive: !season.isActive });
      toast({ title: season.isActive ? 'Season o\'chirildi' : 'Season faollashtirildi' });
    } catch (error: unknown) {
      toast({ title: 'Status yangilanmadi', description: errorText(error), variant: 'destructive' });
    }
  }

  if (query.isLoading) {
    return <div className="rounded-2xl border border-border bg-card/70 p-5"><CardSkeleton /></div>;
  }
  if (query.isError || !season) {
    return <div className="rounded-2xl border border-border bg-card/70"><ErrorState onRetry={() => query.refetch()} /></div>;
  }

  const progress = seasonProgress(season);
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-xl">
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Season #{season.id}</p>
            <h2 className="mt-1 text-xl font-bold text-foreground font-heading">{season.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{season.description || 'Tavsif kiritilmagan.'}</p>
          </div>
          <StatusBadge status={season.isActive ? 'ACTIVE' : 'INACTIVE'} />
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Boshlanishi</p>
            <p className="mt-1 font-semibold text-foreground">{displayDate(season.startDate)}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tugashi</p>
            <p className="mt-1 font-semibold text-foreground">{displayDate(season.endDate)}</p>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Season vaqt oralig'i</span><span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={() => onEdit(season)} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white"><Pencil className="h-4 w-4" /> Tahrirlash</button>
          <button onClick={toggleActive} disabled={toggle.isPending} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"><Power className="h-4 w-4" /> {season.isActive ? "O'chirish" : 'Faollashtirish'}</button>
        </div>
      </div>
    </section>
  );
}

export default function SeasonsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedId, setSelectedId] = useState<number | string>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Season>();
  const toggle = useToggleSeason();
  const query = useAdminSeasons({
    page,
    limit: 12,
    search: search || undefined,
    isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
    sortBy: 'startDate',
    sortOrder: 'desc',
  });
  const seasons = query.data?.data ?? [];
  const meta = query.data?.meta;

  async function toggleFromList(season: Season) {
    try {
      await toggle.mutateAsync({ id: season.id, isActive: !season.isActive });
      toast({ title: season.isActive ? 'Season o\'chirildi' : 'Season faollashtirildi' });
    } catch (error: unknown) {
      toast({ title: 'Status yangilanmadi', description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground font-heading"><Zap className="h-6 w-6 text-primary" /> Seasons</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta?.total ?? 0} ta real season</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90"><Plus className="h-4 w-4" /> Yangi season</button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Season qidirish…" className={`${inputClass} pl-9`} />
        </div>
        <select value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value as 'all' | 'active' | 'inactive'); setPage(1); }} className={`${inputClass} sm:w-52`}>
          <option value="all">Barchasi</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Aktiv emas</option>
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
        <div className="space-y-3">
          {query.isError ? (
            <div className="rounded-2xl border border-border bg-card/70"><ErrorState onRetry={() => query.refetch()} retrying={query.isFetching} /></div>
          ) : !query.isLoading && seasons.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/70"><EmptyState icon={CalendarDays} isFiltered={Boolean(search || activeFilter !== 'all')} action={<button onClick={() => setCreateOpen(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Season yaratish</button>} /></div>
          ) : query.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)
          ) : (
            seasons.map((season) => (
              <article key={season.id} className={`rounded-2xl border bg-card/70 p-4 transition ${selectedId === season.id ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => setSelectedId(season.id)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2"><StatusBadge status={season.isActive ? 'ACTIVE' : 'INACTIVE'} /><span className="text-[10px] text-muted-foreground">#{season.id}</span></div>
                    <h2 className="mt-2 truncate text-sm font-bold text-foreground font-heading">{season.name}</h2>
                    <p className="mt-2 text-xs text-muted-foreground">{displayDate(season.startDate)} → {displayDate(season.endDate)}</p>
                  </button>
                  <button type="button" onClick={() => toggleFromList(season)} disabled={toggle.isPending} aria-label={season.isActive ? "Seasonni o'chirish" : 'Seasonni faollashtirish'} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"><Power className="h-4 w-4" /></button>
                </div>
                <button type="button" onClick={() => setSelectedId(season.id)} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /> Detail</button>
              </article>
            ))
          )}
          {meta && <TablePagination total={meta.total} page={meta.page} limit={meta.limit} totalPages={meta.totalPages} onPageChange={setPage} isLoading={query.isFetching} showingCount={seasons.length} />}
        </div>
        {selectedId !== undefined ? (
          <SeasonDetail id={selectedId} onEdit={setEditing} />
        ) : (
          <div className="rounded-2xl border border-border bg-card/70"><EmptyState icon={Eye} title="Seasonni tanlang" description="To'liq backend ma'lumotini ko'rish uchun chapdagi seasonlardan birini oching." /></div>
        )}
      </div>

      {createOpen && <SeasonFormModal onClose={() => setCreateOpen(false)} />}
      {editing && <SeasonFormModal key={editing.id} season={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}
