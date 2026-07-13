import { type FormEvent, useState } from 'react';
import { CreditCard, DollarSign, Eye, Plus, Search, TrendingUp } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import TablePagination from '@/components/admin/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { useAdminBookings } from '@/hooks/api/useBookings';
import {
  useAdminPayment,
  useAdminPayments,
  useCreateAdminPayment,
  useUpdateAdminPayment,
} from '@/hooks/api/usePayments';
import type { CreatePaymentDto, UpdatePaymentDto } from '@/api/payments.api';
import type { ManualPaymentMethod, PaymentStatus } from '@/types';

const PAYMENT_STATUSES: PaymentStatus[] = [
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
];
const MANUAL_METHODS: ManualPaymentMethod[] = ['CASH', 'CARD', 'MANUAL'];
const inputClass =
  'w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10';

function isManualMethod(value: string): value is ManualPaymentMethod {
  return value === 'CASH' || value === 'CARD' || value === 'MANUAL';
}

function manualMethod(value: FormDataEntryValue | null): ManualPaymentMethod {
  const method = String(value);
  if (!isManualMethod(method)) throw new Error("Noto'g'ri manual to'lov usuli");
  return method;
}

function isPaymentStatus(value: string): value is PaymentStatus {
  return value === 'PENDING'
    || value === 'PAID'
    || value === 'FAILED'
    || value === 'CANCELLED'
    || value === 'REFUNDED';
}

function paymentStatus(value: FormDataEntryValue | null): PaymentStatus {
  const status = String(value);
  if (isPaymentStatus(status)) return status;
  throw new Error("Noto'g'ri to'lov statusi");
}

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

function money(amount: number, currency?: string | null): string {
  try {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: currency || 'UZS',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency || 'UZS'}`;
  }
}

function CreatePaymentModal({ onClose }: { onClose: () => void }) {
  const createPayment = useCreateAdminPayment();
  const bookings = useAdminBookings({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: CreatePaymentDto = {
      bookingId: Number(form.get('bookingId')),
      amount: Number(form.get('amount')),
      method: manualMethod(form.get('method')),
      status: paymentStatus(form.get('status')),
      currency: String(form.get('currency') ?? '').trim() || 'UZS',
      notes: String(form.get('notes') ?? '').trim() || undefined,
    };

    try {
      await createPayment.mutateAsync(payload);
      toast({ title: "To'lov yaratildi" });
      onClose();
    } catch (error: unknown) {
      toast({ title: "To'lov yaratilmadi", description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Yangi manual to'lov" description="Faqat CASH, CARD yoki MANUAL usulida admin to'lovi yaratiladi." size="lg">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Booking
          <select name="bookingId" required className={`${inputClass} mt-2`}>
            <option value="">Bookingni tanlang</option>
            {(bookings.data?.data ?? []).map((booking) => (
              <option key={booking.id} value={booking.id}>
                #{booking.id} · {booking.user?.fullName ?? `User #${booking.userId}`} · {booking.event?.name ?? `Event #${booking.eventId}`}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Summa
          <input name="amount" type="number" min="0" step="0.01" required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Valyuta
          <input name="currency" defaultValue="UZS" required className={`${inputClass} mt-2`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          To'lov usuli
          <select name="method" defaultValue="CASH" className={`${inputClass} mt-2`}>
            {MANUAL_METHODS.map((method) => <option key={method}>{method}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Status
          <select name="status" defaultValue="PAID" className={`${inputClass} mt-2`}>
            {PAYMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Izoh
          <textarea name="notes" rows={3} className={`${inputClass} mt-2 resize-none`} />
        </label>
        <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border px-4 text-sm text-muted-foreground hover:text-foreground">Bekor</button>
          <button type="submit" disabled={createPayment.isPending || bookings.isLoading} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50">
            {createPayment.isPending ? 'Saqlanmoqda…' : "To'lov yaratish"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentDetailModal({ id, onClose }: { id: number | string; onClose: () => void }) {
  const query = useAdminPayment(id);
  const updatePayment = useUpdateAdminPayment();
  const payment = query.data;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const method = String(form.get('method') ?? '');
    const payload: UpdatePaymentDto = {
      amount: Number(form.get('amount')),
      method: method ? manualMethod(method) : undefined,
      status: paymentStatus(form.get('status')),
      currency: String(form.get('currency') ?? '').trim() || undefined,
      notes: String(form.get('notes') ?? '').trim() || undefined,
    };

    try {
      await updatePayment.mutateAsync({ id, data: payload });
      toast({ title: "To'lov yangilandi" });
      onClose();
    } catch (error: unknown) {
      toast({ title: "To'lov yangilanmadi", description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={`To'lov #${id}`} description="Backenddagi to'liq to'lov ma'lumoti" size="lg">
      {query.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : query.isError || !payment ? (
        <ErrorState size="sm" onRetry={() => query.refetch()} />
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Booking', `#${payment.bookingId}`],
              ['Foydalanuvchi', payment.user?.fullName ?? payment.booking?.user?.fullName ?? (payment.userId ? `User #${payment.userId}` : '—')],
              ['Event', payment.booking?.event?.name ?? (payment.booking ? `Event #${payment.booking.eventId}` : '—')],
              ['Joriy usul', payment.method],
              ["To'langan vaqt", displayDate(payment.paidAt)],
              ['Yaratilgan', displayDate(payment.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Summa
              <input name="amount" type="number" min="0" step="0.01" defaultValue={payment.amount} required className={`${inputClass} mt-2`} />
            </label>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Valyuta
              <input name="currency" defaultValue={payment.currency ?? 'UZS'} className={`${inputClass} mt-2`} />
            </label>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Manual usulga almashtirish
              <select
                name="method"
                defaultValue={isManualMethod(payment.method) ? payment.method : ''}
                className={`${inputClass} mt-2`}
              >
                <option value="">Joriy usulni saqlash</option>
                {MANUAL_METHODS.map((method) => <option key={method}>{method}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Status
              <select name="status" defaultValue={payment.status} className={`${inputClass} mt-2`}>
                {PAYMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Izoh
            <textarea name="notes" defaultValue={payment.notes ?? ''} rows={3} className={`${inputClass} mt-2 resize-none`} />
          </label>
          <button type="submit" disabled={updatePayment.isPending} className="min-h-11 w-full rounded-xl bg-primary text-sm font-bold text-white disabled:opacity-50">
            {updatePayment.isPending ? 'Yangilanmoqda…' : "O'zgarishlarni saqlash"}
          </button>
        </form>
      )}
    </Modal>
  );
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [method, setMethod] = useState<ManualPaymentMethod | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>();
  const query = useAdminPayments({
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
    method: method || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const payments = query.data?.data ?? [];
  const meta = query.data?.meta;
  const paidAmount = payments.filter((payment) => payment.status === 'PAID').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments.filter((payment) => payment.status === 'PENDING').reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground font-heading"><CreditCard className="h-6 w-6 text-primary" /> To'lovlar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta?.total ?? 0} ta real to'lov</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90"><Plus className="h-4 w-4" /> Manual to'lov</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Sahifadagi tushum', value: money(paidAmount, payments.find((item) => item.status === 'PAID')?.currency), icon: DollarSign, color: 'text-green-400' },
          { label: 'Sahifadagi pending', value: money(pendingAmount, payments.find((item) => item.status === 'PENDING')?.currency), icon: CreditCard, color: 'text-yellow-400' },
          { label: "To'langan", value: payments.filter((item) => item.status === 'PAID').length, icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Qaytarilgan', value: payments.filter((item) => item.status === 'REFUNDED').length, icon: CreditCard, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-border bg-card/70 p-4">
            <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</p><p className={`mt-1 text-xl font-bold font-display ${stat.color}`}>{stat.value}</p></div>
            <stat.icon className={`h-5 w-5 opacity-60 ${stat.color}`} />
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card/60 p-3 md:grid-cols-[minmax(0,1fr)_13rem_12rem]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="ID, booking yoki foydalanuvchi…" className={`${inputClass} pl-9`} />
        </div>
        <select value={status} onChange={(event) => { setStatus(event.target.value as PaymentStatus | ''); setPage(1); }} className={inputClass}>
          <option value="">Barcha statuslar</option>
          {PAYMENT_STATUSES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={method} onChange={(event) => { setMethod(event.target.value as ManualPaymentMethod | ''); setPage(1); }} className={inputClass}>
          <option value="">Barcha manual usullar</option>
          {MANUAL_METHODS.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
        {query.isError ? (
          <ErrorState onRetry={() => query.refetch()} retrying={query.isFetching} />
        ) : !query.isLoading && payments.length === 0 ? (
          <EmptyState icon={CreditCard} isFiltered={Boolean(search || status || method)} action={<button onClick={() => setCreateOpen(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Manual to'lov yaratish</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-border bg-muted/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr><th className="px-5 py-3">ID</th><th className="px-5 py-3">Foydalanuvchi</th><th className="px-5 py-3">Booking / Event</th><th className="px-5 py-3">Usul</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Vaqt</th><th className="px-5 py-3 text-right">Summa</th><th className="px-5 py-3 text-right">Amal</th></tr>
              </thead>
              <tbody>
                {query.isLoading
                  ? Array.from({ length: 7 }).map((_, index) => <TableRowSkeleton key={index} cols={8} />)
                  : payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border/50 transition hover:bg-white/[0.025] last:border-0">
                      <td className="px-5 py-4 font-bold text-primary font-display">#{payment.id}</td>
                      <td className="px-5 py-4"><p className="text-sm font-semibold text-foreground">{payment.user?.fullName ?? payment.booking?.user?.fullName ?? (payment.userId ? `User #${payment.userId}` : '—')}</p><p className="text-xs text-muted-foreground">{payment.user?.phone ?? payment.booking?.user?.phone ?? ''}</p></td>
                      <td className="px-5 py-4"><p className="text-sm text-foreground">Booking #{payment.bookingId}</p><p className="text-xs text-muted-foreground">{payment.booking?.event?.name ?? ''}</p></td>
                      <td className="px-5 py-4"><span className="rounded-lg bg-muted px-2 py-1 text-xs font-bold text-foreground">{payment.method}</span></td>
                      <td className="px-5 py-4"><StatusBadge status={payment.status} /></td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{displayDate(payment.paidAt ?? payment.createdAt)}</td>
                      <td className="px-5 py-4 text-right font-bold text-foreground font-display">{money(payment.amount, payment.currency)}</td>
                      <td className="px-5 py-4 text-right"><button onClick={() => setSelectedId(payment.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"><Eye className="h-4 w-4" /> Detail</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {meta && <TablePagination total={meta.total} page={meta.page} limit={meta.limit} totalPages={meta.totalPages} onPageChange={setPage} isLoading={query.isFetching} showingCount={payments.length} />}
      {createOpen && <CreatePaymentModal onClose={() => setCreateOpen(false)} />}
      {selectedId !== undefined && <PaymentDetailModal id={selectedId} onClose={() => setSelectedId(undefined)} />}
    </div>
  );
}
