import { useState, type FormEvent } from 'react';
import { Bell, BellRing, Check, Inbox, Pencil, Plus, Search, Send } from 'lucide-react';
import {
  useAdminNotification,
  useAdminNotifications,
  useCreateNotification,
  useMarkNotificationAsRead,
  useMyNotifications,
  useUpdateNotification,
  useUpdateNotificationStatus,
} from '@/hooks/api/useNotifications';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import type { Notification, NotificationStatus, NotificationType } from '@/types';

type Tab = 'admin' | 'inbox';
const notificationTypes: NotificationType[] = ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'BOOKING', 'PAYMENT', 'RACE', 'SYSTEM'];
const statuses: NotificationStatus[] = ['UNREAD', 'READ', 'ARCHIVED'];
const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary';

function dateTime(value?: string) {
  return value ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo‘lmadi.';
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('admin');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | NotificationStatus>('ALL');
  const [selectedId, setSelectedId] = useState<number>();
  const [editing, setEditing] = useState<Notification>();
  const [editorOpen, setEditorOpen] = useState(false);
  const adminQuery = useAdminNotifications({ search: search || undefined, status: status === 'ALL' ? undefined : status, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  const inboxQuery = useMyNotifications({ status: status === 'ALL' ? undefined : status, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  const detailQuery = useAdminNotification(tab === 'admin' ? selectedId : undefined);
  const markRead = useMarkNotificationAsRead();
  const updateStatus = useUpdateNotificationStatus();
  const activeQuery = tab === 'admin' ? adminQuery : inboxQuery;
  const rows = activeQuery.data?.data ?? [];
  const selectedInbox = tab === 'inbox' ? rows.find(item => item.id === selectedId) : undefined;
  const selected = tab === 'admin' ? detailQuery.data : selectedInbox;

  const setNotificationStatus = (notification: Notification, nextStatus: NotificationStatus) => updateStatus.mutate(
    { id: notification.id, status: nextStatus },
    {
      onSuccess: () => toast({ title: 'Xabar holati yangilandi' }),
      onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
    },
  );

  return <div className="space-y-5">
    <PageHeader title="Bildirishnomalar" subtitle="Admin CRUD va shaxsiy inbox bir sahifada" icon={BellRing} actions={tab === 'admin' ? <Button onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus /> Xabar yaratish</Button> : undefined} />
    <div className="flex gap-2 rounded-2xl border border-border bg-card/70 p-2"><button type="button" onClick={() => { setTab('admin'); setSelectedId(undefined); }} className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-heading font-semibold ${tab === 'admin' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'}`}><Send className="h-4 w-4" /> Admin xabarlari</button><button type="button" onClick={() => { setTab('inbox'); setSelectedId(undefined); }} className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-heading font-semibold ${tab === 'inbox' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'}`}><Inbox className="h-4 w-4" /> My inbox</button></div>
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row">{tab === 'admin' && <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Sarlavha yoki matn qidirish" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary" /></div>}<select value={status} onChange={event => setStatus(event.target.value as 'ALL' | NotificationStatus)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground"><option value="ALL">Barcha holatlar</option>{statuses.map(value => <option key={value}>{value}</option>)}</select></section>

    {activeQuery.isError ? <ErrorState onRetry={() => activeQuery.refetch()} /> : <div className="grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
      <section className="overflow-hidden rounded-2xl border border-border bg-card/70">{activeQuery.isLoading ? <div className="space-y-3 p-4"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div> : rows.length === 0 ? <EmptyState icon={Bell} title="Bildirishnomalar yo‘q" /> : <div className="divide-y divide-border/70">{rows.map(notification => <button key={notification.id} type="button" onClick={() => setSelectedId(notification.id)} className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/30 ${selectedId === notification.id ? 'bg-primary/5' : ''}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.status === 'UNREAD' ? 'bg-primary shadow-[0_0_10px_rgba(255,0,0,.8)]' : 'bg-muted-foreground/40'}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-heading text-sm font-bold text-foreground">{notification.title}</p><StatusBadge status={notification.status} /><span className="rounded-full border border-border px-2 py-0.5 text-[9px] text-muted-foreground">{notification.type}</span></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p><p className="mt-2 text-[10px] text-muted-foreground">{dateTime(notification.createdAt)}</p></div></button>)}</div>}</section>
      <aside className="rounded-2xl border border-border bg-card/70 p-5 xl:sticky xl:top-20 xl:self-start">{!selectedId ? <EmptyState icon={Inbox} title="Xabarni tanlang" size="sm" /> : (tab === 'admin' && detailQuery.isLoading) ? <ListItemSkeleton /> : !selected ? <ErrorState type="notfound" size="sm" /> : <div className="space-y-5"><div><p className="text-[10px] uppercase tracking-widest text-primary">{tab === 'admin' ? 'Admin detail endpoint' : 'My notification'}</p><h2 className="mt-1 font-heading text-lg font-bold text-foreground">{selected.title}</h2><div className="mt-2 flex gap-2"><StatusBadge status={selected.status} /><span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{selected.type}</span></div></div><p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{selected.message}</p>{selected.data && <pre className="max-h-44 overflow-auto rounded-xl bg-background p-3 text-xs text-foreground">{JSON.stringify(selected.data, null, 2)}</pre>}<div className="flex flex-wrap gap-2">{tab === 'inbox' && selected.status === 'UNREAD' && <Button size="sm" onClick={() => markRead.mutate(selected.id)} disabled={markRead.isPending}><Check /> O‘qildi</Button>}{tab === 'admin' && <><Button size="sm" variant="outline" onClick={() => { setEditing(selected); setEditorOpen(true); }}><Pencil /> Tahrirlash</Button>{statuses.map(value => value !== selected.status && <Button key={value} size="sm" variant={value === 'ARCHIVED' ? 'destructive' : 'ghost'} onClick={() => setNotificationStatus(selected, value)} disabled={updateStatus.isPending}>{value}</Button>)}</>}</div></div>}</aside>
    </div>}
    {editorOpen && <NotificationEditor record={editing} onClose={() => setEditorOpen(false)} />}
  </div>;
}

function NotificationEditor({ record, onClose }: { record?: Notification; onClose: () => void }) {
  const [userId, setUserId] = useState(record ? String(record.userId) : '');
  const [type, setType] = useState<NotificationType>(record?.type ?? 'INFO');
  const [title, setTitle] = useState(record?.title ?? '');
  const [message, setMessage] = useState(record?.message ?? '');
  const [status, setStatus] = useState<NotificationStatus>(record?.status ?? 'UNREAD');
  const [dataText, setDataText] = useState(record?.data ? JSON.stringify(record.data, null, 2) : '');
  const create = useCreateNotification();
  const update = useUpdateNotification();
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); let data: Record<string, unknown> | undefined; if (dataText.trim()) { const parsed: unknown = JSON.parse(dataText); if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('Data JSON object bo‘lishi kerak'); data = parsed as Record<string, unknown>; } const payload = { type, title: title.trim(), message: message.trim(), status, data }; const options = { onSuccess: onClose, onError: (error: unknown) => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' as const }) }; if (record) update.mutate({ id: record.id, data: payload }, options); else create.mutate({ userId: Number(userId), ...payload }, options); };
  return <Modal isOpen onClose={onClose} title={record ? 'Xabarni tahrirlash' : 'Yangi bildirishnoma'} size="lg"><form onSubmit={event => { try { submit(event); } catch (error) { event.preventDefault(); toast({ title: 'JSON xatosi', description: messageOf(error), variant: 'destructive' }); } }} className="grid gap-4 sm:grid-cols-2">{!record && <label className="text-xs text-muted-foreground">User ID<input required type="number" min="1" value={userId} onChange={event => setUserId(event.target.value)} className={inputClass} /></label>}<label className="text-xs text-muted-foreground">Turi<select value={type} onChange={event => setType(event.target.value as NotificationType)} className={inputClass}>{notificationTypes.map(value => <option key={value}>{value}</option>)}</select></label><label className="text-xs text-muted-foreground">Holat<select value={status} onChange={event => setStatus(event.target.value as NotificationStatus)} className={inputClass}>{statuses.map(value => <option key={value}>{value}</option>)}</select></label><label className="sm:col-span-2 text-xs text-muted-foreground">Sarlavha<input required value={title} onChange={event => setTitle(event.target.value)} className={inputClass} /></label><label className="sm:col-span-2 text-xs text-muted-foreground">Xabar<textarea required rows={4} value={message} onChange={event => setMessage(event.target.value)} className={`${inputClass} h-auto py-3`} /></label><label className="sm:col-span-2 text-xs text-muted-foreground">Data (JSON object)<textarea rows={4} value={dataText} onChange={event => setDataText(event.target.value)} className={`${inputClass} h-auto py-3 font-mono`} /></label><div className="sm:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={create.isPending || update.isPending}><Send /> Yuborish</Button></div></form></Modal>;
}
