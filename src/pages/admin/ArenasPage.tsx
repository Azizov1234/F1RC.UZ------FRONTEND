import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ChevronRight,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Power,
  Route,
  Search,
} from 'lucide-react';
import type { CreateArenaDto } from '@/api/arenas.api';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import {
  useArenas,
  useCreateArena,
  useToggleArena,
  useUpdateArena,
} from '@/hooks/api/useArenas';
import { getFileUrl } from '@/lib/getFileUrl';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import type { Arena } from '@/types';

const inputClass =
  'mt-2 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/10';

type ActiveFilter = 'all' | 'active' | 'inactive';

function isActiveFilter(value: string): value is ActiveFilter {
  return value === 'all' || value === 'active' || value === 'inactive';
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
  }
  return "Amalni bajarib bo'lmadi";
}

function arenaLocation(arena: Arena): string {
  return [arena.city, arena.address].filter(Boolean).join(' · ') || 'Manzil kiritilmagan';
}

function ArenaFormModal({ arena, onClose }: { arena?: Arena; onClose: () => void }) {
  const createArena = useCreateArena();
  const updateArena = useUpdateArena();
  const [name, setName] = useState(arena?.name ?? '');
  const [slug, setSlug] = useState(arena?.slug ?? '');
  const [city, setCity] = useState(arena?.city ?? '');
  const [address, setAddress] = useState(arena?.address ?? '');
  const [description, setDescription] = useState(arena?.description ?? '');
  const [sortOrder, setSortOrder] = useState(String(arena?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(arena?.isActive ?? true);
  const [cover, setCover] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const pending = createArena.isPending || updateArena.isPending;

  useEffect(() => {
    if (!cover) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(cover);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [cover]);

  function selectCover(file?: File): boolean {
    if (!file) return false;
    const validation = validateUploadedFile(file);
    if (!validation.isValid) {
      toast({
        title: 'Rasm qabul qilinmadi',
        description: validation.error,
        variant: 'destructive',
      });
      return false;
    }
    setCover(file);
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      toast({ title: 'Arena nomini kiriting', variant: 'destructive' });
      return;
    }

    const parsedSortOrder = Number(sortOrder);
    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      toast({ title: 'Tartib raqami musbat butun son bo‘lishi kerak', variant: 'destructive' });
      return;
    }

    const payload: CreateArenaDto = {
      name: normalizedName,
      slug: slug.trim() || undefined,
      city: city.trim() || undefined,
      address: address.trim() || undefined,
      description: description.trim() || undefined,
      sortOrder: parsedSortOrder,
      isActive,
      coverImageUrl: cover,
    };

    try {
      if (arena) {
        await updateArena.mutateAsync({ id: arena.id, data: payload });
        toast({ title: 'Arena yangilandi' });
      } else {
        await createArena.mutateAsync(payload);
        toast({ title: 'Arena yaratildi' });
      }
      onClose();
    } catch (error: unknown) {
      toast({
        title: arena ? 'Arena yangilanmadi' : 'Arena yaratilmadi',
        description: errorText(error),
        variant: 'destructive',
      });
    }
  }

  const currentCover = preview ?? (arena?.coverImageUrl ? getFileUrl(arena.coverImageUrl) : undefined);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={arena ? 'Arenani tahrirlash' : 'Yangi arena'}
      description="Arena ma'lumotlari NestJS backend'ga multipart formatda yuboriladi."
      size="xl"
    >
      <form onSubmit={submit} className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Arena nomi
          <input value={name} onChange={(event) => setName(event.target.value)} required className={inputClass} placeholder="F1RC Tashkent Arena" />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Slug
          <input value={slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} placeholder="tashkent-arena" />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Shahar
          <input value={city} onChange={(event) => setCity(event.target.value)} className={inputClass} placeholder="Toshkent" />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Manzil
          <input value={address} onChange={(event) => setAddress(event.target.value)} className={inputClass} placeholder="Ko‘cha, bino va mo‘ljal" />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Tavsif
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Arena imkoniyatlari va qisqa tavsif" />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Tartib raqami
          <input value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} type="number" min="0" step="1" className={inputClass} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Muqova rasmi
          <input
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            onChange={(event) => { if (!selectCover(event.target.files?.[0])) event.currentTarget.value = ''; }}
            className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-bold file:text-primary`}
          />
          <span className="mt-1.5 block normal-case tracking-normal text-[11px] font-normal text-muted-foreground">{IMAGE_UPLOAD_RULES_LABEL}</span>
        </label>
        {currentCover && (
          <div className="relative overflow-hidden rounded-2xl border border-border sm:col-span-2">
            <img src={currentCover} alt="Arena muqovasi preview" className="h-44 w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
        )}
        <label className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-sm font-semibold text-foreground sm:col-span-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-primary" />
          Arena faol holatda
        </label>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-muted-foreground hover:text-foreground">Bekor qilish</button>
          <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,0,0,0.24)] disabled:opacity-50">
            {pending ? 'Saqlanmoqda…' : arena ? 'O‘zgarishlarni saqlash' : 'Arena yaratish'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ArenasPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Arena>();
  const toggleArena = useToggleArena();
  const query = useArenas({
    page: 1,
    limit: 100,
    search: search.trim() || undefined,
    isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });
  const arenas = useMemo(() => query.data ?? [], [query.data]);

  const summary = useMemo(() => {
    const cities = new Set(arenas.map((arena) => arena.city?.trim()).filter(Boolean));
    return {
      total: arenas.length,
      active: arenas.filter((arena) => arena.isActive).length,
      cities: cities.size,
    };
  }, [arenas]);

  async function toggle(arena: Arena) {
    try {
      await toggleArena.mutateAsync({ id: arena.id, active: !arena.isActive });
      toast({ title: arena.isActive ? 'Arena nofaol qilindi' : 'Arena faollashtirildi' });
    } catch (error: unknown) {
      toast({ title: 'Arena statusi yangilanmadi', description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 shadow-2xl sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Building2 className="h-3.5 w-3.5" /> Venue control
            </div>
            <h1 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">Arenalar</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Arena ma’lumotlarini boshqaring, so‘ng har bir arenaning trassa layoutlari va zonalarini detail sahifasida sozlang.</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_0_24px_rgba(255,0,0,0.3)] hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Yangi arena
          </button>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Ko‘rsatilmoqda', value: summary.total, icon: Building2 },
            { label: 'Faol arenalar', value: summary.active, icon: Power },
            { label: 'Shaharlar', value: summary.cities, icon: MapPin },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/45 p-4 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div>
              <div><p className="text-2xl font-black text-foreground">{item.value}</p><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p></div>
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative">
          <span className="sr-only">Arena qidirish</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nomi, shahri yoki manzili bo‘yicha…" className={`${inputClass} mt-0 pl-9`} />
        </label>
        <label>
          <span className="sr-only">Status filtri</span>
          <select
            value={activeFilter}
            onChange={(event) => {
              const value = event.target.value;
              if (isActiveFilter(value)) setActiveFilter(value);
            }}
            className={`${inputClass} mt-0`}
          >
            <option value="all">Barcha statuslar</option>
            <option value="active">Faqat faol</option>
            <option value="inactive">Faqat nofaol</option>
          </select>
        </label>
      </section>

      {query.isError ? (
        <section className="rounded-2xl border border-border bg-card/70"><ErrorState onRetry={() => query.refetch()} retrying={query.isFetching} /></section>
      ) : query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <CardSkeleton key={index} />)}</div>
      ) : arenas.length === 0 ? (
        <section className="rounded-2xl border border-border bg-card/70">
          <EmptyState
            icon={Building2}
            isFiltered={Boolean(search || activeFilter !== 'all')}
            title={search || activeFilter !== 'all' ? 'Mos arena topilmadi' : 'Arenalar hali yo‘q'}
            action={!search && activeFilter === 'all' ? <button onClick={() => setCreateOpen(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Birinchi arenani yarating</button> : undefined}
          />
        </section>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {arenas.map((arena) => (
            <article key={arena.id} className="group overflow-hidden rounded-3xl border border-border bg-card/70 shadow-lg transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-2xl">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/15 via-muted/30 to-background">
                {arena.coverImageUrl ? (
                  <img src={getFileUrl(arena.coverImageUrl)} alt={arena.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center"><ImageIcon className="h-14 w-14 text-primary/30" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur ${arena.isActive ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300' : 'border-white/15 bg-black/40 text-zinc-300'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${arena.isActive ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                    {arena.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">Arena #{arena.id}</p>
                  <h2 className="mt-1 truncate font-heading text-xl font-black text-white">{arena.name}</h2>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span className="line-clamp-2">{arenaLocation(arena)}</span>
                </div>
                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{arena.description || 'Arena tavsifi kiritilmagan.'}</p>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="rounded-lg border border-border bg-background/60 px-2.5 py-1.5">{arena.slug || 'slug yo‘q'}</span>
                  <span className="rounded-lg border border-border bg-background/60 px-2.5 py-1.5">Tartib {arena.sortOrder}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                  <button onClick={() => setEditing(arena)} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"><Pencil className="h-4 w-4" /> Tahrirlash</button>
                  <button onClick={() => toggle(arena)} disabled={toggleArena.isPending} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"><Power className="h-4 w-4" /> {arena.isActive ? 'Nofaol' : 'Faollashtir'}</button>
                  <Link to={`/admin/arenas/${arena.id}`} className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary/10 text-xs font-bold text-primary transition hover:bg-primary hover:text-white">
                    <Route className="h-4 w-4" /> Layout va zonalar <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {createOpen && <ArenaFormModal onClose={() => setCreateOpen(false)} />}
      {editing && <ArenaFormModal key={editing.id} arena={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}
