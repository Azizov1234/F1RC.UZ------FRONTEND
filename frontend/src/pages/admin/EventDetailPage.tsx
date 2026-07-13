import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock3, Flag, MapPin, Plus, Power, Users, Pencil, ArrowRight } from 'lucide-react';
import { eventsApi } from '@/api/events.api';
import { raceSessionsApi } from '@/api/race-sessions.api';
import { scheduleSlotsApi } from '@/api/schedule-slots.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import {
  useAdminScheduleSlots,
  useCreateScheduleSlot,
  useToggleScheduleSlot,
  useUpdateScheduleSlot,
  useUpdateScheduleSlotStatus,
} from '@/hooks/api/useScheduleSlots';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { getFileUrl } from '@/lib/getFileUrl';
import type { RaceSession, RaceSessionStatus, ScheduleSlot, ScheduleSlotStatus } from '@/types';

type Tab = 'overview' | 'slots' | 'sessions';
type SlotForm = { startsAt: string; endsAt: string; capacity: string; status: ScheduleSlotStatus; isActive: boolean };
const emptySlot: SlotForm = { startsAt: '', endsAt: '', capacity: '1', status: 'OPEN', isActive: true };
const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary';

function localInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

function dateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo‘lmadi.';
}

export default function EventDetailPage() {
  const { id = '' } = useParams();
  const eventId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [slotStatus, setSlotStatus] = useState<'ALL' | ScheduleSlotStatus>('ALL');
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot>();
  const [slotModal, setSlotModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number>();
  const [sessionModal, setSessionModal] = useState(false);

  const eventQuery = useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: async () => (await eventsApi.getAdminEventById(id)).data,
    enabled: Number.isFinite(eventId) && eventId > 0,
  });
  const slotsQuery = useAdminScheduleSlots({
    eventId,
    limit: 100,
    status: slotStatus === 'ALL' ? undefined : slotStatus,
    sortBy: 'startsAt',
    sortOrder: 'asc',
  });
  const slotDetailQuery = useQuery({
    queryKey: queryKeys.scheduleSlots.detail(selectedSlotId ?? ''),
    queryFn: async () => (await scheduleSlotsApi.getAdminScheduleSlotById(selectedSlotId ?? 0)).data,
    enabled: selectedSlotId !== undefined,
  });
  const sessionsQuery = useQuery({
    queryKey: queryKeys.raceSessions.list({ eventId }),
    queryFn: () => raceSessionsApi.getRaceSessions({ eventId, limit: 100, sortOrder: 'asc' }),
    enabled: Number.isFinite(eventId) && eventId > 0,
  });
  const createSession = useMutation({
    mutationFn: raceSessionsApi.createRaceSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
      setSessionModal(false);
      toast({ title: 'Poyga sessiyasi yaratildi' });
    },
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });
  const updateSessionStatus = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: RaceSessionStatus }) => raceSessionsApi.updateRaceSessionStatus(sessionId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() }),
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });

  const event = eventQuery.data;
  const slots = slotsQuery.data?.data ?? [];
  const sessions = sessionsQuery.data?.data ?? [];

  if (!Number.isFinite(eventId) || eventId < 1) return <ErrorState type="notfound" title="Event identifikatori noto‘g‘ri" />;
  if (eventQuery.isLoading) return <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>;
  if (eventQuery.isError || !event) return <ErrorState type="notfound" onRetry={() => eventQuery.refetch()} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title={event.name}
        subtitle={`${dateTime(event.startsAt)} · ${event.arena?.name ?? 'Arena belgilanmagan'}`}
        icon={Calendar}
        breadcrumbs={[{ label: 'Eventlar', onClick: () => navigate('/admin/events') }, { label: event.name }]}
        badge={{ label: event.status, color: event.status === 'CANCELLED' ? 'red' : event.status === 'COMPLETED' ? 'gray' : 'green' }}
        actions={<Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft /> Orqaga</Button>}
      />

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card/70 p-2">
        {([
          ['overview', 'Umumiy', Calendar],
          ['slots', `Jadval slotlari (${slots.length})`, Clock3],
          ['sessions', `Poyga sessiyalari (${sessions.length})`, Flag],
        ] as const).map(([value, label, Icon]) => (
          <button key={value} type="button" onClick={() => setTab(value)} className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-heading font-semibold transition ${tab === value ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="overflow-hidden rounded-2xl border border-border bg-card/70">
            {event.coverImageUrl ? <img src={getFileUrl(event.coverImageUrl)} alt={event.name} className="aspect-[16/7] w-full object-cover" /> : <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-primary/15 to-transparent"><Flag className="h-16 w-16 text-primary/50" /></div>}
            <div className="p-5"><p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{event.description || 'Event tavsifi kiritilmagan.'}</p></div>
          </section>
          <section className="grid grid-cols-2 gap-3 self-start">
            <Info icon={Clock3} label="Boshlanish" value={dateTime(event.startsAt)} />
            <Info icon={Users} label="Slotlar" value={String(slots.length)} />
            <Info icon={MapPin} label="Arena" value={event.arena?.name ?? '—'} />
            <Info icon={Flag} label="Trek" value={event.trackLayout?.name ?? '—'} />
            <div className="col-span-2 rounded-2xl border border-border bg-card/70 p-4"><p className="text-xs text-muted-foreground">Narx</p><p className="mt-1 font-display text-2xl font-bold text-primary">{event.price ? `${event.price.toLocaleString()} UZS` : 'Bepul'}</p></div>
          </section>
        </div>
      )}

      {tab === 'slots' && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="font-heading text-lg font-bold text-foreground">Schedule Slots</h2><p className="text-xs text-muted-foreground">Backend sig‘imi va band qilingan joylar source of truth hisoblanadi</p></div>
            <div className="flex gap-2">
              <select value={slotStatus} onChange={event => setSlotStatus(event.target.value as 'ALL' | ScheduleSlotStatus)} className="h-11 rounded-xl border border-border bg-card px-3 text-xs text-foreground"><option value="ALL">Barcha holatlar</option>{(['OPEN', 'FULL', 'CLOSED', 'CANCELLED'] as ScheduleSlotStatus[]).map(value => <option key={value}>{value}</option>)}</select>
              <Button onClick={() => { setEditingSlot(undefined); setSlotModal(true); }}><Plus /> Slot qo‘shish</Button>
            </div>
          </div>
          {slotsQuery.isError ? <ErrorState onRetry={() => slotsQuery.refetch()} /> : slotsQuery.isLoading ? <div className="space-y-3"><ListItemSkeleton /><ListItemSkeleton /></div> : slots.length === 0 ? <EmptyState icon={Clock3} title="Jadval slotlari yo‘q" /> : (
            <div className="grid gap-4 lg:grid-cols-2">
              {slots.map(slot => <SlotCard key={slot.id} slot={slot} selected={selectedSlotId === slot.id} onOpen={() => setSelectedSlotId(slot.id)} onEdit={() => { setEditingSlot(slot); setSlotModal(true); }} />)}
            </div>
          )}
          {selectedSlotId && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm"><div className="flex justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-primary">Slot detail endpoint</p><p className="mt-1 font-semibold text-foreground">{slotDetailQuery.isLoading ? 'Yuklanmoqda…' : dateTime(slotDetailQuery.data?.startsAt)}</p><p className="mt-1 text-xs text-muted-foreground">Band: {slotDetailQuery.data?.bookedCount ?? '—'} / {slotDetailQuery.data?.capacity ?? '—'}</p></div><button type="button" onClick={() => setSelectedSlotId(undefined)} className="text-xs text-muted-foreground">Yopish</button></div></div>}
        </section>
      )}

      {tab === 'sessions' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-heading text-lg font-bold text-foreground">Race Sessions</h2><p className="text-xs text-muted-foreground">Eventga tegishli poyga sessiyalari</p></div><Button onClick={() => setSessionModal(true)}><Plus /> Sessiya yaratish</Button></div>
          {sessionsQuery.isError ? <ErrorState onRetry={() => sessionsQuery.refetch()} /> : sessionsQuery.isLoading ? <div className="space-y-3"><ListItemSkeleton /><ListItemSkeleton /></div> : sessions.length === 0 ? <EmptyState icon={Flag} title="Sessiyalar yo‘q" /> : (
            <div className="space-y-3">
              {sessions.map(session => <SessionRow key={session.id} session={session} updating={updateSessionStatus.isPending} onStatus={status => updateSessionStatus.mutate({ sessionId: session.id, status })} />)}
            </div>
          )}
        </section>
      )}

      {slotModal && <SlotEditor eventId={eventId} record={editingSlot} onClose={() => setSlotModal(false)} />}
      <SessionEditor eventId={eventId} open={sessionModal} pending={createSession.isPending} onClose={() => setSessionModal(false)} onCreate={data => createSession.mutate(data)} />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card/70 p-4"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div>;
}

function SlotCard({ slot, selected, onOpen, onEdit }: { slot: ScheduleSlot; selected: boolean; onOpen: () => void; onEdit: () => void }) {
  const updateStatus = useUpdateScheduleSlotStatus();
  const toggle = useToggleScheduleSlot();
  const available = Math.max(0, slot.capacity - slot.bookedCount);
  const percent = slot.capacity > 0 ? Math.min(100, (slot.bookedCount / slot.capacity) * 100) : 0;
  return <article className={`rounded-2xl border bg-card/70 p-4 transition ${selected ? 'border-primary' : 'border-border'}`}>
    <button type="button" onClick={onOpen} className="w-full text-left"><div className="flex items-start justify-between gap-3"><div><p className="font-heading font-bold text-foreground">{dateTime(slot.startsAt)}</p><p className="mt-1 text-xs text-muted-foreground">{dateTime(slot.endsAt)} gacha</p></div><StatusBadge status={slot.status} /></div>
      <div className="mt-4"><div className="flex justify-between text-xs"><span className="text-muted-foreground">Band qilingan</span><span className="font-semibold text-foreground">{slot.bookedCount}/{slot.capacity} · {available} bo‘sh</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div></div>
    </button>
    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3"><Button size="sm" variant="outline" onClick={onEdit}><Pencil /> Tahrirlash</Button>{slot.status === 'OPEN' ? <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: slot.id, status: 'CLOSED' })}>Yopish</Button> : slot.status !== 'CANCELLED' && <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: slot.id, status: 'OPEN' })}>Ochish</Button>}<Button size="sm" variant="ghost" onClick={() => toggle.mutate({ id: slot.id, isActive: slot.isActive === false })}><Power /> {slot.isActive === false ? 'Faollashtirish' : 'Nofaol'}</Button>{slot.status !== 'CANCELLED' && <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: slot.id, status: 'CANCELLED' })}>Bekor qilish</Button>}</div>
  </article>;
}

function SlotEditor({ eventId, record, onClose }: { eventId: number; record?: ScheduleSlot; onClose: () => void }) {
  const initial: SlotForm = record ? { startsAt: localInput(record.startsAt), endsAt: localInput(record.endsAt), capacity: String(record.capacity), status: record.status as ScheduleSlotStatus, isActive: record.isActive !== false } : emptySlot;
  const [form, setForm] = useState(initial);
  const create = useCreateScheduleSlot();
  const update = useUpdateScheduleSlot();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      eventId,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      capacity: Number(form.capacity),
      status: form.status,
      isActive: form.isActive,
    };
    const options = { onSuccess: onClose };
    if (record) update.mutate({ id: record.id, data }, options);
    else create.mutate(data, options);
  };
  return <Modal isOpen onClose={onClose} title={record ? 'Slotni tahrirlash' : 'Yangi jadval sloti'}><form onSubmit={submit} className="space-y-4">
    <label className="block text-xs text-muted-foreground">Boshlanish<input required type="datetime-local" value={form.startsAt} onChange={event => setForm(current => ({ ...current, startsAt: event.target.value }))} className={inputClass} /></label>
    <label className="block text-xs text-muted-foreground">Tugash<input required type="datetime-local" value={form.endsAt} onChange={event => setForm(current => ({ ...current, endsAt: event.target.value }))} className={inputClass} /></label>
    <div className="grid grid-cols-2 gap-3"><label className="block text-xs text-muted-foreground">Sig‘im<input required type="number" min="1" value={form.capacity} onChange={event => setForm(current => ({ ...current, capacity: event.target.value }))} className={inputClass} /></label><label className="block text-xs text-muted-foreground">Holat<select value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value as ScheduleSlotStatus }))} className={inputClass}>{(['OPEN', 'FULL', 'CLOSED', 'CANCELLED'] as ScheduleSlotStatus[]).map(status => <option key={status}>{status}</option>)}</select></label></div>
    <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.isActive} onChange={event => setForm(current => ({ ...current, isActive: event.target.checked }))} /> Faol slot</label>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={create.isPending || update.isPending}>Saqlash</Button></div>
  </form></Modal>;
}

function SessionEditor({ eventId, open, pending, onClose, onCreate }: { eventId: number; open: boolean; pending: boolean; onClose: () => void; onCreate: (data: { eventId: number; name?: string; scheduledAt?: string }) => void }) {
  const [name, setName] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  return <Modal isOpen={open} onClose={onClose} title="Yangi poyga sessiyasi"><form onSubmit={event => { event.preventDefault(); onCreate({ eventId, name: name.trim() || undefined, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined }); }} className="space-y-4"><label className="block text-xs text-muted-foreground">Sessiya nomi<input value={name} onChange={event => setName(event.target.value)} className={inputClass} /></label><label className="block text-xs text-muted-foreground">Rejalashtirilgan vaqt<input type="datetime-local" value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} className={inputClass} /></label><div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={pending}>Yaratish</Button></div></form></Modal>;
}

function SessionRow({ session, updating, onStatus }: { session: RaceSession; updating: boolean; onStatus: (status: RaceSessionStatus) => void }) {
  return <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row sm:items-center"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><Flag className="h-5 w-5 text-primary" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-heading font-bold text-foreground">{session.name || `Sessiya #${session.id}`}</h3><StatusBadge status={session.status} /></div><p className="mt-1 text-xs text-muted-foreground">{dateTime(session.scheduledAt)}</p></div><div className="flex flex-wrap gap-2">{session.status === 'PENDING' && <Button size="sm" variant="outline" disabled={updating} onClick={() => onStatus('CANCELLED')}>Bekor qilish</Button>}{session.status === 'ONGOING' && <Button size="sm" variant="outline" disabled={updating} onClick={() => onStatus('PAUSED')}>Pauza</Button>}{session.status === 'PAUSED' && <Button size="sm" variant="outline" disabled={updating} onClick={() => onStatus('ONGOING')}>Davom ettirish</Button>}<Link to={`/admin/race-sessions/${session.id}`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-heading font-semibold text-white">Boshqarish <ArrowRight className="h-4 w-4" /></Link></div></article>;
}
