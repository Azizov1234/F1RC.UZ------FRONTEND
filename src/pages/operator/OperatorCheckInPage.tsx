import { useState, type FormEvent } from 'react';
import { CalendarClock, CheckCircle2, Hash, UserRound, Warehouse } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { ErrorState } from '@/components/ui/ErrorState';
import { useCheckInBooking } from '@/hooks/api/useBookings';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function OperatorCheckInPage() {
  const [input, setInput] = useState('');
  const [bookingId, setBookingId] = useState<number>();
  const checkIn = useCheckInBooking();
  const booking = checkIn.data?.id === bookingId ? checkIn.data : undefined;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = input.trim();
    if (!/^[1-9]\d*$/.test(normalized)) {
      setBookingId(undefined);
      checkIn.reset();
      return;
    }
    const id = Number(normalized);
    setBookingId(id);
    checkIn.reset();
    checkIn.mutate(id);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Booking ID check-in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Backend operator uchun lookup endpoint bermaydi. Musbat booking ID bevosita real check-in endpointiga yuboriladi.
        </p>
      </header>

      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5">
        <label htmlFor="booking-id" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Booking ID
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="booking-id"
              inputMode="numeric"
              pattern="[1-9][0-9]*"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Masalan: 1042"
              className="w-full rounded-lg border border-border bg-background py-3 pl-9 pr-4 font-mono text-sm text-foreground outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={checkIn.isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" /> {checkIn.isPending ? 'Check-in qilinmoqda…' : 'CHECK-IN QILISH'}
          </button>
        </div>
        {input.length > 0 && !/^[1-9]\d*$/.test(input.trim()) && (
          <p className="mt-2 text-xs text-red-400">Musbat raqam kiriting; QR yoki matnli kod qidiruvi mavjud emas.</p>
        )}
      </form>

      {bookingId !== undefined && checkIn.isError && (
        <div className="rounded-xl border border-red-500/20 bg-card">
          <ErrorState
            type="generic"
            title={`Booking #${bookingId} check-in qilinmadi`}
            description="ID, booking statusi va operator ruxsatini tekshirib qayta urinib ko‘ring."
          />
        </div>
      )}

      {booking && (
        <section className="overflow-hidden rounded-xl border border-emerald-500/25 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Backend tasdiqlagan booking</p>
              <h2 className="font-display text-xl font-bold text-foreground">#{booking.id}</h2>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <dl className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5" /> Racer</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{booking.user?.fullName || `User #${booking.userId}`}</dd>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground"><Warehouse className="h-3.5 w-3.5" /> Event</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{booking.event?.name || `Event #${booking.eventId}`}</dd>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" /> Slot</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{formatDate(booking.scheduleSlot?.startsAt)}</dd>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="text-xs text-muted-foreground">Mashina</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{booking.vehicle?.name || (booking.vehicleId ? `Vehicle #${booking.vehicleId}` : 'Biriktirilmagan')}</dd>
            </div>
          </dl>
          <div className="border-t border-border p-5">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-3 text-sm font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Check-in backendda bajarildi
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
