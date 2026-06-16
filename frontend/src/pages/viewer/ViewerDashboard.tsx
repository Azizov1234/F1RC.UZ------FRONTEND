import { Link } from 'react-router-dom';
import {
  Trophy, Calendar, Radio, ChevronRight,
  Flame, Clock, Play, Eye, Star, Flag
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const mockLiveStreams = [
  { id: 'ls1', title: 'Formula RC Sprint — Live Final',  viewers: 342, thumbnail: '🏎️', duration: '00:42:18', hot: true },
  { id: 'ls2', title: 'GT Race Night — Qualifying',       viewers: 156, thumbnail: '🚗', duration: '00:18:45', hot: false },
];

const mockLeaders = [
  { rank: 1, name: 'Jahongir T.',  points: 2840, wins: 12, category: 'Formula RC', avatar: 'J', flag: '🇺🇿' },
  { rank: 2, name: 'Sardor M.',    points: 2650, wins: 10, category: 'GT Race',    avatar: 'S', flag: '🇺🇿' },
  { rank: 3, name: 'Aziz K.',      points: 2410, wins: 8,  category: 'Rally RC',   avatar: 'A', flag: '🇺🇿' },
  { rank: 4, name: 'Bobur H.',     points: 2180, wins: 7,  category: 'Formula RC', avatar: 'B', flag: '🇺🇿' },
  { rank: 5, name: 'Ulugbek N.',   points: 1960, wins: 6,  category: 'Hypercar',   avatar: 'U', flag: '🇺🇿' },
];

const mockUpcoming = [
  { id: 'e1', title: 'Formula RC Sprint Championship',  date: '2026-06-18', time: '14:30', category: 'Formula RC', slots: 3 },
  { id: 'e2', title: 'GT Race Night — Grand Prix',       date: '2026-06-19', time: '19:00', category: 'GT Race',    slots: 0 },
  { id: 'e3', title: 'Rally Endurance Open',             date: '2026-06-20', time: '10:00', category: 'Rally RC',   slots: 8 },
];

const rankColors = ['text-yellow-400', 'text-gray-400', 'text-orange-400'];
const rankBgs    = ['bg-yellow-500/20', 'bg-gray-400/20', 'bg-orange-500/20'];

export default function ViewerDashboard() {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-background via-card to-background border border-border p-6">
        {/* decorative */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(hsl(0 90% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 90% 50%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-heading text-red-400 font-semibold tracking-widest uppercase">2 Jonli Translyatsiya</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-wide">
            F1RC.UZ <span className="text-primary">Arena</span>
          </h1>
          <p className="text-sm text-muted-foreground font-heading mt-1">RC Motorsport Arena — Toshkent | 2026 Spring Season</p>
          <div className="flex gap-3 mt-4">
            <Link
              to="/viewer/streams"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Jonli Tomosha
            </Link>
            <Link
              to="/viewer/leaderboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-heading text-foreground hover:border-primary/50 transition-colors"
            >
              <Trophy className="w-4 h-4 text-yellow-400" /> Reyting
            </Link>
          </div>
        </div>
      </div>

      {/* Live streams */}
      {mockLiveStreams.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Jonli Translyatsiya
            </h2>
            <Link to="/viewer/streams" className="text-xs text-primary hover:text-primary/80 font-heading flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockLiveStreams.map(s => (
              <Link
                key={s.id}
                to="/viewer/streams"
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-200"
              >
                {/* Thumbnail area */}
                <div className="h-32 bg-gradient-to-br from-muted to-background flex items-center justify-center relative">
                  <span className="text-5xl">{s.thumbnail}</span>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  {/* Live badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[10px] font-heading font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                  </div>
                  {s.hot && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-500/90 text-white text-[10px] font-heading font-bold px-2 py-0.5 rounded-full">
                      <Flame className="w-3 h-3" /> HOT
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {s.duration}
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <p className="text-sm font-heading font-medium text-foreground truncate flex-1">{s.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2 flex-shrink-0">
                    <Eye className="w-3 h-3" />
                    <span className="font-mono">{s.viewers.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard + Events */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top 5 leaderboard */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Top Racerlar
            </h2>
            <Link to="/viewer/leaderboard" className="text-xs text-primary hover:text-primary/80 font-heading flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {mockLeaders.map(r => (
              <div key={r.rank} className="flex items-center gap-3 px-4 py-3">
                {/* Rank */}
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-bold flex-shrink-0 ${rankBgs[r.rank - 1] ?? 'bg-muted'} ${rankColors[r.rank - 1] ?? 'text-muted-foreground'}`}>
                  {r.rank}
                </span>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary flex-shrink-0">
                  {r.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-heading font-medium text-foreground truncate">{r.name}</p>
                    <span className="text-sm">{r.flag}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-heading">{r.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-display font-bold text-primary">{r.points.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-heading">{r.wins} g'alaba</p>
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
            <Link to="/viewer/events" className="text-xs text-primary hover:text-primary/80 font-heading flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {mockUpcoming.map(e => (
              <div key={e.id} className="px-4 py-3.5 hover:bg-white/2 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Flag className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading font-medium text-foreground">{e.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono">{e.date} · {e.time}</span>
                      </div>
                      <span className={`text-[10px] font-heading font-semibold ${e.slots > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {e.slots > 0 ? `${e.slots} joy bor` : t.full}
                      </span>
                    </div>
                    <span className="mt-1 inline-block text-[10px] font-heading px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {e.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border text-center">
            <Link to="/viewer/events" className="text-xs text-primary hover:text-primary/80 font-heading">
              Barcha eventlarni ko'rish →
            </Link>
          </div>
        </div>
      </div>

      {/* Season stats */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading font-semibold text-foreground tracking-wide mb-4">2026 Spring Season</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Jami poyga',   value: '48', icon: Flag,    color: 'text-primary' },
            { label: 'Racerlar',     value: '156', icon: Trophy, color: 'text-yellow-400' },
            { label: 'Kategoriya',   value: '5',   icon: Star,   color: 'text-blue-400' },
            { label: 'Live soatlar', value: '142h', icon: Radio, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
              <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
              <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground font-heading">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}