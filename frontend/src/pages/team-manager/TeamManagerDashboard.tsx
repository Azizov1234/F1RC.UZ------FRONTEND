import { Link } from 'react-router-dom';
import {
  Users2, Trophy, Calendar, BarChart2,
  ChevronRight, Flag, Star, TrendingUp, Award, Zap
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';

const mockTeamData = {
  name: 'Thunder RC Team',
  badge: '⚡',
  rank: 2,
  totalPoints: 8450,
  wins: 24,
  races: 48,
  winRate: 50,
  season: '2026 Spring Season',
};

const mockRacers = [
  { id: 'r1', name: 'Jahongir T.', number: '#001', points: 2840, wins: 12, rank: 1, category: 'Formula RC', avatar: 'J', trend: 'up' },
  { id: 'r2', name: 'Bobur H.',    number: '#004', points: 2180, wins: 7,  rank: 4, category: 'Formula RC', avatar: 'B', trend: 'up' },
  { id: 'r3', name: 'Nodira A.',   number: '#007', points: 1750, wins: 5,  rank: 7, category: 'GT Race',    avatar: 'N', trend: 'down' },
];

const mockUpcoming = [
  { id: 'e1', title: 'Formula RC Sprint — R5',  date: '2026-06-18', time: '14:30', category: 'Formula RC' },
  { id: 'e2', title: 'GT Race Night — Q3',       date: '2026-06-19', time: '19:00', category: 'GT Race' },
  { id: 'e3', title: 'Season Championship Heat', date: '2026-06-22', time: '16:00', category: 'Formula RC' },
];

const mockRecentResults = [
  { event: 'Formula RC Sprint R4', pos1: 1, pos2: 4, pts: '+42', date: '2026-06-14' },
  { event: 'GT Race Night Q2',     pos1: 3, pos2: 7, pts: '+26', date: '2026-06-12' },
  { event: 'Rally Endurance',      pos1: 2, pos2: 5, pts: '+35', date: '2026-06-10' },
];

export default function TeamManagerDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-xs text-muted-foreground font-heading uppercase tracking-widest">Team Manager</p>
          <h1 className="text-xl font-heading font-bold text-foreground mt-0.5">
            Xush kelibsiz, <span className="text-yellow-400">{user?.full_name || 'Manager'}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-2xl">
              {mockTeamData.badge}
            </div>
            <div>
              <p className="font-heading font-bold text-foreground">{mockTeamData.name}</p>
              <p className="text-xs text-muted-foreground font-heading">{mockTeamData.season}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-heading font-bold">
              <Award className="w-3.5 h-3.5" />
              #{mockTeamData.rank} O'rin
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Umumiy ball',  value: mockTeamData.totalPoints.toLocaleString(), icon: Star,       color: 'text-yellow-400' },
          { label: "G'alabalar",   value: mockTeamData.wins,                          icon: Trophy,     color: 'text-green-400' },
          { label: 'Poygalar',     value: mockTeamData.races,                         icon: Flag,       color: 'text-blue-400' },
          { label: "G'alaba %",    value: `${mockTeamData.winRate}%`,                 icon: TrendingUp, color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground font-heading mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Racers + Upcoming */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Team racers */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
              <Users2 className="w-4 h-4 text-yellow-400" />
              Jamoa Racerlari
            </h2>
            <Link to="/team-manager/team" className="text-xs text-yellow-400 hover:text-yellow-300 font-heading flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {mockRacers.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-heading font-bold text-primary flex-shrink-0">
                  {r.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-heading font-semibold text-foreground truncate">{r.name}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">{r.number}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-heading">{r.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-primary">{r.points.toLocaleString()}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-[10px] text-muted-foreground font-heading">#{r.rank}</span>
                    <TrendingUp className={`w-3 h-3 ${r.trend === 'up' ? 'text-green-400' : 'text-red-400 rotate-180'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Kelgusi Eventlar
            </h2>
            <Link to="/team-manager/events" className="text-xs text-blue-400 hover:text-blue-300 font-heading flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {mockUpcoming.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-medium text-foreground truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{e.date} · {e.time}</p>
                </div>
                <span className="text-[10px] font-heading px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {e.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent results */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-green-400" />
            So'nggi Natijalar
          </h2>
          <Link to="/team-manager/standings" className="text-xs text-green-400 hover:text-green-300 font-heading flex items-center gap-1">
            {t.viewAll} <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Event</th>
                <th className="text-center px-4 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">R1</th>
                <th className="text-center px-4 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">R2</th>
                <th className="text-right px-4 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Ball</th>
                <th className="text-right px-4 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden sm:table-cell">Sana</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentResults.map((r, i) => (
                <tr key={i} className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i === mockRecentResults.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 text-sm font-heading text-foreground">{r.event}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-display font-bold ${r.pos1 === 1 ? 'text-yellow-400' : r.pos1 === 2 ? 'text-gray-400' : r.pos1 === 3 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                      P{r.pos1}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-display font-bold ${r.pos2 === 1 ? 'text-yellow-400' : r.pos2 === 2 ? 'text-gray-400' : r.pos2 === 3 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                      P{r.pos2}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-display font-bold text-green-400">{r.pts}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground font-mono">{r.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}