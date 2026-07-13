import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CircleStop, Flag, Gauge, Play, QrCode, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useCreateRaceLap } from '@/hooks/api/useRaceLaps';
import { useFinishRaceSession, useStartRaceSession } from '@/hooks/api/useRaceSessions';

function messageOf(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
  }
  return 'Operator amalini bajarib bo‘lmadi.';
}

function positiveId(value: string): number | null {
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}

export default function OperatorDashboard() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');
  const [lapSessionId, setLapSessionId] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [lapTimeMs, setLapTimeMs] = useState('');
  const [penaltyMs, setPenaltyMs] = useState('0');
  const [isValid, setIsValid] = useState(true);
  const [lapNotice, setLapNotice] = useState('');

  const start = useStartRaceSession();
  const finish = useFinishRaceSession();
  const createLap = useCreateRaceLap();

  const controlSession = async (action: 'start' | 'finish') => {
    const id = positiveId(sessionId);
    if (!id) {
      setSessionNotice('Musbat race session ID kiriting.');
      return;
    }
    setSessionNotice('');
    try {
      if (action === 'start') await start.mutateAsync(id);
      else await finish.mutateAsync(id);
      setSessionNotice(action === 'start' ? `#${id} sessiya boshlandi.` : `#${id} sessiya yakunlandi.`);
    } catch (error: unknown) {
      setSessionNotice(messageOf(error));
    }
  };

  const recordLap = async (event: FormEvent) => {
    event.preventDefault();
    const raceSessionId = positiveId(lapSessionId);
    const racerId = positiveId(participantId);
    const time = Number(lapTimeMs);
    const penalty = Number(penaltyMs || 0);
    if (!raceSessionId || !racerId || !Number.isFinite(time) || time <= 0 || !Number.isFinite(penalty) || penalty < 0) {
      setLapNotice('Session, participant va lap vaqti maydonlarini to‘g‘ri kiriting.');
      return;
    }
    setLapNotice('');
    try {
      const lap = await createLap.mutateAsync({
        sessionId: raceSessionId,
        data: { participantId: racerId, lapTimeMs: Math.round(time), penaltyMs: Math.round(penalty), isValid },
      });
      setLapNotice(`Lap #${lap.lapNumber} backendda qayd qilindi.`);
      setLapTimeMs('');
      setPenaltyMs('0');
    } catch (error: unknown) {
      setLapNotice(messageOf(error));
    }
  };

  const controlling = start.isPending || finish.isPending;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">Operator control center</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">Salom, {user?.full_name || 'Operator'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operatorga ruxsat etilgan start, finish va lap endpointlarini ID orqali boshqaring.
          </p>
        </div>
        <Link to="/operator/checkin" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500">
          <QrCode className="h-4 w-4" /> Booking check-in
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Play} label="Session start" value="POST" color="text-green-400" />
        <Metric icon={CircleStop} label="Session finish" value="POST" color="text-red-400" />
        <Metric icon={Timer} label="Lap record" value="POST" color="text-blue-400" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Flag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground">Sessiya lifecycle</h2>
              <p className="text-xs text-muted-foreground">Backend operator list/detail endpoint bermaydi.</p>
            </div>
          </div>
          <label htmlFor="session-id" className="mt-5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Race session ID</label>
          <input id="session-id" inputMode="numeric" value={sessionId} onChange={(event) => setSessionId(event.target.value.trim())} placeholder="Masalan: 42" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 font-mono text-foreground outline-none focus:border-primary" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button disabled={controlling} onClick={() => controlSession('start')} className="bg-green-600 hover:bg-green-500"><Play /> Start</Button>
            <Button disabled={controlling} onClick={() => controlSession('finish')} variant="destructive"><CircleStop /> Finish</Button>
          </div>
          {sessionNotice && <p className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground">{sessionNotice}</p>}
        </section>

        <form onSubmit={recordLap} className="rounded-2xl border border-border bg-card/70 p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10"><Gauge className="h-5 w-5 text-blue-400" /></div>
            <div><h2 className="font-heading font-bold text-foreground">Lap qayd etish</h2><p className="text-xs text-muted-foreground">Vaqt millisekundda yuboriladi.</p></div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input aria-label="Lap session ID" inputMode="numeric" value={lapSessionId} onChange={(event) => setLapSessionId(event.target.value.trim())} placeholder="Session ID *" className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-500" />
            <input aria-label="Participant ID" inputMode="numeric" value={participantId} onChange={(event) => setParticipantId(event.target.value.trim())} placeholder="Participant ID *" className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-500" />
            <input aria-label="Lap time milliseconds" inputMode="numeric" value={lapTimeMs} onChange={(event) => setLapTimeMs(event.target.value.trim())} placeholder="Lap time (ms) *" className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-500" />
            <input aria-label="Penalty milliseconds" inputMode="numeric" value={penaltyMs} onChange={(event) => setPenaltyMs(event.target.value.trim())} placeholder="Penalty (ms)" className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-500" />
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
            <input type="checkbox" checked={isValid} onChange={(event) => setIsValid(event.target.checked)} className="accent-primary" /> Valid lap
          </label>
          <Button type="submit" disabled={createLap.isPending} className="mt-4 w-full bg-blue-600 hover:bg-blue-500">
            <Timer /> {createLap.isPending ? 'Yuborilmoqda…' : 'Lapni qayd etish'}
          </Button>
          {lapNotice && <p className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground">{lapNotice}</p>}
        </form>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color }: { icon: typeof Flag; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="mt-4 font-display text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
