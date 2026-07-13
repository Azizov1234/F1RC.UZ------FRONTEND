import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  Flag,
  Plus,
  Search,
  TimerReset,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/AuthContext';
import {
  useCreateRaceSession,
  useFinishRaceSession,
  useRaceSessions,
  useStartRaceSession,
  useUpdateRaceSessionStatus,
} from '@/hooks/api/useRaceSessions';
import type { RaceSessionStatus } from '@/types';

const statuses: Array<'ALL' | RaceSessionStatus> = [
  'ALL',
  'PENDING',
  'ONGOING',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
];

function messageOf(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
  }
  return 'Operatsiya bajarilmadi';
}

function OperatorSessionControls() {
  const [sessionId, setSessionId] = useState('');
  const [notice, setNotice] = useState('');
  const start = useStartRaceSession();
  const finish = useFinishRaceSession();
  const validId = /^\d+$/.test(sessionId) && Number(sessionId) > 0;

  const run = async (action: 'start' | 'finish') => {
    if (!validId) return;
    setNotice('');
    try {
      if (action === 'start') await start.mutateAsync(Number(sessionId));
      else await finish.mutateAsync(Number(sessionId));
      setNotice(action === 'start' ? 'Sessiya boshlandi.' : 'Sessiya yakunlandi.');
    } catch (error: unknown) {
      setNotice(messageOf(error));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
          <Flag className="h-5 w-5 text-primary" /> Operator sessiya boshqaruvi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Swagger operator uchun sessiya ro‘yxatini bermaydi. Start/finish real sessiya ID orqali bajariladi.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <label htmlFor="operator-session-id" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Race session ID
        </label>
        <input
          id="operator-session-id"
          inputMode="numeric"
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value.trim())}
          placeholder="Masalan: 42"
          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 font-mono text-foreground outline-none transition focus:border-primary"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!validId || start.isPending || finish.isPending}
            onClick={() => run('start')}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-500/15 font-heading text-sm font-bold text-green-400 transition hover:bg-green-500 hover:text-white disabled:opacity-40"
          >
            <Flag className="h-4 w-4" /> Start
          </button>
          <button
            type="button"
            disabled={!validId || start.isPending || finish.isPending}
            onClick={() => run('finish')}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-500/15 font-heading text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-40"
          >
            <CircleStop className="h-4 w-4" /> Finish
          </button>
        </div>
        {notice && <p className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground">{notice}</p>}
      </section>
    </div>
  );
}

function AdminRaceSessions() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | RaceSessionStatus>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [eventId, setEventId] = useState('');
  const [name, setName] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [formError, setFormError] = useState('');

  const sessions = useRaceSessions({
    page,
    limit: 10,
    search: search || undefined,
    status: status === 'ALL' ? undefined : status,
    sortBy: 'scheduledAt',
    sortOrder: 'desc',
  });
  const create = useCreateRaceSession();
  const updateStatus = useUpdateRaceSessionStatus();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d+$/.test(eventId) || Number(eventId) < 1) {
      setFormError('To‘g‘ri event ID kiriting.');
      return;
    }
    setFormError('');
    try {
      await create.mutateAsync({
        eventId: Number(eventId),
        name: name.trim() || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      setEventId('');
      setName('');
      setScheduledAt('');
      setShowCreate(false);
    } catch (error: unknown) {
      setFormError(messageOf(error));
    }
  };

  const setSessionStatus = async (id: number, nextStatus: RaceSessionStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: nextStatus });
    } catch (error: unknown) {
      setFormError(messageOf(error));
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
            <Flag className="h-5 w-5 text-primary" /> Race Sessions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Real sessiyalar va lifecycle boshqaruvi</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((value) => !value)}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-heading text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Yangi sessiya
        </button>
      </header>

      {showCreate && (
        <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-primary/20 bg-card p-4 shadow-xl md:grid-cols-4">
          <input
            inputMode="numeric"
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            placeholder="Event ID *"
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Sessiya nomi"
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <button disabled={create.isPending} className="h-11 rounded-xl bg-primary font-heading text-sm font-bold text-white disabled:opacity-50">
            {create.isPending ? 'Saqlanmoqda…' : 'Yaratish'}
          </button>
          {formError && <p className="text-sm text-red-400 md:col-span-4">{formError}</p>}
        </form>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Sessiya qidirish…"
            className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        <select
          value={status}
          onChange={(event) => { setStatus(event.target.value as 'ALL' | RaceSessionStatus); setPage(1); }}
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          {statuses.map((value) => <option key={value} value={value}>{value === 'ALL' ? 'Barcha statuslar' : value}</option>)}
        </select>
      </section>

      {sessions.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-48 rounded-2xl" />)}
        </div>
      ) : sessions.isError ? (
        <ErrorState description={messageOf(sessions.error)} onRetry={() => sessions.refetch()} retrying={sessions.isFetching} />
      ) : !sessions.data?.data.length ? (
        <EmptyState icon={TimerReset} title="Sessiya topilmadi" description="Filterlarni o‘zgartiring yoki yangi sessiya yarating." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sessions.data.data.map((session) => (
            <article key={session.id} className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] text-primary">SESSION #{session.id}</p>
                  <h2 className="mt-1 font-heading font-bold text-foreground">{session.name || `Event #${session.eventId}`}</h2>
                </div>
                <StatusBadge status={session.status} />
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><Flag className="h-3.5 w-3.5" /> Event #{session.eventId}</p>
                <p className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5" /> {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString('uz-UZ') : 'Vaqt belgilanmagan'}</p>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <select
                  aria-label={`Session ${session.id} statusi`}
                  value={session.status}
                  disabled={updateStatus.isPending}
                  onChange={(event) => setSessionStatus(session.id, event.target.value as RaceSessionStatus)}
                  className="h-10 rounded-xl border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
                >
                  {statuses.filter((value): value is RaceSessionStatus => value !== 'ALL').map((value) => <option key={value}>{value}</option>)}
                </select>
                <Link to={`/admin/race-sessions/${session.id}`} className="flex h-10 items-center rounded-xl border border-primary/25 px-3 text-xs font-bold text-primary transition hover:bg-primary hover:text-white">
                  Batafsil
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {sessions.data && sessions.data.meta.totalPages > 1 && (
        <nav className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm">
          <button disabled={!sessions.data.meta.hasPrevPage} onClick={() => setPage((value) => value - 1)} className="flex min-h-10 items-center gap-1 px-3 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /> Oldingi</button>
          <span className="text-muted-foreground">{page} / {sessions.data.meta.totalPages}</span>
          <button disabled={!sessions.data.meta.hasNextPage} onClick={() => setPage((value) => value + 1)} className="flex min-h-10 items-center gap-1 px-3 disabled:opacity-30">Keyingi <ChevronRight className="h-4 w-4" /></button>
        </nav>
      )}
    </div>
  );
}

export default function RaceSessionsPage() {
  const { user } = useAuth();
  return user?.role === 'operator' ? <OperatorSessionControls /> : <AdminRaceSessions />;
}
