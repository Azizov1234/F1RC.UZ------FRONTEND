import { useState, type FormEvent } from 'react';
import { Gift, Plus, Search, UserPlus, ArrowRight, Pencil, Link2 } from 'lucide-react';
import {
  useCreateReferral,
  useReferral,
  useReferrals,
  useUpdateReferral,
  useUpdateReferralStatus,
} from '@/hooks/api/useReferrals';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import type { Referral, ReferralStatus } from '@/types';

const statuses: Array<'ALL' | ReferralStatus> = ['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'];
const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary';

function personName(referral: Referral, side: 'referrer' | 'referred') {
  if (side === 'referrer') return referral.referrer?.fullName ?? `User #${referral.referrerId}`;
  return referral.referredUser?.fullName ?? (referral.referredUserId ? `User #${referral.referredUserId}` : 'Hali biriktirilmagan');
}

function dateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo‘lmadi.';
}

export default function ReferralsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | ReferralStatus>('ALL');
  const [selectedId, setSelectedId] = useState<number>();
  const [editing, setEditing] = useState<Referral>();
  const [editorOpen, setEditorOpen] = useState(false);
  const referralsQuery = useReferrals({ search: search || undefined, status: status === 'ALL' ? undefined : status, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  const detailQuery = useReferral(selectedId);
  const updateStatus = useUpdateReferralStatus();
  const referrals = referralsQuery.data?.data ?? [];

  const changeStatus = (referral: Referral, nextStatus: ReferralStatus) => updateStatus.mutate(
    { id: referral.id, status: nextStatus },
    {
      onSuccess: () => toast({ title: 'Referral holati yangilandi' }),
      onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
    },
  );

  return <div className="space-y-5">
    <PageHeader title="Referrallar" subtitle="Taklif kodlari va referral lifecycle boshqaruvi" icon={Gift} actions={<Button onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus /> Referral yaratish</Button>} />

    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1 lg:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Kod yoki foydalanuvchi qidirish" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary" /></div>
      <div className="flex gap-2 overflow-x-auto">{statuses.map(item => <button key={item} type="button" onClick={() => setStatus(item)} className={`h-10 whitespace-nowrap rounded-xl border px-3 text-[11px] font-heading font-semibold ${status === item ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>{item === 'ALL' ? 'Barchasi' : item}</button>)}</div>
    </section>

    {referralsQuery.isError ? <ErrorState onRetry={() => referralsQuery.refetch()} /> : <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="overflow-hidden rounded-2xl border border-border bg-card/70">{referralsQuery.isLoading ? <div className="space-y-3 p-4"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div> : referrals.length === 0 ? <EmptyState icon={Gift} title="Referral topilmadi" /> : <div className="divide-y divide-border/70">{referrals.map(referral => <button key={referral.id} type="button" onClick={() => setSelectedId(referral.id)} className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/30 ${selectedId === referral.id ? 'bg-primary/5' : ''}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><UserPlus className="h-5 w-5 text-primary" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-heading font-bold text-foreground">{referral.code || `Referral #${referral.id}`}</p><StatusBadge status={referral.status} /></div><p className="mt-1 truncate text-xs text-muted-foreground">{personName(referral, 'referrer')} → {personName(referral, 'referred')}</p></div><ArrowRight className="h-4 w-4 text-muted-foreground" /></button>)}</div>}</section>
      <aside className="rounded-2xl border border-border bg-card/70 p-5 xl:sticky xl:top-20 xl:self-start">{!selectedId ? <EmptyState icon={Link2} title="Referralni tanlang" description="Detail va lifecycle amallari shu yerda." size="sm" /> : detailQuery.isLoading ? <ListItemSkeleton /> : detailQuery.isError || !detailQuery.data ? <ErrorState size="sm" onRetry={() => detailQuery.refetch()} /> : <ReferralDetail referral={detailQuery.data} pending={updateStatus.isPending} onEdit={() => { setEditing(detailQuery.data); setEditorOpen(true); }} onStatus={nextStatus => changeStatus(detailQuery.data, nextStatus)} />}</aside>
    </div>}

    {editorOpen && <ReferralEditor record={editing} onClose={() => setEditorOpen(false)} />}
  </div>;
}

function ReferralDetail({ referral, pending, onEdit, onStatus }: { referral: Referral; pending: boolean; onEdit: () => void; onStatus: (status: ReferralStatus) => void }) {
  return <div className="space-y-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-primary">Referral #{referral.id}</p><h2 className="mt-1 font-heading text-lg font-bold text-foreground">{referral.code || 'Kodsiz referral'}</h2></div><Button size="sm" variant="ghost" onClick={onEdit}><Pencil /></Button></div><div className="space-y-3 text-sm"><Detail label="Taklif qilgan" value={personName(referral, 'referrer')} /><Detail label="Taklif qilingan" value={personName(referral, 'referred')} /><Detail label="Yaratilgan" value={dateTime(referral.createdAt)} /><Detail label="Yakunlangan" value={dateTime(referral.completedAt)} /></div><div className="grid grid-cols-2 gap-2"><Button size="sm" variant={referral.status === 'PENDING' ? 'default' : 'outline'} disabled={pending || referral.status === 'PENDING'} onClick={() => onStatus('PENDING')}>PENDING</Button><Button size="sm" variant={referral.status === 'COMPLETED' ? 'default' : 'outline'} disabled={pending || referral.status === 'COMPLETED'} onClick={() => onStatus('COMPLETED')}>COMPLETED</Button><Button size="sm" variant="destructive" className="col-span-2" disabled={pending || referral.status === 'CANCELLED'} onClick={() => onStatus('CANCELLED')}>CANCELLED</Button></div></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value}</p></div>;
}

function ReferralEditor({ record, onClose }: { record?: Referral; onClose: () => void }) {
  const [referrerId, setReferrerId] = useState(record?.referrerId ? String(record.referrerId) : '');
  const [referredUserId, setReferredUserId] = useState(record?.referredUserId ? String(record.referredUserId) : '');
  const [code, setCode] = useState(record?.code ?? '');
  const [status, setStatus] = useState<ReferralStatus>((record?.status as ReferralStatus) ?? 'PENDING');
  const create = useCreateReferral();
  const update = useUpdateReferral();
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = { referrerId: Number(referrerId), referredUserId: referredUserId ? Number(referredUserId) : undefined, code: code.trim() || undefined, status }; const options = { onSuccess: onClose, onError: (error: unknown) => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' as const }) }; if (record) update.mutate({ id: record.id, data }, options); else create.mutate(data, options); };
  return <Modal isOpen onClose={onClose} title={record ? 'Referralni tahrirlash' : 'Referral yaratish'}><form onSubmit={submit} className="space-y-4"><label className="block text-xs text-muted-foreground">Referrer User ID<input required type="number" min="1" value={referrerId} onChange={event => setReferrerId(event.target.value)} className={inputClass} /></label><label className="block text-xs text-muted-foreground">Referred User ID<input type="number" min="1" value={referredUserId} onChange={event => setReferredUserId(event.target.value)} className={inputClass} /></label><label className="block text-xs text-muted-foreground">Taklif kodi<input value={code} onChange={event => setCode(event.target.value)} className={inputClass} /></label><label className="block text-xs text-muted-foreground">Holat<select value={status} onChange={event => setStatus(event.target.value as ReferralStatus)} className={inputClass}>{(['PENDING', 'COMPLETED', 'CANCELLED'] as ReferralStatus[]).map(value => <option key={value}>{value}</option>)}</select></label><div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={create.isPending || update.isPending}>Saqlash</Button></div></form></Modal>;
}
