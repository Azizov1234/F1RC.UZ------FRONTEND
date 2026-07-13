import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Flag, Gauge, Medal, Pencil, Plus, Timer, Users } from 'lucide-react';
import { raceSessionsApi } from '@/api/race-sessions.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import {
  useCreateRaceParticipant,
  useRaceParticipant,
  useRaceParticipants,
  useUpdateRaceParticipant,
} from '@/hooks/api/useRaceParticipants';
import { useRaceLap, useRaceLaps, useUpdateRaceLap } from '@/hooks/api/useRaceLaps';
import { useCreateRaceResult, useRaceResult, useRaceResults, useUpdateRaceResult } from '@/hooks/api/useRaceResults';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import type {
  RaceLap,
  RaceParticipant,
  RaceParticipantStatus,
  RaceResult,
  RaceSessionStatus,
} from '@/types';

type Tab = 'overview' | 'participants' | 'laps' | 'results';
type Editor =
  | { kind: 'session' }
  | { kind: 'participant'; record?: RaceParticipant }
  | { kind: 'lap'; record: RaceLap }
  | { kind: 'result'; record?: RaceResult };

const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary';

function dateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function formatMs(value?: number | null) {
  if (value === undefined || value === null) return '—';
  const minutes = Math.floor(value / 60_000);
  const seconds = Math.floor((value % 60_000) / 1000);
  const milliseconds = value % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo‘lmadi.';
}

export default function RaceSessionDetailPage() {
  const { id = '' } = useParams();
  const sessionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [editor, setEditor] = useState<Editor>();
  const [selectedParticipantId, setSelectedParticipantId] = useState<number>();
  const [selectedLapId, setSelectedLapId] = useState<number>();
  const [selectedResultId, setSelectedResultId] = useState<number>();

  const sessionQuery = useQuery({
    queryKey: queryKeys.raceSessions.detail(id),
    queryFn: async () => (await raceSessionsApi.getRaceSessionById(id)).data,
    enabled: Number.isFinite(sessionId) && sessionId > 0,
  });
  const participantsQuery = useRaceParticipants({ raceSessionId: sessionId, limit: 100, sortBy: 'startPosition', sortOrder: 'asc' });
  const lapsQuery = useRaceLaps({ raceSessionId: sessionId, limit: 100, sortBy: 'lapNumber', sortOrder: 'asc' });
  const resultsQuery = useRaceResults({ raceSessionId: sessionId, limit: 100, sortBy: 'position', sortOrder: 'asc' });
  const participantDetail = useRaceParticipant(selectedParticipantId);
  const lapDetail = useRaceLap(selectedLapId);
  const resultDetail = useRaceResult(selectedResultId);

  const invalidateSession = () => queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
  const updateStatus = useMutation({
    mutationFn: (status: RaceSessionStatus) => raceSessionsApi.updateRaceSessionStatus(sessionId, status),
    onSuccess: () => { invalidateSession(); toast({ title: 'Sessiya holati yangilandi' }); },
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });

  const session = sessionQuery.data;
  const participants = participantsQuery.data?.data ?? [];
  const laps = lapsQuery.data?.data ?? [];
  const results = resultsQuery.data?.data ?? [];

  if (!Number.isFinite(sessionId) || sessionId < 1) return <ErrorState type="notfound" title="Sessiya identifikatori noto‘g‘ri" />;
  if (sessionQuery.isLoading) return <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>;
  if (sessionQuery.isError || !session) return <ErrorState type="notfound" onRetry={() => sessionQuery.refetch()} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title={session.name || `Sessiya #${session.id}`}
        subtitle={`${session.event?.name ?? 'Event'} · ${dateTime(session.scheduledAt)}`}
        icon={Flag}
        breadcrumbs={[{ label: 'Poyga sessiyalari', onClick: () => navigate('/admin/race-sessions') }, { label: `#${session.id}` }]}
        badge={{ label: session.status, color: session.status === 'ONGOING' ? 'green' : session.status === 'CANCELLED' ? 'red' : 'gray' }}
        actions={<Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft /> Orqaga</Button>}
      />

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card/70 p-2">
        {([
          ['overview', 'Umumiy', Gauge],
          ['participants', `Ishtirokchilar (${participants.length})`, Users],
          ['laps', `Aylanalar (${laps.length})`, Timer],
          ['results', `Natijalar (${results.length})`, Medal],
        ] as const).map(([value, label, Icon]) => <button key={value} type="button" onClick={() => setTab(value)} className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-heading font-semibold transition ${tab === value ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}><Icon className="h-4 w-4" /> {label}</button>)}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-2xl border border-border bg-card/70 p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.2em] text-primary">Race Control</p><h2 className="mt-1 font-heading text-xl font-bold text-foreground">Sessiya lifecycle</h2></div><Button size="sm" variant="outline" onClick={() => setEditor({ kind: 'session' })}><Pencil /> Tahrirlash</Button></div>
            <div className="mt-6 grid grid-cols-2 gap-3"><Stat label="Rejalashtirilgan" value={dateTime(session.scheduledAt)} /><Stat label="Boshlangan" value={dateTime(session.startedAt)} /><Stat label="Tugagan" value={dateTime(session.finishedAt)} /><Stat label="Ishtirokchilar" value={String(participants.length)} /></div>
          </section>
          <section className="rounded-2xl border border-border bg-card/70 p-5"><h2 className="font-heading font-bold text-foreground">Admin status boshqaruvi</h2><p className="mt-1 text-xs text-muted-foreground">Faqat backend enumidagi holatlar yuboriladi.</p><div className="mt-5 grid grid-cols-2 gap-2">{(['PENDING', 'ONGOING', 'PAUSED', 'COMPLETED', 'CANCELLED'] as RaceSessionStatus[]).map(status => <Button key={status} size="sm" variant={session.status === status ? 'default' : 'outline'} disabled={session.status === status || updateStatus.isPending} onClick={() => updateStatus.mutate(status)}>{status}</Button>)}</div></section>
        </div>
      )}

      {tab === 'participants' && (
        <ResourceSection title="Ishtirokchilar" description="Racer, mashina, start pozitsiyasi va poyga holati" action={<Button onClick={() => setEditor({ kind: 'participant' })}><Plus /> Ishtirokchi</Button>} loading={participantsQuery.isLoading} error={participantsQuery.isError} retry={() => participantsQuery.refetch()} empty={participants.length === 0} icon={Users}>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card/70"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground"><tr><th className="px-4 py-3">Start</th><th className="px-4 py-3">Racer</th><th className="px-4 py-3">Mashina</th><th className="px-4 py-3">Holat</th><th className="px-4 py-3 text-right">Amal</th></tr></thead><tbody className="divide-y divide-border/70">{participants.map(item => <tr key={item.id} className={selectedParticipantId === item.id ? 'bg-primary/5' : ''}><td className="px-4 py-3 font-display font-bold text-primary">#{item.startPosition ?? '—'}</td><td className="px-4 py-3"><button type="button" onClick={() => setSelectedParticipantId(item.id)} className="font-semibold text-foreground hover:text-primary">{item.user?.fullName ?? `User #${item.userId}`}</button></td><td className="px-4 py-3 text-muted-foreground">{item.vehicle?.name ?? '—'}</td><td className="px-4 py-3"><StatusBadge status={item.status} /></td><td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => setEditor({ kind: 'participant', record: item })}><Pencil /> Yangilash</Button></td></tr>)}</tbody></table></div>
          {selectedParticipantId && <DetailLine label="Participant detail" loading={participantDetail.isLoading} text={`${participantDetail.data?.user?.fullName ?? `#${selectedParticipantId}`} · ${participantDetail.data?.status ?? ''}`} onClose={() => setSelectedParticipantId(undefined)} />}
        </ResourceSection>
      )}

      {tab === 'laps' && (
        <ResourceSection title="Aylanalar" description="Lap yozuvlari va validlik nazorati" loading={lapsQuery.isLoading} error={lapsQuery.isError} retry={() => lapsQuery.refetch()} empty={laps.length === 0} icon={Timer}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{laps.map(lap => <button key={lap.id} type="button" onClick={() => setSelectedLapId(lap.id)} className={`rounded-2xl border bg-card/70 p-4 text-left transition ${selectedLapId === lap.id ? 'border-primary' : 'border-border hover:border-primary/40'}`}><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Lap #{lap.lapNumber}</p><p className="mt-1 font-mono text-xl font-bold text-foreground">{formatMs(lap.lapTimeMs)}</p></div><span className={`rounded-full border px-2 py-0.5 text-[10px] ${lap.isValid ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>{lap.isValid ? 'VALID' : 'INVALID'}</span></div><p className="mt-3 text-xs text-muted-foreground">Participant #{lap.participantId} · Penalty {lap.penaltyMs ?? 0} ms</p><Button size="sm" variant="ghost" className="mt-2" onClick={event => { event.stopPropagation(); setEditor({ kind: 'lap', record: lap }); }}><Pencil /> Yangilash</Button></button>)}</div>
          {selectedLapId && <DetailLine label="Lap detail" loading={lapDetail.isLoading} text={`Lap #${lapDetail.data?.lapNumber ?? '—'} · ${formatMs(lapDetail.data?.lapTimeMs)}`} onClose={() => setSelectedLapId(undefined)} />}
        </ResourceSection>
      )}

      {tab === 'results' && (
        <ResourceSection title="Natijalar" description="Podium, ball va yakuniy poyga natijasi" action={<Button onClick={() => setEditor({ kind: 'result' })}><Plus /> Natija qo‘shish</Button>} loading={resultsQuery.isLoading} error={resultsQuery.isError} retry={() => resultsQuery.refetch()} empty={results.length === 0} icon={Medal}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{results.map(result => <article key={result.id} className={`rounded-2xl border bg-card/70 p-4 ${selectedResultId === result.id ? 'border-primary' : 'border-border'}`}><button type="button" onClick={() => setSelectedResultId(result.id)} className="w-full text-left"><div className="flex items-center gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-xl font-display text-xl font-bold ${result.position === 1 ? 'bg-yellow-500/15 text-yellow-400' : result.position === 2 ? 'bg-zinc-400/15 text-zinc-300' : result.position === 3 ? 'bg-orange-500/15 text-orange-400' : 'bg-muted text-muted-foreground'}`}>{result.position ?? '—'}</div><div><p className="font-heading font-bold text-foreground">{result.user?.fullName ?? `User #${result.userId}`}</p><p className="text-xs text-muted-foreground">{result.points ?? 0} ball</p></div></div></button><Button size="sm" variant="ghost" className="mt-3" onClick={() => setEditor({ kind: 'result', record: result })}><Pencil /> Yangilash</Button></article>)}</div>
          {selectedResultId && <DetailLine label="Result detail" loading={resultDetail.isLoading} text={`${resultDetail.data?.user?.fullName ?? `#${selectedResultId}`} · ${resultDetail.data?.points ?? 0} ball`} onClose={() => setSelectedResultId(undefined)} />}
        </ResourceSection>
      )}

      {editor?.kind === 'session' && <SessionEditor sessionId={sessionId} name={session.name ?? ''} scheduledAt={session.scheduledAt} onClose={() => setEditor(undefined)} />}
      {editor?.kind === 'participant' && <ParticipantEditor sessionId={sessionId} record={editor.record} onClose={() => setEditor(undefined)} />}
      {editor?.kind === 'lap' && <LapEditor record={editor.record} onClose={() => setEditor(undefined)} />}
      {editor?.kind === 'result' && <ResultEditor sessionId={sessionId} participants={participants} record={editor.record} onClose={() => setEditor(undefined)} />}
    </div>
  );
}

function ResourceSection({ title, description, action, loading, error, retry, empty, icon: Icon, children }: { title: string; description: string; action?: ReactNode; loading: boolean; error: boolean; retry: () => void; empty: boolean; icon: typeof Users; children: ReactNode }) {
  return <section className="space-y-4"><div className="flex items-center justify-between gap-3"><div><h2 className="font-heading text-lg font-bold text-foreground">{title}</h2><p className="text-xs text-muted-foreground">{description}</p></div>{action}</div>{error ? <ErrorState onRetry={retry} /> : loading ? <div className="space-y-3"><ListItemSkeleton /><ListItemSkeleton /></div> : empty ? <EmptyState icon={Icon} title={`${title} mavjud emas`} /> : children}</section>;
}

function DetailLine({ label, loading, text, onClose }: { label: string; loading: boolean; text: string; onClose: () => void }) {
  return <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-primary">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{loading ? 'Yuklanmoqda…' : text}</p></div><button type="button" onClick={onClose} className="text-xs text-muted-foreground">Yopish</button></div></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div>;
}

function SessionEditor({ sessionId, name: initialName, scheduledAt, onClose }: { sessionId: number; name: string; scheduledAt?: string | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(scheduledAt ? new Date(new Date(scheduledAt).getTime() - new Date(scheduledAt).getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : '');
  const mutation = useMutation({ mutationFn: () => raceSessionsApi.updateRaceSession(sessionId, { name: name.trim() || undefined, scheduledAt: date ? new Date(date).toISOString() : undefined }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() }); onClose(); }, onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }) });
  return <Modal isOpen onClose={onClose} title="Sessiyani tahrirlash"><form onSubmit={event => { event.preventDefault(); mutation.mutate(); }} className="space-y-4"><Field label="Nomi"><input value={name} onChange={event => setName(event.target.value)} className={inputClass} /></Field><Field label="Rejalashtirilgan vaqt"><input type="datetime-local" value={date} onChange={event => setDate(event.target.value)} className={inputClass} /></Field><Actions onClose={onClose} pending={mutation.isPending} /></form></Modal>;
}

function ParticipantEditor({ sessionId, record, onClose }: { sessionId: number; record?: RaceParticipant; onClose: () => void }) {
  const [userId, setUserId] = useState(record ? String(record.userId) : '');
  const [vehicleId, setVehicleId] = useState(record?.vehicleId ? String(record.vehicleId) : '');
  const [bookingId, setBookingId] = useState(record?.bookingId ? String(record.bookingId) : '');
  const [startPosition, setStartPosition] = useState(record?.startPosition ? String(record.startPosition) : '');
  const [status, setStatus] = useState<RaceParticipantStatus>((record?.status as RaceParticipantStatus) ?? 'REGISTERED');
  const create = useCreateRaceParticipant();
  const update = useUpdateRaceParticipant();
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const options = { onSuccess: onClose, onError: (error: unknown) => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' as const }) }; if (record) update.mutate({ id: record.id, data: { vehicleId: vehicleId ? Number(vehicleId) : undefined, startPosition: startPosition ? Number(startPosition) : undefined, status } }, options); else create.mutate({ raceSessionId: sessionId, userId: Number(userId), vehicleId: vehicleId ? Number(vehicleId) : undefined, bookingId: bookingId ? Number(bookingId) : undefined, startPosition: startPosition ? Number(startPosition) : undefined, status }, options); };
  return <Modal isOpen onClose={onClose} title={record ? 'Ishtirokchini yangilash' : 'Ishtirokchi qo‘shish'}><form onSubmit={submit} className="grid grid-cols-2 gap-4">{!record && <><Field label="User ID"><input required type="number" min="1" value={userId} onChange={event => setUserId(event.target.value)} className={inputClass} /></Field><Field label="Booking ID"><input type="number" min="1" value={bookingId} onChange={event => setBookingId(event.target.value)} className={inputClass} /></Field></>}<Field label="Vehicle ID"><input type="number" min="1" value={vehicleId} onChange={event => setVehicleId(event.target.value)} className={inputClass} /></Field><Field label="Start pozitsiya"><input type="number" min="1" value={startPosition} onChange={event => setStartPosition(event.target.value)} className={inputClass} /></Field><Field label="Holat" className="col-span-2"><select value={status} onChange={event => setStatus(event.target.value as RaceParticipantStatus)} className={inputClass}>{(['REGISTERED', 'CHECKED_IN', 'RACING', 'FINISHED', 'DNF', 'DISQUALIFIED'] as RaceParticipantStatus[]).map(value => <option key={value}>{value}</option>)}</select></Field><div className="col-span-2"><Actions onClose={onClose} pending={create.isPending || update.isPending} /></div></form></Modal>;
}

function LapEditor({ record, onClose }: { record: RaceLap; onClose: () => void }) {
  const [lapTimeMs, setLapTimeMs] = useState(String(record.lapTimeMs));
  const [penaltyMs, setPenaltyMs] = useState(String(record.penaltyMs ?? 0));
  const [isValid, setIsValid] = useState(record.isValid);
  const update = useUpdateRaceLap();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    update.mutate(
      {
        id: record.id,
        data: {
          lapTimeMs: Number(lapTimeMs),
          penaltyMs: Number(penaltyMs),
          isValid,
        },
      },
      {
        onSuccess: onClose,
        onError: (error: unknown) =>
          toast({
            title: 'Xatolik',
            description: messageOf(error),
            variant: 'destructive',
          }),
      },
    );
  };

  return (
    <Modal isOpen onClose={onClose} title="Lapni yangilash">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lap vaqti (ms)">
            <input
              required
              type="number"
              min="1"
              value={lapTimeMs}
              onChange={event => setLapTimeMs(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Penalty (ms)">
            <input
              type="number"
              min="0"
              value={penaltyMs}
              onChange={event => setPenaltyMs(event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isValid}
            onChange={event => setIsValid(event.target.checked)}
          />
          Valid aylana
        </label>
        <Actions onClose={onClose} pending={update.isPending} />
      </form>
    </Modal>
  );
}

function ResultEditor({ sessionId, participants, record, onClose }: { sessionId: number; participants: RaceParticipant[]; record?: RaceResult; onClose: () => void }) {
  const [participantId, setParticipantId] = useState(record?.participantId ? String(record.participantId) : '');
  const selectedParticipant = participants.find(item => item.id === Number(participantId));
  const [userId, setUserId] = useState(record ? String(record.userId) : '');
  const [position, setPosition] = useState(record?.position ? String(record.position) : '');
  const [points, setPoints] = useState(String(record?.points ?? 0));
  const [isWinner, setIsWinner] = useState(record?.isWinner ?? false);
  const create = useCreateRaceResult();
  const update = useUpdateRaceResult();
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = { position: position ? Number(position) : undefined, points: Number(points), isWinner }; const options = { onSuccess: onClose, onError: (error: unknown) => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' as const }) }; if (record) update.mutate({ id: record.id, data }, options); else create.mutate({ raceSessionId: sessionId, participantId: Number(participantId), userId: selectedParticipant?.userId ?? Number(userId), ...data }, options); };
  return <Modal isOpen onClose={onClose} title={record ? 'Natijani yangilash' : 'Natija qo‘shish'}><form onSubmit={submit} className="space-y-4">{!record && <><Field label="Ishtirokchi"><select required value={participantId} onChange={event => { setParticipantId(event.target.value); const participant = participants.find(item => item.id === Number(event.target.value)); if (participant) setUserId(String(participant.userId)); }} className={inputClass}><option value="">Tanlang</option>{participants.map(item => <option key={item.id} value={item.id}>{item.user?.fullName ?? `Participant #${item.id}`}</option>)}</select></Field><Field label="User ID"><input required type="number" min="1" value={userId} onChange={event => setUserId(event.target.value)} className={inputClass} /></Field></>}<div className="grid grid-cols-2 gap-3"><Field label="O‘rin"><input type="number" min="1" value={position} onChange={event => setPosition(event.target.value)} className={inputClass} /></Field><Field label="Ball"><input type="number" value={points} onChange={event => setPoints(event.target.value)} className={inputClass} /></Field></div><label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isWinner} onChange={event => setIsWinner(event.target.checked)} /> G‘olib</label><Actions onClose={onClose} pending={create.isPending || update.isPending} /></form></Modal>;
}

function Field({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return <label className={`block text-xs text-muted-foreground ${className}`}>{label}{children}</label>;
}

function Actions({ onClose, pending }: { onClose: () => void; pending: boolean }) {
  return <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={pending}>Saqlash</Button></div>;
}
