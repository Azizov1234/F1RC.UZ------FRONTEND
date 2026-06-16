import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode, Flag, Users, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Zap, BookOpen, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';

const mockLiveSessions = [
  { id: 's1', name: 'Formula RC Sprint — Heat 3', track: 'Main Circuit', startTime: '22:00', elapsed: '12:34', lap: 14, totalLaps: 20, racers: 6, status: 'LIVE' },
  { id: 's2', name: 'GT Race Night — Qualifying', track: 'Oval Track',   startTime: '21:30', elapsed: '28:10', lap: 8,  totalLaps: 15, racers: 4, status: 'LIVE' },
];

const mockQueue = [
  { id: 'b1', racer: 'Jahongir T.', event: 'Formula RC Sprint', time: '22:30', vehicle: '#001', status: 'CONFIRMED' },
  { id: 'b2', racer: 'Sardor M.',   event: 'GT Race Night',     time: '22:45', vehicle: '#002', status: 'CONFIRMED' },
  { id: 'b3', racer: 'Aziz K.',     event: 'Rally Endurance',   time: '23:00', vehicle: '#003', status: 'PENDING' },
  { id: 'b4', racer: 'Bobur H.',    event: 'Formula RC Sprint', time: '23:15', vehicle: '#004', status: 'CONFIRMED' },
];

const mockStats = {
  todayBookings: 24,
  checkedIn: 18,
  pending: 6,
  activeSessions: 2,
  totalRacers: 31,
  nextSession: '22:30',
};

export default function OperatorDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-heading uppercase tracking-widest">Operator Panel</p>
          <h1 className="text-xl font-heading font-bold text-foreground mt-0.5">
            Salom, <span className="text-blue-400">{user?.full_name || 'Operator'}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors ${refreshing ? 'animate-spin text-blue-400' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/operator/checkin"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-heading font-semibold hover:bg-blue-700 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Check-In
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Bugungi booking', value: mockStats.todayBookings, icon: BookOpen, color: 'text-blue-400   bg-blue-500/10   border-blue-500/20' },
          { label: 'Check-in bo\'ldi', value: mockStats.checkedIn,   icon: CheckCircle, color: 'text-green-400  bg-green-500/10  border-green-500/20' },
          { label: 'Kutilmoqda',       value: mockStats.pending,      icon: AlertCircle, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Aktiv sessiya',    value: mockStats.activeSessions,icon: Flag,       color: 'text-primary   bg-primary/10    border-primary/20' },
          { label: 'Racerlar',         value: mockStats.totalRacers,  icon: Users,       color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
          { label: 'Keyingi sessiya',  value: mockStats.nextSession,  icon: Clock,       color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
        ].map(s => (
          <div key={s.label} className={`p-3 rounded-xl border flex items-start gap-2.5 ${s.color}`}>
            <s.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-display font-bold leading-tight">{s.value}</p>
              <p className="text-[10px] font-heading text-muted-foreground leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-foreground tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Jonli Sessiyalar
          </h2>
          <Link to="/operator/sessions" className="text-xs text-blue-400 hover:text-blue-300 font-heading flex items-center gap-1">
            Barchasi <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockLiveSessions.map(s => (
            <div key={s.id} className="bg-card border border-red-500/20 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-400 to-red-600 animate-pulse" />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-heading font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.track}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mb-1">
                  <span>Lap {s.lap}/{s.totalLaps}</span>
                  <span>{s.elapsed}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all"
                    style={{ width: `${(s.lap / s.totalLaps) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span className="font-heading">{s.racers} racer</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{s.startTime}</span>
                </div>
                <button className="text-xs font-heading text-blue-400 hover:text-blue-300 transition-colors">
                  Boshqarish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Check-in queue */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground tracking-wide">Navbat — Check-In</h2>
          <Link to="/operator/checkin" className="flex items-center gap-1.5 text-xs font-heading font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
            <QrCode className="w-3 h-3" /> QR Scan
          </Link>
        </div>
        <div className="divide-y divide-border/50">
          {mockQueue.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/2 transition-colors">
              <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-display font-bold text-muted-foreground flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-medium text-foreground truncate">{b.racer}</p>
                <p className="text-xs text-muted-foreground truncate">{b.event}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono bg-muted px-2 py-0.5 rounded">{b.vehicle}</span>
                <Clock className="w-3 h-3" />
                <span className="font-mono">{b.time}</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {b.status === 'CONFIRMED' ? (
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-heading font-semibold hover:bg-green-500/20 transition-colors">
                    <CheckCircle className="w-3 h-3" /> Check-In
                  </button>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-heading">
                    <AlertCircle className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border text-center">
          <Link to="/operator/bookings" className="text-xs text-blue-400 hover:text-blue-300 font-heading">
            Barcha bookinglarni ko'rish →
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-heading font-semibold text-foreground tracking-wide mb-3">Tezkor Amallar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Yangi Sessiya',  icon: Flag,     color: 'bg-red-500/10 border-red-500/20 text-red-400',    to: '/operator/sessions' },
            { label: 'Check-In Scan',  icon: QrCode,   color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', to: '/operator/checkin' },
            { label: 'Racerlar',       icon: Users,    color: 'bg-purple-500/10 border-purple-500/20 text-purple-400', to: '/operator/racers' },
            { label: 'Bookinglar',     icon: BookOpen, color: 'bg-green-500/10 border-green-500/20 text-green-400', to: '/operator/bookings' },
          ].map(a => (
            <Link
              key={a.label}
              to={a.to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-105 ${a.color}`}
            >
              <a.icon className="w-6 h-6" />
              <span className="text-xs font-heading font-semibold text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}