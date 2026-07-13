import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock3, Eye, MapPin, Pencil, Plus, Search } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import TablePagination from '@/components/admin/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { useArenas } from '@/hooks/api/useArenas';
import { useCategories } from '@/hooks/api/useCategories';
import {
  useAdminEvent,
  useAdminEvents,
  useCreateEvent,
  usePublicEvent,
  usePublicEvents,
  useUpdateEvent,
  useUpdateEventStatus,
} from '@/hooks/api/useEvents';
import { useAdminSeasons } from '@/hooks/api/useSeasons';
import { useAdminTrackLayouts } from '@/hooks/api/useTrackLayouts';
import { useAuth } from '@/lib/AuthContext';
import { getFileUrl } from '@/lib/getFileUrl';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import type { CreateEventDto, UpdateEventDto } from '@/api/events.api';
import type { Event, EventStatus } from '@/types';

const EVENT_STATUSES: EventStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
];

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

function displayDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function localDateTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function apiDate(value: FormDataEntryValue | null): string {
  return new Date(String(value)).toISOString();
}

function EventCard({ event, onOpen, manageHref }: { event: Event; onOpen?: () => void; manageHref?: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-lg transition hover:border-primary/30">
      <div
        className={`h-1 ${event.status === 'ONGOING' ? 'bg-green-400' : event.status === 'CANCELLED' ? 'bg-red-400' : 'bg-primary'}`}
      />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {event.category?.name ?? `Kategoriya #${event.categoryId}`}
            </p>
            <h2 className="mt-1 truncate text-base font-bold text-foreground font-heading">{event.name}</h2>
          </div>
          <StatusBadge status={event.status} />
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{displayDate(event.startsAt)}</p>
          <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{event.arena?.name ?? `Arena #${event.arenaId}`}</p>
          <p className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" />Ro'yxat yopilishi: {displayDate(event.registrationEndsAt)}</p>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-lg font-bold text-primary font-display">
            {event.price ?? 0} <span className="text-xs text-muted-foreground">{event.currency ?? 'UZS'}</span>
          </p>
          <div className="flex flex-wrap justify-end gap-2">
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              <Eye className="h-4 w-4" /> Detail
            </button>
          )}
          {manageHref && (
            <Link
              to={manageHref}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary hover:text-white"
            >
              Slot va sessiyalar <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EventFormModal({
  event,
  onClose,
}: {
  event?: Event;
  onClose: () => void;
}) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const seasons = useAdminSeasons({ limit: 100, sortBy: 'startDate', sortOrder: 'desc' });
  const categories = useCategories({ limit: 100, isActive: true });
  const arenas = useArenas({ limit: 100, isActive: true });
  const [arenaId, setArenaId] = useState(event?.arenaId ?? 0);
  const [coverFile, setCoverFile] = useState<File>();
  const [coverPreview, setCoverPreview] = useState('');
  const layouts = useAdminTrackLayouts({
    limit: 100,
    arenaId: arenaId || undefined,
    isActive: true,
  });
  const pending = createEvent.isPending || updateEvent.isPending;

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  function selectCover(file?: File): boolean {
    if (!file) return false;
    const validation = validateUploadedFile(file);
    if (!validation.isValid) {
      toast({ title: 'Rasm qabul qilinmadi', description: validation.error, variant: 'destructive' });
      return false;
    }
    setCoverFile(file);
    return true;
  }

  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    const endsAtValue = String(form.get('endsAt') ?? '');
    const priceValue = String(form.get('price') ?? '');
    const common: CreateEventDto = {
      seasonId: Number(form.get('seasonId')),
      categoryId: Number(form.get('categoryId')),
      arenaId: Number(form.get('arenaId')),
      trackLayoutId: Number(form.get('trackLayoutId')),
      name: String(form.get('name') ?? '').trim(),
      slug: String(form.get('slug') ?? '').trim() || undefined,
      description: String(form.get('description') ?? '').trim() || undefined,
      coverImageUrl: coverFile,
      status: String(form.get('status')) as EventStatus,
      registrationStartsAt: apiDate(form.get('registrationStartsAt')),
      registrationEndsAt: apiDate(form.get('registrationEndsAt')),
      startsAt: apiDate(form.get('startsAt')),
      endsAt: endsAtValue ? new Date(endsAtValue).toISOString() : undefined,
      price: priceValue ? Number(priceValue) : undefined,
      currency: String(form.get('currency') ?? '').trim() || 'UZS',
      isActive: form.get('isActive') === 'on',
    };

    try {
      if (event) {
        const update: UpdateEventDto = common;
        await updateEvent.mutateAsync({ id: event.id, data: update });
        toast({ title: 'Event yangilandi' });
      } else {
        await createEvent.mutateAsync(common);
        toast({ title: 'Event yaratildi' });
      }
      onClose();
    } catch (error: unknown) {
      toast({
        title: event ? 'Event yangilanmadi' : 'Event yaratilmadi',
        description: errorText(error),
        variant: 'destructive',
      });
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={event ? 'Eventni tahrirlash' : 'Yangi event'}
      description="Season, arena, trek va ro'yxatdan o'tish vaqtlarini kiriting."
      size="xl"
      className="max-h-[92vh] overflow-y-auto"
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Nomi
          <input name="name" defaultValue={event?.name} required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Slug
          <input name="slug" defaultValue={event?.slug ?? ''} className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Status
          <select name="status" defaultValue={event?.status ?? 'DRAFT'} className={`${inputClass} mt-2`}>
            {EVENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Season
          <select name="seasonId" defaultValue={event?.seasonId ?? ''} required className={`${inputClass} mt-2`}>
            <option value="">Seasonni tanlang</option>
            {(seasons.data?.data ?? []).map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Kategoriya
          <select name="categoryId" defaultValue={event?.categoryId ?? ''} required className={`${inputClass} mt-2`}>
            <option value="">Kategoriyani tanlang</option>
            {(categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Arena
          <select
            name="arenaId"
            value={arenaId || ''}
            onChange={(changeEvent) => setArenaId(Number(changeEvent.target.value))}
            required
            className={`${inputClass} mt-2`}
          >
            <option value="">Arenani tanlang</option>
            {(arenas.data ?? []).map((arena) => <option key={arena.id} value={arena.id}>{arena.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Trek sxemasi
          <select name="trackLayoutId" defaultValue={event?.trackLayoutId ?? ''} required className={`${inputClass} mt-2`}>
            <option value="">Trekni tanlang</option>
            {(layouts.data?.data ?? []).map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Ro'yxat ochiladi
          <input name="registrationStartsAt" type="datetime-local" defaultValue={localDateTime(event?.registrationStartsAt)} required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Ro'yxat yopiladi
          <input name="registrationEndsAt" type="datetime-local" defaultValue={localDateTime(event?.registrationEndsAt)} required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Boshlanishi
          <input name="startsAt" type="datetime-local" defaultValue={localDateTime(event?.startsAt)} required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Tugashi
          <input name="endsAt" type="datetime-local" defaultValue={localDateTime(event?.endsAt)} className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Narx
          <input name="price" type="number" min="0" step="0.01" defaultValue={event?.price ?? ''} className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Valyuta
          <input name="currency" defaultValue={event?.currency ?? 'UZS'} className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Tavsif
          <textarea name="description" defaultValue={event?.description ?? ''} rows={3} className={`${inputClass} mt-2 resize-none`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Muqova rasmi
          <input type="file" accept={IMAGE_UPLOAD_ACCEPT} onChange={(changeEvent) => { if (!selectCover(changeEvent.target.files?.[0])) changeEvent.currentTarget.value = ''; }} className={`${inputClass} mt-2`} />
          <span className="mt-1.5 block normal-case tracking-normal text-[10px] font-normal">{IMAGE_UPLOAD_RULES_LABEL}</span>
        </label>
        {(coverPreview || event?.coverImageUrl) && (
          <img src={coverPreview || getFileUrl(event?.coverImageUrl ?? undefined)} alt="Event muqovasi preview" className="h-40 w-full rounded-2xl border border-border object-cover sm:col-span-2" />
        )}
        <label className="flex items-center gap-3 text-sm font-semibold text-foreground sm:col-span-2">
          <input name="isActive" type="checkbox" defaultChecked={event?.isActive ?? true} className="h-4 w-4 accent-primary" />
          Aktiv event
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

function EventDetailModal({
  id,
  onClose,
  onEdit,
}: {
  id: number | string;
  onClose: () => void;
  onEdit: (event: Event) => void;
}) {
  const query = useAdminEvent(id);
  const updateStatus = useUpdateEventStatus();
  const event = query.data;

  async function changeStatus(status: EventStatus) {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: 'Event statusi yangilandi' });
    } catch (error: unknown) {
      toast({ title: 'Status yangilanmadi', description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={`Event #${id}`} description="Backenddagi to'liq event ma'lumoti" size="lg">
      {query.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : query.isError || !event ? (
        <ErrorState size="sm" onRetry={() => query.refetch()} />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Nomi', event.name],
              ['Season', event.season?.name ?? `#${event.seasonId}`],
              ['Arena', event.arena?.name ?? `#${event.arenaId}`],
              ['Trek', event.trackLayout?.name ?? `#${event.trackLayoutId}`],
              ['Boshlanishi', displayDate(event.startsAt)],
              ['Ro\'yxat yopilishi', displayDate(event.registrationEndsAt)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Statusni tez yangilash
            <select
              value={event.status}
              onChange={(changeEvent) => changeStatus(changeEvent.target.value as EventStatus)}
              disabled={updateStatus.isPending}
              className={`${inputClass} mt-2`}
            >
              {EVENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white"
          >
            <Pencil className="h-4 w-4" /> Eventni tahrirlash
          </button>
        </div>
      )}
    </Modal>
  );
}

function PublicEventDetailModal({ id, onClose }: { id: number | string; onClose: () => void }) {
  const query = usePublicEvent(id);
  const event = query.data;

  return (
    <Modal isOpen onClose={onClose} title={`Event #${id}`} description="E'lon qilingan event ma'lumoti" size="lg">
      {query.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : query.isError || !event ? (
        <ErrorState size="sm" onRetry={() => query.refetch()} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-lg font-bold text-foreground font-heading">{event.name}</h2><p className="mt-1 text-sm text-muted-foreground">{event.description || 'Tavsif kiritilmagan.'}</p></div>
            <StatusBadge status={event.status} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Kategoriya', event.category?.name ?? `#${event.categoryId}`],
              ['Arena', event.arena?.name ?? `#${event.arenaId}`],
              ['Trek', event.trackLayout?.name ?? `#${event.trackLayoutId}`],
              ['Boshlanishi', displayDate(event.startsAt)],
              ['Ro\'yxat yopilishi', displayDate(event.registrationEndsAt)],
              ['Narx', `${event.price ?? 0} ${event.currency ?? 'UZS'}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function AdminEventsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>();
  const [editing, setEditing] = useState<Event>();
  const query = useAdminEvents({
    page,
    limit: 18,
    search: search || undefined,
    status: status || undefined,
    sortBy: 'startsAt',
    sortOrder: 'desc',
  });
  const events = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground font-heading"><Calendar className="h-6 w-6 text-primary" /> Eventlar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta?.total ?? 0} ta real event</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90"><Plus className="h-4 w-4" /> Yangi event</button>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(changeEvent) => { setSearch(changeEvent.target.value); setPage(1); }} placeholder="Event qidirish…" className={`${inputClass} pl-9`} />
        </div>
        <select value={status} onChange={(changeEvent) => { setStatus(changeEvent.target.value as EventStatus | ''); setPage(1); }} className={`${inputClass} sm:w-60`}>
          <option value="">Barcha statuslar</option>
          {EVENT_STATUSES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : !query.isLoading && events.length === 0 ? (
        <EmptyState icon={Calendar} isFiltered={Boolean(search || status)} action={<button onClick={() => setCreateOpen(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Event yaratish</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.isLoading
            ? Array.from({ length: 6 }).map((_, index) => <CardSkeleton key={index} />)
            : events.map((event) => <EventCard key={event.id} event={event} onOpen={() => setSelectedId(event.id)} manageHref={`/admin/events/${event.id}`} />)}
        </div>
      )}
      {meta && <TablePagination total={meta.total} page={meta.page} limit={meta.limit} totalPages={meta.totalPages} onPageChange={setPage} isLoading={query.isFetching} showingCount={events.length} />}
      {createOpen && <EventFormModal onClose={() => setCreateOpen(false)} />}
      {selectedId !== undefined && (
        <EventDetailModal
          id={selectedId}
          onClose={() => setSelectedId(undefined)}
          onEdit={(event) => { setSelectedId(undefined); setEditing(event); }}
        />
      )}
      {editing && <EventFormModal key={editing.id} event={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function PublicEventsView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | string>();
  const query = usePublicEvents({ page, limit: 18, search: search || undefined });
  const events = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground font-heading"><Calendar className="h-6 w-6 text-primary" /> Eventlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Team manager uchun e'lon qilingan eventlar</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(changeEvent) => { setSearch(changeEvent.target.value); setPage(1); }} placeholder="Event qidirish…" className={`${inputClass} pl-9`} />
      </div>
      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : !query.isLoading && events.length === 0 ? (
        <EmptyState icon={Calendar} isFiltered={Boolean(search)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.isLoading
            ? Array.from({ length: 6 }).map((_, index) => <CardSkeleton key={index} />)
            : events.map((event) => <EventCard key={event.id} event={event} onOpen={() => setSelectedId(event.id)} />)}
        </div>
      )}
      {meta && <TablePagination total={meta.total} page={meta.page} limit={meta.limit} totalPages={meta.totalPages} onPageChange={setPage} isLoading={query.isFetching} showingCount={events.length} />}
      {selectedId !== undefined && <PublicEventDetailModal id={selectedId} onClose={() => setSelectedId(undefined)} />}
    </div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  return user?.role === 'admin' || user?.role === 'superadmin' ? <AdminEventsManager /> : <PublicEventsView />;
}
