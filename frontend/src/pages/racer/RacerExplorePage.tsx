import { useState, type ReactNode } from 'react';
import {
  CalendarRange,
  Car,
  Flag,
  Gauge,
  Layers3,
  MapPin,
  Search,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { usePublicArena, usePublicArenas } from '@/hooks/api/useArenas';
import { usePublicCategories, usePublicCategory } from '@/hooks/api/useCategories';
import { usePublicSeason, usePublicSeasons } from '@/hooks/api/useSeasons';
import { usePublicTrackLayout, usePublicTrackLayouts } from '@/hooks/api/useTrackLayouts';
import { usePublicVehicle, usePublicVehicles } from '@/hooks/api/useVehicles';
import { getFileUrl } from '@/lib/getFileUrl';

type ExploreTab = 'arenas' | 'tracks' | 'vehicles' | 'categories' | 'seasons';

const tabs: Array<{ id: ExploreTab; label: string; icon: LucideIcon }> = [
  { id: 'arenas', label: 'Arenalar', icon: MapPin },
  { id: 'tracks', label: 'Tracklar', icon: Layers3 },
  { id: 'vehicles', label: 'Mashinalar', icon: Car },
  { id: 'categories', label: 'Kategoriyalar', icon: Tag },
  { id: 'seasons', label: 'Mavsumlar', icon: CalendarRange },
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' }).format(date);
}

function CollectionState({
  loading,
  error,
  empty,
  filtered,
  onRetry,
  icon,
  children,
}: {
  loading: boolean;
  error: boolean;
  empty: boolean;
  filtered: boolean;
  onRetry: () => void;
  icon: LucideIcon;
  children: ReactNode;
}) {
  if (loading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (empty) return <EmptyState icon={icon} isFiltered={filtered} title={filtered ? 'Qidiruv natijasi topilmadi' : 'Ma’lumot mavjud emas'} />;
  return children;
}

function ResourceCard({
  imageUrl,
  title,
  subtitle,
  facts,
  icon: Icon,
  onOpen,
}: {
  imageUrl?: string | null;
  title: string;
  subtitle: string;
  facts: string[];
  icon: LucideIcon;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-2xl border border-border bg-card/70 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl"
    >
      <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-muted/20">
        {imageUrl ? <img src={getFileUrl(imageUrl)} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <Icon className="h-12 w-12 text-primary/50" />}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{subtitle}</p>
        <h2 className="mt-1 font-heading text-base font-bold text-foreground">{title}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {facts.map((fact) => <span key={fact} className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] text-muted-foreground">{fact}</span>)}
        </div>
        <p className="mt-4 text-xs font-semibold text-primary">Tafsilotni ko‘rish →</p>
      </div>
    </button>
  );
}

function DetailView({
  imageUrl,
  title,
  description,
  active,
  icon: Icon,
  facts,
}: {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  active: boolean;
  icon: LucideIcon;
  facts: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
        {imageUrl ? <img src={getFileUrl(imageUrl)} alt={title} className="h-56 w-full object-cover" /> : <div className="flex h-44 items-center justify-center"><Icon className="h-14 w-14 text-primary/50" /></div>}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="font-heading text-xl font-bold text-foreground">{title}</h3>{description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}</div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${active ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-zinc-500/25 bg-zinc-500/10 text-zinc-400'}`}>{active ? 'FAOL' : 'NOFAOL'}</span>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => <div key={fact.label} className="rounded-xl border border-border bg-background/50 p-3"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{fact.label}</dt><dd className="mt-1 break-words text-sm font-semibold text-foreground">{fact.value}</dd></div>)}
      </dl>
    </div>
  );
}

function DetailLoading() {
  return <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>;
}

export default function RacerExplorePage() {
  const [tab, setTab] = useState<ExploreTab>('arenas');
  const [search, setSearch] = useState('');
  const [arenaId, setArenaId] = useState<number>();
  const [trackId, setTrackId] = useState<number>();
  const [vehicleId, setVehicleId] = useState<number>();
  const [categoryId, setCategoryId] = useState<number>();
  const [seasonId, setSeasonId] = useState<number>();

  const arenasQuery = usePublicArenas({ limit: 100 });
  const tracksQuery = usePublicTrackLayouts({ limit: 100 });
  const vehiclesQuery = usePublicVehicles({ limit: 100 });
  const categoriesQuery = usePublicCategories({ limit: 100 });
  const seasonsQuery = usePublicSeasons({ limit: 100 });

  const arenaDetail = usePublicArena(arenaId);
  const trackDetail = usePublicTrackLayout(trackId);
  const vehicleDetail = usePublicVehicle(vehicleId);
  const categoryDetail = usePublicCategory(categoryId);
  const seasonDetail = usePublicSeason(seasonId);

  const query = search.trim().toLocaleLowerCase('uz-UZ');
  const arenas = (arenasQuery.data?.data ?? []).filter((item) => !query || [item.name, item.city, item.address].some((value) => value?.toLocaleLowerCase('uz-UZ').includes(query)));
  const tracks = (tracksQuery.data?.data ?? []).filter((item) => !query || [item.name, item.arena?.name, item.category?.name].some((value) => value?.toLocaleLowerCase('uz-UZ').includes(query)));
  const vehicles = (vehiclesQuery.data?.data ?? []).filter((item) => !query || [item.name, item.category?.name, item.controlType].some((value) => value?.toLocaleLowerCase('uz-UZ').includes(query)));
  const categories = (categoriesQuery.data?.data ?? []).filter((item) => !query || item.name.toLocaleLowerCase('uz-UZ').includes(query));
  const seasons = (seasonsQuery.data?.data ?? []).filter((item) => !query || item.name.toLocaleLowerCase('uz-UZ').includes(query));

  const changeTab = (next: ExploreTab) => {
    setTab(next);
    setSearch('');
    setArenaId(undefined);
    setTrackId(undefined);
    setVehicleId(undefined);
    setCategoryId(undefined);
    setSeasonId(undefined);
  };

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">F1RC Explore</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-foreground">Poyga olamini o‘rganing</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Arenalar, trek konfiguratsiyalari, RC mashinalar, kategoriyalar va mavsumlarning backenddagi joriy ma’lumotlari.</p>
        </div>
      </header>

      <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card/60 p-2 sm:grid-cols-5" aria-label="Explore bo‘limlari">
        {tabs.map((item) => <button key={item.id} type="button" onClick={() => changeTab(item.id)} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${tab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/15' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}><item.icon className="h-4 w-4" /> {item.label}</button>)}
      </nav>

      <label className="relative block">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Joriy bo‘limdan qidirish..." className="h-12 w-full rounded-2xl border border-border bg-card/60 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary" />
      </label>

      {tab === 'arenas' && <CollectionState loading={arenasQuery.isLoading} error={arenasQuery.isError} empty={arenas.length === 0} filtered={Boolean(query)} onRetry={() => { void arenasQuery.refetch(); }} icon={MapPin}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{arenas.map((arena) => <ResourceCard key={arena.id} imageUrl={arena.coverImageUrl} title={arena.name} subtitle={`Arena #${arena.id}`} facts={[arena.city || 'Shahar ko‘rsatilmagan', arena.trackLayouts ? `${arena.trackLayouts.length} track` : 'Track soni berilmagan']} icon={MapPin} onOpen={() => setArenaId(arena.id)} />)}</div></CollectionState>}

      {tab === 'tracks' && <CollectionState loading={tracksQuery.isLoading} error={tracksQuery.isError} empty={tracks.length === 0} filtered={Boolean(query)} onRetry={() => { void tracksQuery.refetch(); }} icon={Layers3}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tracks.map((track) => <ResourceCard key={track.id} imageUrl={track.imageUrl} title={track.name} subtitle={`Track #${track.id}`} facts={[track.arena?.name || `Arena #${track.arenaId}`, track.lengthMeters ? `${track.lengthMeters} m` : 'Uzunlik ko‘rsatilmagan', track.difficulty || 'Daraja yo‘q']} icon={Layers3} onOpen={() => setTrackId(track.id)} />)}</div></CollectionState>}

      {tab === 'vehicles' && <CollectionState loading={vehiclesQuery.isLoading} error={vehiclesQuery.isError} empty={vehicles.length === 0} filtered={Boolean(query)} onRetry={() => { void vehiclesQuery.refetch(); }} icon={Car}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{vehicles.map((vehicle) => <ResourceCard key={vehicle.id} imageUrl={vehicle.imageUrl} title={vehicle.name} subtitle={vehicle.status} facts={[vehicle.category?.name || `Kategoriya #${vehicle.categoryId}`, vehicle.topSpeedKmh ? `${vehicle.topSpeedKmh} km/h` : 'Tezlik yo‘q', vehicle.difficulty || 'Daraja yo‘q']} icon={Car} onOpen={() => setVehicleId(vehicle.id)} />)}</div></CollectionState>}

      {tab === 'categories' && <CollectionState loading={categoriesQuery.isLoading} error={categoriesQuery.isError} empty={categories.length === 0} filtered={Boolean(query)} onRetry={() => { void categoriesQuery.refetch(); }} icon={Tag}><section className="rounded-2xl border border-border bg-card/70 p-5"><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kategoriya tafsiloti<select value={categoryId ?? ''} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"><option value="">Kategoriyani tanlang</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>{categoryId === undefined ? <EmptyState size="sm" icon={Tag} title="Kategoriyani tanlang" description="Detail endpoint faqat tanlovdan keyin chaqiriladi." /> : categoryDetail.isLoading ? <DetailLoading /> : categoryDetail.isError || !categoryDetail.data ? <ErrorState size="sm" onRetry={() => { void categoryDetail.refetch(); }} /> : <div className="mt-5"><DetailView imageUrl={categoryDetail.data.imageUrl} title={categoryDetail.data.name} description={categoryDetail.data.description} active={categoryDetail.data.isActive} icon={Tag} facts={[{ label: 'ID', value: `#${categoryDetail.data.id}` }, { label: 'Slug', value: categoryDetail.data.slug || '—' }, { label: 'Track turi', value: categoryDetail.data.trackType || '—' }, { label: 'Tezlik diapazoni', value: categoryDetail.data.speedRange || '—' }, { label: 'Tartib', value: String(categoryDetail.data.sortOrder) }]} /></div>}</section></CollectionState>}

      {tab === 'seasons' && <CollectionState loading={seasonsQuery.isLoading} error={seasonsQuery.isError} empty={seasons.length === 0} filtered={Boolean(query)} onRetry={() => { void seasonsQuery.refetch(); }} icon={CalendarRange}><section className="rounded-2xl border border-border bg-card/70 p-5"><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mavsum tafsiloti<select value={seasonId ?? ''} onChange={(event) => setSeasonId(event.target.value ? Number(event.target.value) : undefined)} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"><option value="">Mavsumni tanlang</option>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select></label>{seasonId === undefined ? <EmptyState size="sm" icon={CalendarRange} title="Mavsumni tanlang" description="Detail endpoint faqat tanlovdan keyin chaqiriladi." /> : seasonDetail.isLoading ? <DetailLoading /> : seasonDetail.isError || !seasonDetail.data ? <ErrorState size="sm" onRetry={() => { void seasonDetail.refetch(); }} /> : <div className="mt-5"><DetailView title={seasonDetail.data.name} description={seasonDetail.data.description} active={seasonDetail.data.isActive} icon={CalendarRange} facts={[{ label: 'ID', value: `#${seasonDetail.data.id}` }, { label: 'Slug', value: seasonDetail.data.slug || '—' }, { label: 'Boshlanish', value: formatDate(seasonDetail.data.startDate) }, { label: 'Tugash', value: formatDate(seasonDetail.data.endDate) }]} /></div>}</section></CollectionState>}

      <Modal isOpen={arenaId !== undefined} onClose={() => setArenaId(undefined)} title="Arena tafsiloti" size="xl" className="max-h-[88vh] overflow-y-auto">{arenaDetail.isLoading ? <DetailLoading /> : arenaDetail.isError || !arenaDetail.data ? <ErrorState onRetry={() => { void arenaDetail.refetch(); }} /> : <DetailView imageUrl={arenaDetail.data.coverImageUrl} title={arenaDetail.data.name} description={arenaDetail.data.description} active={arenaDetail.data.isActive} icon={MapPin} facts={[{ label: 'ID', value: `#${arenaDetail.data.id}` }, { label: 'Shahar', value: arenaDetail.data.city || '—' }, { label: 'Manzil', value: arenaDetail.data.address || '—' }, { label: 'Slug', value: arenaDetail.data.slug || '—' }, { label: 'Tartib', value: String(arenaDetail.data.sortOrder) }]} />}</Modal>

      <Modal isOpen={trackId !== undefined} onClose={() => setTrackId(undefined)} title="Track tafsiloti" size="xl" className="max-h-[88vh] overflow-y-auto">{trackDetail.isLoading ? <DetailLoading /> : trackDetail.isError || !trackDetail.data ? <ErrorState onRetry={() => { void trackDetail.refetch(); }} /> : <DetailView imageUrl={trackDetail.data.imageUrl} title={trackDetail.data.name} description={trackDetail.data.description} active={trackDetail.data.isActive} icon={Flag} facts={[{ label: 'ID', value: `#${trackDetail.data.id}` }, { label: 'Arena', value: trackDetail.data.arena?.name || `#${trackDetail.data.arenaId}` }, { label: 'Kategoriya', value: trackDetail.data.category?.name || (trackDetail.data.categoryId ? `#${trackDetail.data.categoryId}` : '—') }, { label: 'Uzunlik', value: trackDetail.data.lengthMeters ? `${trackDetail.data.lengthMeters} m` : '—' }, { label: 'Qiyinlik', value: trackDetail.data.difficulty || '—' }, { label: 'Tartib', value: String(trackDetail.data.sortOrder) }]} />}</Modal>

      <Modal isOpen={vehicleId !== undefined} onClose={() => setVehicleId(undefined)} title="Mashina tafsiloti" size="xl" className="max-h-[88vh] overflow-y-auto">{vehicleDetail.isLoading ? <DetailLoading /> : vehicleDetail.isError || !vehicleDetail.data ? <ErrorState onRetry={() => { void vehicleDetail.refetch(); }} /> : <DetailView imageUrl={vehicleDetail.data.imageUrl} title={vehicleDetail.data.name} description={vehicleDetail.data.description} active={vehicleDetail.data.isActive} icon={Gauge} facts={[{ label: 'ID', value: `#${vehicleDetail.data.id}` }, { label: 'Status', value: vehicleDetail.data.status }, { label: 'Kategoriya', value: vehicleDetail.data.category?.name || `#${vehicleDetail.data.categoryId}` }, { label: 'Boshqaruv', value: vehicleDetail.data.controlType || '—' }, { label: 'Qiyinlik', value: vehicleDetail.data.difficulty || '—' }, { label: 'Maksimal tezlik', value: vehicleDetail.data.topSpeedKmh ? `${vehicleDetail.data.topSpeedKmh} km/h` : '—' }, { label: 'Batareya', value: vehicleDetail.data.batteryLifeMinutes ? `${vehicleDetail.data.batteryLifeMinutes} min` : '—' }]} />}</Modal>
    </div>
  );
}
