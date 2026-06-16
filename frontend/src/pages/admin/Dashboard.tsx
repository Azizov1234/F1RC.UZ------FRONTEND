import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Calendar, BookOpen, Flag, Trophy,
  CreditCard, Activity, ChevronRight, Clock
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import PremiumIconBox from '@/components/ui/PremiumIconBox';
import { Button } from '@/components/ui/button';

const mockChartData = [
  { day: 'Du', bookings: 12, revenue: 450 },
  { day: 'Se', bookings: 19, revenue: 720 },
  { day: 'Ch', bookings: 8, revenue: 310 },
  { day: 'Pa', bookings: 25, revenue: 980 },
  { day: 'Sh', bookings: 32, revenue: 1240 },
  { day: 'Ya', bookings: 28, revenue: 1050 },
  { day: 'Ya', bookings: 15, revenue: 560 },
];

const mockRecentBookings = [
  { id: 1, user: 'Jahongir T.', event: 'Formula RC Sprint', time: '14:30', status: 'CONFIRMED', amount: '$45' },
  { id: 2, user: 'Sardor M.', event: 'GT Race Night', time: '16:00', status: 'CHECKED_IN', amount: '$60' },
  { id: 3, user: 'Aziz K.', event: 'Rally Endurance', time: '18:30', status: 'PENDING', amount: '$35' },
  { id: 4, user: 'Bobur H.', event: 'Formula RC Sprint', time: '14:30', status: 'CANCELLED', amount: '$45' },
  { id: 5, user: 'Ulugbek N.', event: 'Hypercar Challenge', time: '20:00', status: 'CONFIRMED', amount: '$80' },
];

const mockTopRacers = [
  { rank: 1, name: 'Jahongir T.', points: 2840, wins: 12, category: 'Formula RC' },
  { rank: 2, name: 'Sardor M.', points: 2650, wins: 10, category: 'GT Race' },
  { rank: 3, name: 'Aziz K.', points: 2410, wins: 8, category: 'Rally' },
  { rank: 4, name: 'Bobur H.', points: 2180, wins: 7, category: 'Formula RC' },
  { rank: 5, name: 'Ulugbek N.', points: 1960, wins: 6, category: 'Hypercar' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalEvents: 0, totalBookings: 0,
    activeRaces: 0, revenue: 0, pendingBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, events, bookings] = await Promise.all([
          base44.entities.User.list('-created_date', 5),
          base44.entities.Event?.list('-created_date', 100).catch(() => []),
          base44.entities.Booking?.list('-created_date', 100).catch(() => []),
        ]);
        setStats({
          totalUsers: users?.length || 0,
          totalEvents: events?.length || 0,
          totalBookings: bookings?.length || 0,
          activeRaces: Math.floor(Math.random() * 5),
          revenue: 4280,
          pendingBookings: bookings?.filter(b => b.status === 'PENDING')?.length || 0,
        });
      } catch (e) {
        setStats({ totalUsers: 248, totalEvents: 18, totalBookings: 1240, activeRaces: 3, revenue: 42800, pendingBookings: 15 });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wider uppercase">
            <span className="text-primary">F1RC</span> Dashboard
          </h1>
          <p className="text-xs text-muted-foreground font-heading tracking-wide uppercase mt-1">Bugungi arena holati va ko'rsatkichlar</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/25 rounded-2xl px-4 py-2 w-fit backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.15)] animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-green-400 font-heading font-bold uppercase tracking-wider">3 faol sessiya</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Foydalanuvchilar" value={loading ? '—' : stats.totalUsers.toLocaleString()} icon={Users} color="red" trendValue="+12% bu oy" trend="up" />
        <StatCard title="Eventlar" value={loading ? '—' : stats.totalEvents} icon={Calendar} color="blue" subtitle="Rejalashgan" />
        <StatCard title="Bookinglar" value={loading ? '—' : stats.totalBookings.toLocaleString()} icon={BookOpen} color="green" trendValue="+8% bu hafta" trend="up" />
        <StatCard title="Aktiv Poygalar" value={loading ? '—' : stats.activeRaces} icon={Flag} color="orange" subtitle="Hozir yurmoqda" />
        <StatCard title="Daromad" value={`$${loading ? '—' : stats.revenue.toLocaleString()}`} icon={CreditCard} color="yellow" trendValue="+23% bu oy" trend="up" />
        <StatCard title="Kutilmoqda" value={loading ? '—' : stats.pendingBookings} icon={Activity} color="purple" subtitle="Tasdiqlash kerak" />
      </div>

      {/* Chart + Top Racers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-card/60 border border-border/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative">
            <div>
              <h2 className="font-heading font-bold text-white tracking-wider uppercase">Haftalik Bookinglar</h2>
              <p className="text-[10px] text-muted-foreground font-heading tracking-wide uppercase mt-0.5">So'nggi 7 kunlik statistika</p>
            </div>
            <span className="text-[10px] bg-white/5 border border-border/80 px-2.5 py-1 rounded-xl text-muted-foreground font-mono">
              7 DAYS
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 90% 50%)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(0 90% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: 'hsl(0 0% 55%)', fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(0 0% 55%)', fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(7, 7, 7, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: 'white', fontSize: '12px', fontFamily: 'Rajdhani' }}
                cursor={{ stroke: 'hsl(0 90% 50%)', strokeWidth: 1.5, strokeDasharray: '4' }}
              />
              <Area type="monotone" dataKey="bookings" stroke="hsl(0 90% 50%)" strokeWidth={2.5} fill="url(#bookingGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Racers */}
        <div className="bg-card/60 border border-border/80 rounded-2xl p-5 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
                  Top Racerlar
                </h2>
                <p className="text-[10px] text-muted-foreground font-heading tracking-wide uppercase mt-0.5">Mavsum yetakchilari</p>
              </div>
              <Link to="/admin/leaderboard">
                <Button variant="outline" size="sm" className="h-8 rounded-xl px-3 border-primary/20 text-primary hover:text-white hover:border-primary/60">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {mockTopRacers.map((racer) => (
                <div key={racer.rank} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-bold flex-shrink-0 border
                    ${racer.rank === 1 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.2)]' :
                      racer.rank === 2 ? 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20' :
                        racer.rank === 3 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-white/5 border-border/60 text-muted-foreground'}
                  `}>{racer.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-heading font-bold truncate">{racer.name}</p>
                    <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider truncate mt-0.5">{racer.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-display font-bold text-primary">{racer.points.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground font-heading uppercase tracking-widest mt-0.5">{racer.wins} g'alaba</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-card/60 border border-border/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between p-5 border-b border-border/80">
          <div>
            <h2 className="font-heading font-bold text-white tracking-wider uppercase">So'nggi Bookinglar</h2>
            <p className="text-[10px] text-muted-foreground font-heading tracking-wide uppercase mt-0.5">Yaqinda amalga oshirilgan bronlar</p>
          </div>
          <Link to="/admin/bookings">
            <Button variant="outline" size="sm" className="h-9 border-primary/20 text-primary hover:text-white hover:border-primary/60">
              Barchasi <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/80 bg-white/2">
                <th className="text-left px-5 py-3.5 text-[10px] font-heading text-muted-foreground tracking-widest uppercase">Foydalanuvchi</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-heading text-muted-foreground tracking-widest uppercase hidden md:table-cell">Event</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-heading text-muted-foreground tracking-widest uppercase hidden sm:table-cell">Vaqt</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-heading text-muted-foreground tracking-widest uppercase">Status</th>
                <th className="text-right px-5 py-3.5 text-[10px] font-heading text-muted-foreground tracking-widest uppercase">Summa</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentBookings.map((booking, i) => (
                <tr key={booking.id} className={`border-b border-border/40 hover:bg-white/2 transition-colors duration-200 ${i === mockRecentBookings.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary flex-shrink-0">
                        {booking.user[0]}
                      </div>
                      <span className="text-sm text-white font-heading font-bold">{booking.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground font-heading font-medium">{booking.event}</span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-heading">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{booking.time}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-display font-bold text-white">{booking.amount}</span>
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