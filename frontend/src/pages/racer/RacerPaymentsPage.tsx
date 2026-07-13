import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, CreditCard, Plus, ReceiptText, WalletCards } from 'lucide-react';
import { paymentsApi } from '@/api/payments.api';
import { bookingsApi } from '@/api/bookings.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import type { ManualPaymentMethod, PaymentStatus } from '@/types';

const methods: ManualPaymentMethod[] = ['CASH', 'CARD', 'MANUAL'];
const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary';

function dateTime(value?: string) {
  return value ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'To‘lovni yaratib bo‘lmadi.';
}

export default function RacerPaymentsPage() {
  const [status, setStatus] = useState<'ALL' | PaymentStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const paymentsQuery = useQuery({
    queryKey: queryKeys.payments.mine({ status }),
    queryFn: () => paymentsApi.getMyPayments({ status: status === 'ALL' ? undefined : status, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
  });
  const payments = paymentsQuery.data?.data ?? [];
  const totalPaid = payments.filter(item => item.status === 'PAID').reduce((sum, item) => sum + item.amount, 0);

  return <div className="space-y-5">
    <PageHeader title="To‘lovlarim" subtitle="Manual to‘lov yaratish va payment tarixini ko‘rish" icon={WalletCards} actions={<Button onClick={() => setModalOpen(true)}><Plus /> To‘lov yaratish</Button>} />
    <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-border bg-card/70 p-4"><Banknote className="h-5 w-5 text-green-400" /><p className="mt-4 font-display text-2xl font-bold text-foreground">{totalPaid.toLocaleString()} UZS</p><p className="text-xs text-muted-foreground">Muvaffaqiyatli to‘lovlar</p></div><div className="rounded-2xl border border-border bg-card/70 p-4"><ReceiptText className="h-5 w-5 text-primary" /><p className="mt-4 font-display text-2xl font-bold text-foreground">{payments.length}</p><p className="text-xs text-muted-foreground">Jami tranzaksiya</p></div></div>
    <div className="flex gap-2 overflow-x-auto">{(['ALL', 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'] as Array<'ALL' | PaymentStatus>).map(item => <button key={item} type="button" onClick={() => setStatus(item)} className={`h-10 whitespace-nowrap rounded-xl border px-3 text-[11px] font-semibold ${status === item ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-card text-muted-foreground'}`}>{item === 'ALL' ? 'Barchasi' : item}</button>)}</div>
    {paymentsQuery.isError ? <ErrorState onRetry={() => paymentsQuery.refetch()} /> : paymentsQuery.isLoading ? <div className="space-y-3"><ListItemSkeleton /><ListItemSkeleton /></div> : payments.length === 0 ? <EmptyState icon={CreditCard} title="To‘lovlar yo‘q" description="Booking uchun birinchi manual to‘lovni yarating." /> : <div className="space-y-3">{payments.map(payment => <article key={payment.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row sm:items-center"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><CreditCard className="h-5 w-5 text-primary" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-heading font-bold text-foreground">{payment.amount.toLocaleString()} {payment.currency || 'UZS'}</p><StatusBadge status={payment.status} /></div><p className="mt-1 text-xs text-muted-foreground">Booking #{payment.bookingId} · {payment.method} · {dateTime(payment.createdAt)}</p></div>{payment.notes && <p className="max-w-sm text-xs text-muted-foreground">{payment.notes}</p>}</article>)}</div>}
    {modalOpen && <PaymentEditor onClose={() => setModalOpen(false)} />}
  </div>;
}

function PaymentEditor({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [bookingId, setBookingId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<ManualPaymentMethod>('CASH');
  const [notes, setNotes] = useState('');
  const bookingsQuery = useQuery({ queryKey: queryKeys.bookings.mine({ limit: 100 }), queryFn: () => bookingsApi.getMyBookings({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }) });
  const bookings = bookingsQuery.data?.data ?? [];
  const mutation = useMutation({ mutationFn: () => paymentsApi.createMyPayment({ bookingId: Number(bookingId), amount: Number(amount), method, currency: 'UZS', notes: notes.trim() || undefined }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.payments.all() }); onClose(); toast({ title: 'To‘lov so‘rovi yaratildi' }); }, onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }) });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); mutation.mutate(); };
  return <Modal isOpen onClose={onClose} title="Manual to‘lov yaratish" description="Frontend faqat CASH, CARD va MANUAL usullarini ko‘rsatadi."><form onSubmit={submit} className="space-y-4"><label className="block text-xs text-muted-foreground">Booking<select required value={bookingId} onChange={event => setBookingId(event.target.value)} className={inputClass}><option value="">Booking tanlang</option>{bookings.map(booking => <option key={booking.id} value={booking.id}>#{booking.id} · {booking.event?.name ?? 'Event'} · {booking.amount?.toLocaleString() ?? '—'} UZS</option>)}</select></label><label className="block text-xs text-muted-foreground">Miqdor (UZS)<input required type="number" min="1" value={amount} onChange={event => setAmount(event.target.value)} className={inputClass} /></label><label className="block text-xs text-muted-foreground">Usul<select value={method} onChange={event => setMethod(event.target.value as ManualPaymentMethod)} className={inputClass}>{methods.map(value => <option key={value}>{value}</option>)}</select></label><label className="block text-xs text-muted-foreground">Izoh<textarea rows={3} value={notes} onChange={event => setNotes(event.target.value)} className={`${inputClass} h-auto py-3`} /></label><div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={mutation.isPending || bookingsQuery.isLoading}>Yaratish</Button></div></form></Modal>;
}
