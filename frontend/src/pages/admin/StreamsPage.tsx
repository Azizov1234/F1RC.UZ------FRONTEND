import { useState, type FormEvent } from 'react';
import { ExternalLink, Pencil, Plus, Power, Radio, Search, Tv } from 'lucide-react';
import {
  useAdminStream,
  useAdminStreams,
  useCreateStream,
  usePublicStreams,
  useUpdateStream,
  useUpdateStreamStatus,
} from '@/hooks/api/useStreams';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { safeOpenWindow } from '@/lib/security';
import type { Stream, StreamStatus } from '@/types';

type View = 'admin' | 'public';
const statuses: StreamStatus[] = ['SCHEDULED', 'LIVE', 'ENDED', 'DISABLED'];
const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary';

function dateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function localDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Stream amalini bajarib bo‘lmadi.';
}

export default function StreamsPage() {
  const [view, setView] = useState<View>('admin');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | StreamStatus>('ALL');
  const [selectedId, setSelectedId] = useState<number>();
  const [editing, setEditing] = useState<Stream>();
  const [editorOpen, setEditorOpen] = useState(false);
  const adminQuery = useAdminStreams({ search: search || undefined, status: status === 'ALL' ? undefined : status, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }, view === 'admin');
  const publicQuery = usePublicStreams({ search: search || undefined, status: status === 'DISABLED' || status === 'ALL' ? undefined : status, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }, view === 'public');
  const detailQuery = useAdminStream(view === 'admin' ? selectedId : undefined);
  const updateStatus = useUpdateStreamStatus();
  const update = useUpdateStream();
  const activeQuery = view === 'admin' ? adminQuery : publicQuery;
  const streams = activeQuery.data?.data ?? [];
  const liveStreams = streams.filter(item => item.status === 'LIVE');

  const setStreamStatus = (stream: Stream, nextStatus: StreamStatus) => updateStatus.mutate(
    { id: stream.id, status: nextStatus },
    { onSuccess: () => toast({ title: 'Stream holati yangilandi' }), onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }) },
  );

  return <div className="space-y-5">
    <PageHeader title="Streamlar" subtitle="Public translyatsiyalar va admin stream lifecycle boshqaruvi" icon={Radio} actions={view === 'admin' ? <Button onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus /> Stream yaratish</Button> : undefined} />
    <div className="flex gap-2 rounded-2xl border border-border bg-card/70 p-2"><button type="button" onClick={() => { setView('admin'); setSelectedId(undefined); }} className={`h-11 flex-1 rounded-xl text-sm font-heading font-semibold ${view === 'admin' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'}`}>Admin boshqaruvi</button><button type="button" onClick={() => { setView('public'); setSelectedId(undefined); }} className={`h-11 flex-1 rounded-xl text-sm font-heading font-semibold ${view === 'public' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'}`}>Public preview</button></div>

    {liveStreams.map(stream => <section key={stream.id} className="flex flex-col gap-3 rounded-2xl border border-green-500/25 bg-green-500/10 p-5 sm:flex-row sm:items-center"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-500/30 bg-green-500/15"><Radio className="h-5 w-5 animate-pulse text-green-400" /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-widest text-green-400">Hozir jonli</p><p className="truncate font-heading font-bold text-foreground">{stream.title}</p></div><Button variant="outline" onClick={() => safeOpenWindow(stream.streamUrl)}><ExternalLink /> Ko‘rish</Button></section>)}

    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Stream qidirish" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary" /></div><select value={status} onChange={event => setStatus(event.target.value as 'ALL' | StreamStatus)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground"><option value="ALL">Barcha holatlar</option>{statuses.filter(item => view === 'admin' || item !== 'DISABLED').map(item => <option key={item}>{item}</option>)}</select></section>

    {activeQuery.isError ? <ErrorState onRetry={() => activeQuery.refetch()} /> : activeQuery.isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div> : streams.length === 0 ? <EmptyState icon={Tv} title="Streamlar yo‘q" /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{streams.map(stream => <article key={stream.id} className={`overflow-hidden rounded-2xl border bg-card/70 ${selectedId === stream.id ? 'border-primary' : 'border-border hover:border-primary/40'}`}><button type="button" onClick={() => view === 'admin' && setSelectedId(stream.id)} className="w-full text-left"><div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-zinc-900 to-black"><Tv className="h-10 w-10 text-muted-foreground" />{stream.status === 'LIVE' && <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-[9px] font-bold text-white">LIVE</span>}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><StatusBadge status={stream.status} /><span className={`rounded-full border px-2 py-0.5 text-[10px] ${stream.isActive ? 'border-green-500/20 text-green-400' : 'border-border text-muted-foreground'}`}>{stream.isActive ? 'ACTIVE' : 'INACTIVE'}</span></div><h2 className="mt-3 font-heading font-bold text-foreground">{stream.title}</h2><p className="mt-1 text-xs text-muted-foreground">{stream.event?.name ?? (stream.eventId ? `Event #${stream.eventId}` : 'Mustaqil stream')}</p><p className="mt-3 text-[10px] text-muted-foreground">{dateTime(stream.scheduledAt || stream.startedAt)}</p></div></button><div className="flex flex-wrap gap-2 border-t border-border p-3"><Button size="sm" variant="outline" onClick={() => safeOpenWindow(stream.streamUrl)}><ExternalLink /> Ochish</Button>{view === 'admin' && <><Button size="sm" variant="ghost" onClick={() => { setEditing(stream); setEditorOpen(true); }}><Pencil /> Tahrirlash</Button><Button size="sm" variant="ghost" onClick={() => update.mutate({ id: stream.id, data: { isActive: !stream.isActive } })}><Power /> {stream.isActive ? 'Nofaol' : 'Faol'}</Button></>}</div></article>)}</div>}

    {selectedId && view === 'admin' && <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">{detailQuery.isLoading ? <ListItemSkeleton /> : detailQuery.data ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex-1"><p className="text-[10px] uppercase tracking-widest text-primary">Stream detail endpoint</p><p className="mt-1 font-heading font-bold text-foreground">{detailQuery.data.title}</p><p className="mt-1 text-xs text-muted-foreground">{detailQuery.data.streamUrl}</p></div><div className="flex flex-wrap gap-2">{statuses.filter(item => item !== detailQuery.data?.status).map(item => <Button key={item} size="sm" variant={item === 'DISABLED' ? 'destructive' : 'outline'} onClick={() => detailQuery.data && setStreamStatus(detailQuery.data, item)} disabled={updateStatus.isPending}>{item}</Button>)}</div><button type="button" onClick={() => setSelectedId(undefined)} className="text-xs text-muted-foreground">Yopish</button></div> : <ErrorState size="sm" onRetry={() => detailQuery.refetch()} />}</section>}
    {editorOpen && <StreamEditor record={editing} onClose={() => setEditorOpen(false)} />}
  </div>;
}

function StreamEditor({ record, onClose }: { record?: Stream; onClose: () => void }) {
  const [eventId, setEventId] = useState(record?.eventId ? String(record.eventId) : '');
  const [title, setTitle] = useState(record?.title ?? '');
  const [streamUrl, setStreamUrl] = useState(record?.streamUrl ?? '');
  const [status, setStatus] = useState<StreamStatus>(record?.status ?? 'SCHEDULED');
  const [scheduledAt, setScheduledAt] = useState(localDate(record?.scheduledAt));
  const [startedAt, setStartedAt] = useState(localDate(record?.startedAt));
  const [endedAt, setEndedAt] = useState(localDate(record?.endedAt));
  const [isActive, setIsActive] = useState(record?.isActive ?? true);
  const create = useCreateStream();
  const update = useUpdateStream();
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = { eventId: eventId ? Number(eventId) : undefined, title: title.trim(), streamUrl: streamUrl.trim(), status, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined, startedAt: startedAt ? new Date(startedAt).toISOString() : undefined, endedAt: endedAt ? new Date(endedAt).toISOString() : undefined, isActive }; const options = { onSuccess: onClose, onError: (error: unknown) => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' as const }) }; if (record) update.mutate({ id: record.id, data }, options); else create.mutate(data, options); };
  return <Modal isOpen onClose={onClose} title={record ? 'Streamni tahrirlash' : 'Yangi stream'} size="lg"><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="text-xs text-muted-foreground">Sarlavha<input required value={title} onChange={event => setTitle(event.target.value)} className={inputClass} /></label><label className="text-xs text-muted-foreground">Event ID<input type="number" min="1" value={eventId} onChange={event => setEventId(event.target.value)} className={inputClass} /></label><label className="sm:col-span-2 text-xs text-muted-foreground">Stream URL<input required type="url" value={streamUrl} onChange={event => setStreamUrl(event.target.value)} className={inputClass} /></label><label className="text-xs text-muted-foreground">Holat<select value={status} onChange={event => setStatus(event.target.value as StreamStatus)} className={inputClass}>{statuses.map(value => <option key={value}>{value}</option>)}</select></label><label className="text-xs text-muted-foreground">Rejalashtirilgan<input type="datetime-local" value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} className={inputClass} /></label><label className="text-xs text-muted-foreground">Boshlangan<input type="datetime-local" value={startedAt} onChange={event => setStartedAt(event.target.value)} className={inputClass} /></label><label className="text-xs text-muted-foreground">Tugagan<input type="datetime-local" value={endedAt} onChange={event => setEndedAt(event.target.value)} className={inputClass} /></label><label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isActive} onChange={event => setIsActive(event.target.checked)} /> Faol</label><div className="sm:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={create.isPending || update.isPending}>Saqlash</Button></div></form></Modal>;
}
