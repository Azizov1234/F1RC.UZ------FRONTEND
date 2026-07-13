import { type FormEvent, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  Plus,
  QrCode,
  Search,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import TablePagination from '@/components/admin/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import {
  useAdminBooking,
  useAdminBookings,
  useCheckInBooking,
  useCreateAdminBooking,
  useUpdateAdminBooking,
} from '@/hooks/api/useBookings';
import { useAdminScheduleSlots } from '@/hooks/api/useScheduleSlots';
import { useAdminVehicles } from '@/hooks/api/useVehicles';
import { useUsersQuery } from '@/hooks/api/useUsers';
import type { BookingStatus } from '@/types';

const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

const inputClass =
  'w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10';

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
  }
  return 'Amalni bajarib bo‘lmadi';
}

function displayDate(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function OperatorCheckInPanel() {
  const checkIn = useCheckInBooking();
  const [bookingId, setBookingId] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingId.trim()) return;
    try {
      const booking = await checkIn.mutateAsync(bookingId.trim());
      toast({
        title: 'Check-in tasdiqlandi',
        description: `Booking #${booking.id} poygaga qabul qilindi.`,
      });
      setBookingId('');
    } catch (error: unknown) {
      toast({ title: 'Check-in xatosi', description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground font-heading">
          <QrCode className="h-6 w-6 text-primary" /> Operator check-in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Backend operator uchun booking ro‘yxatini bermaydi. Booking ID orqali check-in qiling.
        </p>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground font-heading">
          Booking ID
        </label>
        <input
          value={bookingId}
          onChange={(event) => setBookingId(event.target.value)}
          className={inputClass}
          inputMode="numeric"
          placeholder="Masalan: 42"
          required
        />
        <button
          type="submit"
          disabled={checkIn.isPending}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {checkIn.isPending ? 'Tekshirilmoqda…' : 'Check-in qilish'}
        </button>
      </form>
    </div>
  );
}

function CreateBookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createBooking = useCreateAdminBooking();
  const users = useUsersQuery({ limit: 100, status: 'ACTIVE' });
  const slots = useAdminScheduleSlots({ limit: 100, isActive: true });
  const vehicles = useAdminVehicles({ limit: 100, isActive: true });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const userId = Number(form.get('userId'));
    const scheduleSlotId = Number(form.get('scheduleSlotId'));
    const vehicleValue = String(form.get('vehicleId') ?? '');
    const notes = String(form.get('notes') ?? '').trim();
    if (!userId || !scheduleSlotId) return;

    try {
      await createBooking.mutateAsync({
        userId,
        scheduleSlotId,
        vehicleId: vehicleValue ? Number(vehicleValue) : undefined,
        notes: notes || undefined,
      });
      toast({ title: 'Booking yaratildi' });
      onClose();
    } catch (error: unknown) {
      toast({ title: 'Booking yaratilmadi', description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Yangi booking" description="Racer, vaqt sloti va transportni biriktiring." size="lg">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Racer
          <select name="userId" required className={`${inputClass} mt-2`}>
            <option value="">Racerni tanlang</option>
            {(users.data?.data ?? []).map((user) => (
              <option key={user.id} value={user.id}>{user.fullName} · {user.phone}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Schedule slot
          <select name="scheduleSlotId" required className={`${inputClass} mt-2`}>
            <option value="">Slotni tanlang</option>
            {(slots.data?.data ?? []).map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.event?.name ?? `Event #${slot.eventId}`} · {displayDate(slot.startsAt)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Transport (ixtiyoriy)
          <select name="vehicleId" className={`${inputClass} mt-2`}>
            <option value="">Transport biriktirilmagan</option>
            {(vehicles.data ?? []).map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.name} · {vehicle.status}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Izoh
          <textarea name="notes" rows={3} className={`${inputClass} mt-2 resize-none`} />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border px-4 text-sm text-muted-foreground hover:text-foreground">Bekor</button>
          <button type="submit" disabled={createBooking.isPending} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50">
            {createBooking.isPending ? 'Saqlanmoqda…' : 'Booking yaratish'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BookingDetailModal({ id, onClose }: { id: number | string; onClose: () => void }) {
  const bookingQuery = useAdminBooking(id);
  const updateBooking = useUpdateAdminBooking();
  const booking = bookingQuery.data;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const status = String(form.get('status')) as BookingStatus;
    const notes = String(form.get('notes') ?? '').trim();
    try {
      await updateBooking.mutateAsync({ id, data: { status, notes: notes || undefined } });
      toast({ title: 'Booking yangilandi' });
      onClose();
    } catch (error: unknown) {
      toast({ title: 'Yangilash xatosi', description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={`Booking #${id}`} description="Backenddagi to‘liq booking ma’lumoti" size="lg">
      {bookingQuery.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : bookingQuery.isError || !booking ? (
        <ErrorState size="sm" onRetry={() => bookingQuery.refetch()} />
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Racer', booking.user?.fullName ?? `User #${booking.userId}`],
              ['Event', booking.event?.name ?? `Event #${booking.eventId}`],
              ['Slot', displayDate(booking.scheduleSlot?.startsAt)],
              ['Transport', booking.vehicle?.name ?? 'Biriktirilmagan'],
              ['QR kod', booking.qrCode ?? '—'],
              ['Yaratilgan', displayDate(booking.bookedAt ?? booking.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Status
            <select name="status" defaultValue={booking.status} className={`${inputClass} mt-2`}>
              {BOOKING_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Izoh
            <textarea name="notes" defaultValue={booking.notes ?? ''} rows={3} className={`${inputClass} mt-2 resize-none`} />
          </label>
          <button type="submit" disabled={updateBooking.isPending} className="min-h-11 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50">
            {updateBooking.isPending ? 'Yangilanmoqda…' : 'O‘zgarishlarni saqlash'}
          </button>
        </form>
      )}
    </Modal>
  );
}

function AdminBookingsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>();
  const query = useAdminBookings({
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const bookings = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground font-heading"><BookOpen className="h-6 w-6 text-primary" /> Bookinglar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta?.total ?? 0} ta real booking</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Yangi booking
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Jami', meta?.total ?? 0, 'text-foreground'],
          ['Sahifadagi tasdiqlangan', bookings.filter((item) => item.status === 'CONFIRMED').length, 'text-green-400'],
          ['Sahifadagi check-in', bookings.filter((item) => item.status === 'CHECKED_IN').length, 'text-blue-400'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-2xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-bold font-display ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Racer, event yoki booking qidirish…" className={`${inputClass} pl-9`} />
        </div>
        <select value={status} onChange={(event) => { setStatus(event.target.value as BookingStatus | ''); setPage(1); }} className={`${inputClass} sm:w-52`}>
          <option value="">Barcha statuslar</option>
          {BOOKING_STATUSES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
        {query.isError ? (
          <ErrorState onRetry={() => query.refetch()} retrying={query.isFetching} />
        ) : !query.isLoading && bookings.length === 0 ? (
          <EmptyState icon={BookOpen} isFiltered={Boolean(search || status)} action={<button onClick={() => setCreateOpen(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Booking yaratish</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-border bg-muted/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr><th className="px-5 py-3">Booking</th><th className="px-5 py-3">Racer</th><th className="px-5 py-3">Event / Slot</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Summa</th><th className="px-5 py-3 text-right">Amal</th></tr>
              </thead>
              <tbody>
                {query.isLoading
                  ? Array.from({ length: 6 }).map((_, index) => <TableRowSkeleton key={index} cols={6} />)
                  : bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border/50 transition hover:bg-white/[0.025] last:border-0">
                      <td className="px-5 py-4"><p className="font-bold text-primary font-display">#{booking.id}</p><p className="mt-1 text-[10px] text-muted-foreground">{booking.qrCode ?? 'QR yaratilmagan'}</p></td>
                      <td className="px-5 py-4"><p className="text-sm font-semibold text-foreground">{booking.user?.fullName ?? `User #${booking.userId}`}</p><p className="text-xs text-muted-foreground">{booking.user?.phone ?? ''}</p></td>
                      <td className="px-5 py-4"><p className="text-sm text-foreground">{booking.event?.name ?? `Event #${booking.eventId}`}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" />{displayDate(booking.scheduleSlot?.startsAt)}</p></td>
                      <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-5 py-4 font-bold text-foreground font-display">{booking.amount ?? 0}</td>
                      <td className="px-5 py-4 text-right"><button onClick={() => setSelectedId(booking.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"><Eye className="h-4 w-4" /> Detail</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {meta && <TablePagination total={meta.total} page={meta.page} limit={meta.limit} totalPages={meta.totalPages} onPageChange={setPage} isLoading={query.isFetching} showingCount={bookings.length} />}
      {createOpen && <CreateBookingModal open onClose={() => setCreateOpen(false)} />}
      {selectedId !== undefined && <BookingDetailModal id={selectedId} onClose={() => setSelectedId(undefined)} />}
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  return user?.role === 'operator' ? <OperatorCheckInPanel /> : <AdminBookingsManager />;
}
