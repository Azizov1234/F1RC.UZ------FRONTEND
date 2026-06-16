import { useState } from 'react';
import { Flag, Play, Square, Plus, Timer, User, Car } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const mockSessions = [
  { id: 'RS-001', title: 'Formula RC Sprint - Heat 1', event: 'Formula RC Sprint', operator: 'Operator Aliyev', status: 'RUNNING', participants: 8, startedAt: '14:32', duration: '23:14', laps: 5 },
  { id: 'RS-002', title: 'GT Race Night - Qualifying', event: 'GT Race Night', operator: 'Operator Karimov', status: 'WAITING', participants: 6, startedAt: null, duration: null, laps: 3 },
  { id: 'RS-003', title: 'Formula RC Sprint - Heat 2', event: 'Formula RC Sprint', operator: 'Operator Aliyev', status: 'FINISHED', participants: 8, startedAt: '15:30', duration: '28:45', laps: 5 },
  { id: 'RS-004', title: 'Rally Endurance - Main Race', event: 'Rally Endurance', operator: 'Operator Ergashev', status: 'WAITING', participants: 12, startedAt: null, duration: null, laps: 8 },
];

const mockResults = [
  { pos: 1, racer: 'Jahongir T.', vehicle: 'Ferrari F1RC', bestLap: '01:23.456', totalTime: '07:42.123', points: 25 },
  { pos: 2, racer: 'Sardor M.', vehicle: 'Red Bull RC', bestLap: '01:24.001', totalTime: '07:45.678', points: 18 },
  { pos: 3, racer: 'Aziz K.', vehicle: 'Mercedes RC', bestLap: '01:24.890', totalTime: '07:48.234', points: 15 },
  { pos: 4, racer: 'Bobur H.', vehicle: 'McLaren RC', bestLap: '01:25.123', totalTime: '07:51.567', points: 12 },
];

interface Session {
  id: string;
  title: string;
  event: string;
  operator: string;
  status: string;
  participants: number;
  startedAt: string | null;
  duration: string | null;
  laps: number;
}

export default function RaceSessionsPage() {
  const [selected, setSelected] = useState<Session | null>(null);

  const activeSession = mockSessions.find(s => s.status === 'RUNNING');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <Flag className="w-6 h-6 text-primary" />
            Poyga Sessiyalar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{mockSessions.length} ta sessiya</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yangi Sessiya</span>
        </button>
      </div>

      {/* Active session banner */}
      {activeSession && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className="text-sm font-heading font-semibold text-green-400">AKTIV SESSIYA</p>
              <p className="text-xs text-muted-foreground">{activeSession.title} · {activeSession.participants} qatnashchi</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <Timer className="w-4 h-4" />
            <span className="font-mono text-sm font-bold">{activeSession.duration}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sessions list */}
        <div className="xl:col-span-1 space-y-3">
          {mockSessions.map(session => (
            <div
              key={session.id}
              onClick={() => setSelected(session)}
              className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:border-primary/30 ${selected?.id === session.id ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-display font-bold text-primary">{session.id}</span>
                <StatusBadge status={session.status} />
              </div>
              <h3 className="text-sm font-heading font-semibold text-white mb-2 leading-snug">{session.title}</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>{session.operator}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-3 h-3" />
                  <span>{session.participants} qatnashchi · {session.laps} lap</span>
                </div>
                {session.startedAt && (
                  <div className="flex items-center gap-2">
                    <Timer className="w-3 h-3" />
                    <span>{session.startedAt} · {session.duration}</span>
                  </div>
                )}
              </div>
              {session.status === 'WAITING' && (
                <button className="w-full mt-3 flex items-center justify-center gap-2 bg-primary/10 border border-primary/30 hover:bg-primary hover:text-white text-primary rounded-lg py-2 text-xs font-heading font-semibold transition-all">
                  <Play className="w-3 h-3" />
                  Boshlash
                </button>
              )}
              {session.status === 'RUNNING' && (
                <button className="w-full mt-3 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 rounded-lg py-2 text-xs font-heading font-semibold transition-all">
                  <Square className="w-3 h-3" />
                  Tugatish
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Results panel */}
        <div className="xl:col-span-2">
          {selected ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-white">{selected.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{selected.event}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              {selected.status === 'FINISHED' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">O'rin</th>
                        <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Racer</th>
                        <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden md:table-cell">Mashina</th>
                        <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Best Lap</th>
                        <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden lg:table-cell">Jami</th>
                        <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Ball</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockResults.map((r, i) => (
                        <tr key={r.pos} className={`border-b border-border/50 ${i === mockResults.length - 1 ? 'border-0' : ''}`}>
                          <td className="px-5 py-3.5">
                            <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-display font-bold
                              ${r.pos === 1 ? 'bg-yellow-500/20 text-yellow-400' : r.pos === 2 ? 'bg-gray-400/20 text-gray-300' : r.pos === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted text-muted-foreground'}
                            `}>{r.pos}</span>
                          </td>
                          <td className="px-5 py-3.5"><span className="text-sm text-white font-heading">{r.racer}</span></td>
                          <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-xs text-muted-foreground">{r.vehicle}</span></td>
                          <td className="px-5 py-3.5 text-right"><span className="text-xs font-mono text-green-400">{r.bestLap}</span></td>
                          <td className="px-5 py-3.5 text-right hidden lg:table-cell"><span className="text-xs font-mono text-muted-foreground">{r.totalTime}</span></td>
                          <td className="px-5 py-3.5 text-right"><span className="text-sm font-display font-bold text-primary">+{r.points}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Flag className="w-12 h-12 mb-3 opacity-30" />
                  <p className="font-heading text-sm">Natijalar mavjud emas</p>
                  <p className="text-xs mt-1">Sessiya tugagandan keyin natijalar ko'rsatiladi</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Flag className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-heading text-sm">Sessiyani tanlang</p>
              <p className="text-xs mt-1">Natijalarni ko'rish uchun sessiyaga bosing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}