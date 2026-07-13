import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle2, Clock3, MapPin, TicketCheck, Users, XCircle } from 'lucide-react';
import { eventsApi } from '@/api/events.api';
import { bookingsApi } from '@/api/bookings.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import { usePublicScheduleSlots } from '@/hooks/api/useScheduleSlots';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { getFileUrl } from '@/lib/getFileUrl';
import type { Event } from '@/types';

function dateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Booking yaratib bo‘lmadi.';
}

export default function RacerEventsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'events' | 'bookings'>('events');
  const [bookingEvent, setBookingEvent] = useState<Event>();
  const eventsQuery = useQuery({
    queryKey: queryKeys.events.list({ public: true }),
    queryFn: () => eventsApi.getPublicEvents({ limit: 100, startsFrom: new Date().toISOString() }),
  });
  const bookingsQuery = useQuery({
    queryKey: queryKeys.bookings.mine({ limit: 100 }),
    queryFn: () => bookingsApi.getMyBookings({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
  });
  const cancel = useMutation({
    mutationFn: (id: number) => bookingsApi.cancelMyBooking(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }); toast({ title: 'Booking bekor qilindi' }); },
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });
  const events = eventsQuery.data?.data ?? [];
  const bookings = bookingsQuery.data?.data ?? [];

  return <div className="space-y-5">
    <PageHeader title="Eventlar" subtitle="Real schedule slot tanlab poygaga booking qiling" icon={Calendar} />
    <div className="flex gap-2 rounded-2xl border border-border bg-card/70 p-2"><button type="button" onClick={() => setTab('events')} className={`h-11 flex-1 rounded-xl text-sm font-heading font-semibold ${tab === 'events' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'}`}>Eventlar</button><button type="button" onClick={() => setTab('bookings')} className={`h-11 flex-1 rounded-xl text-sm font-heading font-semibold ${tab === 'bookings' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'}`}>Bookinglarim ({bookings.length})</button></div>

    {tab === 'events' && (eventsQuery.isError ? <ErrorState onRetry={() => eventsQuery.refetch()} /> : eventsQuery.isLoading ? <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div> : events.length === 0 ? <EmptyState icon={Calendar} title="Yaqin eventlar yo‘q" /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{events.map(event => <article key={event.id} className="overflow-hidden rounded-2xl border border-border bg-card/70 transition hover:border-primary/40">{event.coverImageUrl ? <img src={getFileUrl(event.coverImageUrl)} alt={event.name} className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/15 to-transparent"><Calendar className="h-10 w-10 text-primary/60" /></div>}<div className="p-4"><div className="flex items-start justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-widest text-primary">{event.category?.name ?? 'Racing'}</span><StatusBadge status={event.status} /></div><h2 className="mt-2 font-heading font-bold text-foreground">{event.name}</h2><div className="mt-3 space-y-2 text-xs text-muted-foreground"><p className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" />{dateTime(event.startsAt)}</p><p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{event.arena?.name ?? 'Arena'}</p></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><p className="font-display text-lg font-bold text-primary">{event.price ? `${event.price.toLocaleString()} ${event.currency || 'UZS'}` : 'Bepul'}</p><Button size="sm" onClick={() => setBookingEvent(event)}>Slot tanlash</Button></div></div></article>)}</div>)}

    {tab === 'bookings' && (bookingsQuery.isError ? <ErrorState onRetry={() => bookingsQuery.refetch()} /> : bookingsQuery.isLoading ? <div className="space-y-3"><ListItemSkeleton /><ListItemSkeleton /></div> : bookings.length === 0 ? <EmptyState icon={TicketCheck} title="Bookinglar yo‘q" /> : <div className="space-y-3">{bookings.map(booking => <article key={booking.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row sm:items-center"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><TicketCheck className="h-5 w-5 text-primary" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-heading font-bold text-foreground">{booking.event?.name ?? `Booking #${booking.id}`}</p><StatusBadge status={booking.status} /></div><p className="mt-1 text-xs text-muted-foreground">{dateTime(booking.scheduleSlot?.startsAt)} · {booking.scheduleSlot?.bookedCount ?? 0}/{booking.scheduleSlot?.capacity ?? '—'} band</p></div>{!['CANCELLED', 'COMPLETED', 'CHECKED_IN'].includes(booking.status) && <Button size="sm" variant="destructive" onClick={() => cancel.mutate(booking.id)} disabled={cancel.isPending}><XCircle /> Bekor qilish</Button>}</article>)}</div>)}
    {bookingEvent && <BookingModal event={bookingEvent} onClose={() => setBookingEvent(undefined)} />}
  </div>;
}

function BookingModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [slotId, setSlotId] = useState<number>();
  const detailQuery = useQuery({ queryKey: queryKeys.events.detail(event.id), queryFn: async () => (await eventsApi.getPublicEventById(event.id)).data });
  const slotsQuery = usePublicScheduleSlots({ eventId: event.id, status: 'OPEN', isActive: true, limit: 100, sortBy: 'startsAt', sortOrder: 'asc' });
  const slots = slotsQuery.data?.data ?? [];
  const mutation = useMutation({ mutationFn: () => bookingsApi.bookEvent(event.id, { scheduleSlotId: slotId ?? 0 }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }); queryClient.invalidateQueries({ queryKey: queryKeys.scheduleSlots.all() }); onClose(); toast({ title: 'Booking yaratildi' }); }, onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }) });
  return <Modal isOpen onClose={onClose} title={detailQuery.data?.name ?? event.name} description="Backenddagi ochiq slotlardan birini tanlang" size="lg"><div className="space-y-4">{slotsQuery.isError ? <ErrorState size="sm" onRetry={() => slotsQuery.refetch()} /> : slotsQuery.isLoading ? <div className="space-y-2"><ListItemSkeleton /><ListItemSkeleton /></div> : slots.length === 0 ? <EmptyState icon={Clock3} title="Ochiq slot yo‘q" size="sm" /> : <div className="space-y-2">{slots.map(slot => { const available = Math.max(0, slot.capacity - slot.bookedCount); const disabled = available === 0; return <button key={slot.id} type="button" disabled={disabled} onClick={() => setSlotId(slot.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50 ${slotId === slot.id ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/40'}`}><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Clock3 className="h-4 w-4 text-primary" /></div><div className="flex-1"><p className="text-sm font-semibold text-foreground">{dateTime(slot.startsAt)}</p><p className="mt-1 text-xs text-muted-foreground">{dateTime(slot.endsAt)} gacha</p></div><div className="text-right"><p className="flex items-center gap-1 text-xs font-semibold text-foreground"><Users className="h-3.5 w-3.5" /> {available} bo‘sh</p><p className="mt-1 text-[10px] text-muted-foreground">{slot.bookedCount}/{slot.capacity}</p></div>{slotId === slot.id && <CheckCircle2 className="h-5 w-5 text-green-400" />}</button>; })}</div>}<div className="flex justify-end gap-2 border-t border-border pt-4"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button onClick={() => mutation.mutate()} disabled={!slotId || mutation.isPending}>Booking qilish</Button></div></div></Modal>;
}
