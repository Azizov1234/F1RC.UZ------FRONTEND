import { useState } from 'react';
import { Zap, Plus, Trophy, Users, Calendar, ChevronRight, Radio } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const mockSeasons = [
  { id: 1, title: 'F1RC Season 2025 — Spring', type: '6 OY', startDate: '2025-01-01', endDate: '2025-06-30', status: 'ACTIVE', participants: 124, prizePool: 500000, currency: 'USD', stages: 3 },
  { id: 2, title: 'F1RC Season 2024 — Annual', type: '1 YIL', startDate: '2024-01-01', endDate: '2024-12-31', status: 'FINISHED', participants: 280, prizePool: 500000, currency: 'USD', stages: 6 },
];

const mockStandings = [
  { rank: 1, name: 'Jahongir T.', points: 2840, change: '+2', prizes: '$150,000' },
  { rank: 2, name: 'Sardor M.', points: 2650, change: '=', prizes: '$100,000' },
  { rank: 3, name: 'Aziz K.', points: 2410, change: '-1', prizes: '$75,000' },
  { rank: 4, name: 'Bobur H.', points: 2180, change: '+3', prizes: '$50,000' },
  { rank: 5, name: 'Ulugbek N.', points: 1960, change: '-2', prizes: '$30,000' },
];

export default function SeasonsPage() {
  const [selected, setSelected] = useState(mockSeasons[0]);
  const [tab, setTab] = useState('standings');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Seasons
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">$500,000 prize pool boshqaruvi</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yangi Season</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Season list */}
        <div className="space-y-3">
          {mockSeasons.map(season => (
            <div
              key={season.id}
              onClick={() => setSelected(season)}
              className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:border-primary/30 ${selected?.id === season.id ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-display font-bold text-primary tracking-widest">{season.type}</span>
                <StatusBadge status={season.status} />
              </div>
              <h3 className="text-sm font-heading font-semibold text-white leading-snug mb-3">{season.title}</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /><span>{season.startDate} → {season.endDate}</span></div>
                <div className="flex items-center gap-2"><Users className="w-3 h-3" /><span>{season.participants} qatnashchi</span></div>
              </div>
              {/* Prize pool */}
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-widest">Prize Pool</span>
                <span className="text-lg font-display font-bold text-yellow-400">${season.prizePool.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-2">
          {selected && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-white">{selected.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      {[
                        { label: 'Qatnashchi', value: selected.participants },
                        { label: 'Bosqich', value: selected.stages },
                        { label: 'Prize', value: `$${(selected.prizePool / 1000).toFixed(0)}K` },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <p className="text-base font-display font-bold text-primary">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground font-heading">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border px-5">
                {['standings', 'prizes'].map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-xs font-heading font-semibold tracking-wide border-b-2 transition-all -mb-px ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'}`}>
                    {t === 'standings' ? 'Reyting' : 'Sovrinlar'}
                  </button>
                ))}
              </div>

              {tab === 'standings' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">#</th>
                        <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Racer</th>
                        <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Ball</th>
                        <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden md:table-cell">O'zgarish</th>
                        <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden lg:table-cell">Taxminiy sovrin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockStandings.map((r, i) => (
                        <tr key={r.rank} className={`border-b border-border/50 ${i === mockStandings.length - 1 ? 'border-0' : ''}`}>
                          <td className="px-5 py-3.5">
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-display font-bold
                              ${r.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : r.rank === 2 ? 'bg-gray-400/20 text-gray-300' : r.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted text-muted-foreground'}
                            `}>{r.rank}</span>
                          </td>
                          <td className="px-5 py-3.5"><span className="text-sm text-white font-heading">{r.name}</span></td>
                          <td className="px-5 py-3.5 text-right"><span className="text-sm font-display font-bold text-primary">{r.points.toLocaleString()}</span></td>
                          <td className="px-5 py-3.5 text-right hidden md:table-cell">
                            <span className={`text-xs font-mono ${r.change.startsWith('+') ? 'text-green-400' : r.change === '=' ? 'text-muted-foreground' : 'text-red-400'}`}>{r.change}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right hidden lg:table-cell"><span className="text-sm font-display font-bold text-yellow-400">{r.prizes}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'prizes' && (
                <div className="p-5 space-y-3">
                  {[
                    { pos: '1-o\'rin', amount: '$150,000', percent: '30%', color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' },
                    { pos: '2-o\'rin', amount: '$100,000', percent: '20%', color: 'border-gray-400/30 bg-gray-400/5 text-gray-300' },
                    { pos: '3-o\'rin', amount: '$75,000', percent: '15%', color: 'border-orange-500/30 bg-orange-500/5 text-orange-400' },
                    { pos: '4–5 o\'rin', amount: '$50,000', percent: '10%', color: 'border-border bg-muted text-muted-foreground' },
                    { pos: '6–10 o\'rin', amount: '$25,000', percent: '5%', color: 'border-border bg-muted text-muted-foreground' },
                  ].map(p => (
                    <div key={p.pos} className={`border rounded-xl p-4 flex items-center justify-between ${p.color}`}>
                      <span className="font-heading font-semibold text-sm">{p.pos}</span>
                      <div className="text-right">
                        <p className="font-display font-bold text-lg">{p.amount}</p>
                        <p className="text-[10px] text-muted-foreground">{p.percent} prize pool</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}