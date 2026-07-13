import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Flag, MapPin, Plus, Route, Shapes, Pencil, Power, Image as ImageIcon } from 'lucide-react';
import { arenasApi } from '@/api/arenas.api';
import { trackLayoutsApi } from '@/api/track-layouts.api';
import { arenaZonesApi } from '@/api/arena-zones.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import {
  useAdminTrackLayouts,
  useCreateTrackLayout,
  useToggleTrackLayout,
  useUpdateTrackLayout,
} from '@/hooks/api/useTrackLayouts';
import {
  useAdminArenaZones,
  useCreateArenaZone,
  useToggleArenaZone,
  useUpdateArenaZone,
} from '@/hooks/api/useArenaZones';
import { useCategories } from '@/hooks/api/useCategories';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { getFileUrl } from '@/lib/getFileUrl';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import type { ArenaZone, ArenaZoneType, TrackDifficulty, TrackLayout } from '@/types';

type Tab = 'overview' | 'layouts' | 'zones';
type ResourceEditor = { kind: 'layout'; record?: TrackLayout } | { kind: 'zone'; record?: ArenaZone };

const zoneTypes: ArenaZoneType[] = [
  'START_GRID', 'PIT_LANE', 'RALLY_ZONE', 'FINISH_LINE',
  'SPECTATOR_ZONE', 'SERVICE_ZONE', 'CONTROL_ROOM', 'OTHER',
];
const difficulties: TrackDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO', 'ELITE'];
const acceptedImages = ['image/jpeg', 'image/png', 'image/webp'];
const controlClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary';

function useFilePreview(file?: File) {
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return preview;
}

function validImage(file?: File): file is File {
  if (!file) return false;
  const validation = validateUploadedFile(file);
  if (!validation.isValid) {
    toast({ title: 'Rasm qabul qilinmadi', description: validation.error, variant: 'destructive' });
    return false;
  }
  if (!acceptedImages.includes(file.type)) {
    toast({ title: 'Noto‘g‘ri fayl', description: 'Faqat JPG, PNG yoki WEBP rasm yuklang.', variant: 'destructive' });
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast({ title: 'Fayl juda katta', description: 'Maksimal hajm 5 MB.', variant: 'destructive' });
    return false;
  }
  return true;
}

function appendOptional(formData: FormData, key: string, value: string) {
  if (value.trim()) formData.append(key, value.trim());
}

export default function ArenaDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const arenaId = Number(id);
  const [tab, setTab] = useState<Tab>('overview');
  const [zoneFilter, setZoneFilter] = useState<'ALL' | ArenaZoneType>('ALL');
  const [editor, setEditor] = useState<ResourceEditor>();
  const [selectedLayoutId, setSelectedLayoutId] = useState<number>();
  const [selectedZoneId, setSelectedZoneId] = useState<number>();
  const toggleLayout = useToggleTrackLayout();
  const toggleZone = useToggleArenaZone();

  const arenaQuery = useQuery({
    queryKey: queryKeys.arenas.detail(id),
    queryFn: async () => (await arenasApi.getArenaById(id)).data,
    enabled: Number.isFinite(arenaId) && arenaId > 0,
  });
  const layoutsQuery = useAdminTrackLayouts({ arenaId, limit: 100, sortBy: 'sortOrder', sortOrder: 'asc' });
  const zonesQuery = useAdminArenaZones({
    arenaId,
    limit: 100,
    zoneType: zoneFilter === 'ALL' ? undefined : zoneFilter,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });
  const layoutDetailQuery = useQuery({
    queryKey: queryKeys.trackLayouts.detail(selectedLayoutId ?? ''),
    queryFn: async () => (await trackLayoutsApi.getAdminTrackLayoutById(selectedLayoutId ?? 0)).data,
    enabled: selectedLayoutId !== undefined,
  });
  const zoneDetailQuery = useQuery({
    queryKey: queryKeys.arenaZones.detail(selectedZoneId ?? ''),
    queryFn: async () => (await arenaZonesApi.getAdminArenaZoneById(selectedZoneId ?? 0)).data,
    enabled: selectedZoneId !== undefined,
  });

  const layouts = layoutsQuery.data?.data ?? [];
  const zones = zonesQuery.data?.data ?? [];
  const arena = arenaQuery.data;

  if (!Number.isFinite(arenaId) || arenaId < 1) {
    return <ErrorState type="notfound" title="Arena identifikatori noto‘g‘ri" />;
  }
  if (arenaQuery.isLoading) return <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>;
  if (arenaQuery.isError || !arena) return <ErrorState type="notfound" onRetry={() => arenaQuery.refetch()} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title={arena.name}
        subtitle={[arena.city, arena.address].filter(Boolean).join(' · ') || 'Arena boshqaruvi'}
        icon={MapPin}
        breadcrumbs={[{ label: 'Arenalar', onClick: () => navigate('/admin/arenas') }, { label: arena.name }]}
        badge={{ label: arena.isActive === false ? 'Nofaol' : 'Faol', color: arena.isActive === false ? 'gray' : 'green' }}
        actions={<Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft /> Orqaga</Button>}
      />

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card/70 p-2">
        {([
          ['overview', 'Umumiy', Flag],
          ['layouts', `Treklar (${layouts.length})`, Route],
          ['zones', `Zonalar (${zones.length})`, Shapes],
        ] as const).map(([value, label, Icon]) => (
          <button key={value} type="button" onClick={() => setTab(value)} className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-heading font-semibold transition ${tab === value ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-2xl border border-border bg-card/70">
            {arena.coverImageUrl ? <img src={getFileUrl(arena.coverImageUrl)} alt={arena.name} className="aspect-[16/7] w-full object-cover" /> : <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-primary/15 to-transparent"><MapPin className="h-14 w-14 text-primary/60" /></div>}
            <div className="p-5">
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{arena.description || 'Arena tavsifi kiritilmagan.'}</p>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-3 self-start">
            <Metric label="Trek sxemalari" value={layouts.length} icon={Route} />
            <Metric label="Arena zonalari" value={zones.length} icon={Shapes} />
            <div className="col-span-2 rounded-2xl border border-border bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Manzil</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{[arena.address, arena.city].filter(Boolean).join(', ') || 'Ko‘rsatilmagan'}</p>
            </div>
          </section>
        </div>
      )}

      {tab === 'layouts' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-heading text-lg font-bold text-foreground">Track Layouts</h2><p className="text-xs text-muted-foreground">Trek sxemalari, masofa va qiyinlik darajalari</p></div>
            <Button onClick={() => setEditor({ kind: 'layout' })}><Plus /> Trek qo‘shish</Button>
          </div>
          {layoutsQuery.isError ? <ErrorState onRetry={() => layoutsQuery.refetch()} /> : layoutsQuery.isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div> : layouts.length === 0 ? <EmptyState icon={Route} title="Trek sxemasi yo‘q" /> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {layouts.map(layout => (
                <ResourceCard
                  key={layout.id}
                  title={layout.name}
                  image={layout.imageUrl}
                  active={layout.isActive !== false}
                  selected={selectedLayoutId === layout.id}
                  meta={`${layout.difficulty ?? '—'} · ${layout.lengthMeters ? `${layout.lengthMeters} m` : 'masofa yo‘q'}`}
                  onOpen={() => setSelectedLayoutId(layout.id)}
                  onEdit={() => setEditor({ kind: 'layout', record: layout })}
                  onToggle={() => toggleLayout.mutate({ id: layout.id, isActive: layout.isActive === false })}
                />
              ))}
            </div>
          )}
          {selectedLayoutId && (
            <DetailStrip loading={layoutDetailQuery.isLoading} title={layoutDetailQuery.data?.name} description={layoutDetailQuery.data?.description} onClose={() => setSelectedLayoutId(undefined)} />
          )}
        </section>
      )}

      {tab === 'zones' && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="font-heading text-lg font-bold text-foreground">Arena Zones</h2><p className="text-xs text-muted-foreground">Start, pit-lane, tomoshabin va servis hududlari</p></div>
            <div className="flex gap-2">
              <select value={zoneFilter} onChange={event => setZoneFilter(event.target.value as 'ALL' | ArenaZoneType)} className="h-11 rounded-xl border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-primary">
                <option value="ALL">Barcha turlar</option>
                {zoneTypes.map(value => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
              </select>
              <Button onClick={() => setEditor({ kind: 'zone' })}><Plus /> Zona qo‘shish</Button>
            </div>
          </div>
          {zonesQuery.isError ? <ErrorState onRetry={() => zonesQuery.refetch()} /> : zonesQuery.isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div> : zones.length === 0 ? <EmptyState icon={Shapes} title="Arena zonasi yo‘q" /> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {zones.map(zone => (
                <ResourceCard
                  key={zone.id}
                  title={zone.name}
                  image={zone.imageUrl}
                  active={zone.isActive !== false}
                  selected={selectedZoneId === zone.id}
                  meta={`${zone.zoneType.replace(/_/g, ' ')}${zone.trackLayout?.name ? ` · ${zone.trackLayout.name}` : ''}`}
                  onOpen={() => setSelectedZoneId(zone.id)}
                  onEdit={() => setEditor({ kind: 'zone', record: zone })}
                  onToggle={() => toggleZone.mutate({ id: zone.id, isActive: zone.isActive === false })}
                />
              ))}
            </div>
          )}
          {selectedZoneId && (
            <DetailStrip loading={zoneDetailQuery.isLoading} title={zoneDetailQuery.data?.name} description={zoneDetailQuery.data?.description} onClose={() => setSelectedZoneId(undefined)} />
          )}
        </section>
      )}

      {editor?.kind === 'layout' && <LayoutEditor arenaId={arenaId} record={editor.record} onClose={() => setEditor(undefined)} />}
      {editor?.kind === 'zone' && <ZoneEditor arenaId={arenaId} layouts={layouts} record={editor.record} onClose={() => setEditor(undefined)} />}
    </div>
  );
}

// Mutations are mounted in this small wrapper so card callbacks remain straightforward.
function ResourceCard({ title, image, active, selected, meta, onOpen, onEdit, onToggle }: { title: string; image?: string | null; active: boolean; selected: boolean; meta: string; onOpen: () => void; onEdit: () => void; onToggle: () => void }) {
  return (
    <article className={`overflow-hidden rounded-2xl border bg-card/70 transition ${selected ? 'border-primary' : 'border-border hover:border-primary/40'}`}>
      <button type="button" onClick={onOpen} className="block w-full text-left">
        {image ? <img src={getFileUrl(image)} alt="" className="h-32 w-full object-cover" /> : <div className="flex h-32 items-center justify-center bg-muted/40"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>}
        <div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-heading font-bold text-foreground">{title}</h3><span className={`rounded-full border px-2 py-0.5 text-[10px] ${active ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-border bg-muted text-muted-foreground'}`}>{active ? 'FAOL' : 'NOFAOL'}</span></div><p className="mt-2 text-xs text-muted-foreground">{meta}</p></div>
      </button>
      <div className="flex gap-2 border-t border-border p-3">
        <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}><Pencil /> Tahrirlash</Button>
        <Button size="sm" variant="ghost" onClick={onToggle} aria-label="Faollikni almashtirish"><Power /></Button>
      </div>
    </article>
  );
}

function DetailStrip({ loading, title, description, onClose }: { loading: boolean; title?: string; description?: string | null; onClose: () => void }) {
  return <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-primary">Detail endpoint</p><p className="mt-1 font-heading font-bold text-foreground">{loading ? 'Yuklanmoqda…' : title}</p><p className="mt-1 text-xs text-muted-foreground">{description || 'Tavsif kiritilmagan'}</p></div><button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Yopish</button></div></div>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Route }) {
  return <div className="rounded-2xl border border-border bg-card/70 p-4"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 font-display text-3xl font-bold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}

function LayoutEditor({ arenaId, record, onClose }: { arenaId: number; record?: TrackLayout; onClose: () => void }) {
  const [name, setName] = useState(record?.name ?? '');
  const [description, setDescription] = useState(record?.description ?? '');
  const [categoryId, setCategoryId] = useState(record?.categoryId ? String(record.categoryId) : '');
  const [lengthMeters, setLengthMeters] = useState(record?.lengthMeters ? String(record.lengthMeters) : '');
  const [difficulty, setDifficulty] = useState<TrackDifficulty>((record?.difficulty as TrackDifficulty | null) ?? 'BEGINNER');
  const [sortOrder, setSortOrder] = useState(String(record?.sortOrder ?? 0));
  const [file, setFile] = useState<File>();
  const preview = useFilePreview(file);
  const categoriesQuery = useCategories({ limit: 100 });
  const createMutation = useCreateTrackLayout();
  const updateMutation = useUpdateTrackLayout();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    data.append('arenaId', String(arenaId));
    data.append('name', name.trim());
    appendOptional(data, 'description', description);
    appendOptional(data, 'categoryId', categoryId);
    appendOptional(data, 'lengthMeters', lengthMeters);
    data.append('difficulty', difficulty);
    data.append('sortOrder', sortOrder || '0');
    if (file) data.append('imageUrl', file);
    const options = { onSuccess: onClose };
    if (record) updateMutation.mutate({ id: record.id, data }, options);
    else createMutation.mutate(data, options);
  };

  return <Modal isOpen onClose={onClose} title={record ? 'Trekni tahrirlash' : 'Yangi trek sxemasi'} size="lg"><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Field label="Nomi"><input required value={name} onChange={event => setName(event.target.value)} className={controlClass} /></Field>
    <Field label="Kategoriya"><select value={categoryId} onChange={event => setCategoryId(event.target.value)} className={controlClass}><option value="">Biriktirilmagan</option>{(categoriesQuery.data ?? []).map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
    <Field label="Masofa (metr)"><input type="number" min="0" value={lengthMeters} onChange={event => setLengthMeters(event.target.value)} className={controlClass} /></Field>
    <Field label="Qiyinlik"><select value={difficulty} onChange={event => setDifficulty(event.target.value as TrackDifficulty)} className={controlClass}>{difficulties.map(value => <option key={value}>{value}</option>)}</select></Field>
    <Field label="Tartib"><input type="number" min="0" value={sortOrder} onChange={event => setSortOrder(event.target.value)} className={controlClass} /></Field>
    <Field label={`Rasm (${IMAGE_UPLOAD_RULES_LABEL})`}><input type="file" accept={IMAGE_UPLOAD_ACCEPT} onChange={event => { const next = event.target.files?.[0]; if (validImage(next)) setFile(next); else event.currentTarget.value = ''; }} className={`${controlClass} file:text-foreground`} /></Field>
    {(preview || record?.imageUrl) && <img src={preview || getFileUrl(record?.imageUrl ?? undefined)} alt="Preview" className="col-span-full h-36 w-full rounded-xl object-cover" />}
    <Field label="Tavsif" className="sm:col-span-2"><textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} className={`${controlClass} h-auto py-2`} /></Field>
    <div className="col-span-full flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Saqlash</Button></div>
  </form></Modal>;
}

function ZoneEditor({ arenaId, layouts, record, onClose }: { arenaId: number; layouts: TrackLayout[]; record?: ArenaZone; onClose: () => void }) {
  const [name, setName] = useState(record?.name ?? '');
  const [description, setDescription] = useState(record?.description ?? '');
  const [zoneType, setZoneType] = useState<ArenaZoneType>((record?.zoneType as ArenaZoneType) ?? 'OTHER');
  const [trackLayoutId, setTrackLayoutId] = useState(record?.trackLayoutId ? String(record.trackLayoutId) : '');
  const [sortOrder, setSortOrder] = useState(String(record?.sortOrder ?? 0));
  const [file, setFile] = useState<File>();
  const preview = useFilePreview(file);
  const createMutation = useCreateArenaZone();
  const updateMutation = useUpdateArenaZone();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    data.append('arenaId', String(arenaId));
    data.append('name', name.trim());
    data.append('zoneType', zoneType);
    data.append('sortOrder', sortOrder || '0');
    appendOptional(data, 'description', description);
    appendOptional(data, 'trackLayoutId', trackLayoutId);
    if (file) data.append('imageUrl', file);
    const options = { onSuccess: onClose };
    if (record) updateMutation.mutate({ id: record.id, data }, options);
    else createMutation.mutate(data, options);
  };

  return <Modal isOpen onClose={onClose} title={record ? 'Zonani tahrirlash' : 'Yangi arena zonasi'} size="lg"><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Field label="Nomi"><input required value={name} onChange={event => setName(event.target.value)} className={controlClass} /></Field>
    <Field label="Zona turi"><select value={zoneType} onChange={event => setZoneType(event.target.value as ArenaZoneType)} className={controlClass}>{zoneTypes.map(value => <option key={value}>{value}</option>)}</select></Field>
    <Field label="Trek"><select value={trackLayoutId} onChange={event => setTrackLayoutId(event.target.value)} className={controlClass}><option value="">Biriktirilmagan</option>{layouts.map(layout => <option key={layout.id} value={layout.id}>{layout.name}</option>)}</select></Field>
    <Field label="Tartib"><input type="number" min="0" value={sortOrder} onChange={event => setSortOrder(event.target.value)} className={controlClass} /></Field>
    <Field label={`Rasm (${IMAGE_UPLOAD_RULES_LABEL})`}><input type="file" accept={IMAGE_UPLOAD_ACCEPT} onChange={event => { const next = event.target.files?.[0]; if (validImage(next)) setFile(next); else event.currentTarget.value = ''; }} className={`${controlClass} file:text-foreground`} /></Field>
    {(preview || record?.imageUrl) && <img src={preview || getFileUrl(record?.imageUrl ?? undefined)} alt="Preview" className="col-span-full h-36 w-full rounded-xl object-cover" />}
    <Field label="Tavsif" className="sm:col-span-2"><textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} className={`${controlClass} h-auto py-2`} /></Field>
    <div className="col-span-full flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Saqlash</Button></div>
  </form></Modal>;
}

function Field({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return <label className={`block text-xs font-heading text-muted-foreground ${className}`}>{label}{children}</label>;
}
