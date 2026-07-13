import { Link } from 'react-router-dom';
import {
  Users, Calendar, BookOpen, Flag,
  CreditCard, Activity, ChevronRight, Clock
} from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { useUsersQuery } from '@/hooks/api/useUsers';
import { useEvents } from '@/hooks/api/useEvents';
import { useBookings } from '@/hooks/api/useBookings';
import { useVehicles } from '@/hooks/api/useVehicles';
import { useHealth } from '@/hooks/api/useHealth';
import { StatCardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Booking } from '@/types';

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();
}

function buildBookingChart(bookings: Booking[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dayBookings = bookings.filter(booking => isSameDay(new Date(booking.createdAt), date));
    return {
      day: new Intl.DateTimeFormat('uz-UZ', { weekday: 'short' }).format(date),
      bookings: dayBookings.length,
      revenue: dayBookings.reduce((sum, booking) => sum + (booking.amount ?? 0), 0),
    };
  });
}

export default function Dashboard() {
  // Parallel fetching via react-query
  const { data: usersData, isLoading: loadingUsers, isError: errUsers } = useUsersQuery({ limit: 1 });
  const { data: eventsData, isLoading: loadingEvents, isError: errEvents } = useEvents({ limit: 1 });
  const { data: bookingsData, isLoading: loadingBookings, isError: errBookings } = useBookings({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  const { data: vehiclesData, isLoading: loadingVehicles, isError: errVehicles } = useVehicles();
  const { data: healthData, isLoading: loadingHealth, isError: errHealth } = useHealth();

  const isAnyError = errUsers || errEvents || errBookings || errVehicles;
  const isAnyLoading = loadingUsers || loadingEvents || loadingBookings || loadingVehicles || loadingHealth;

  const totalUsers = usersData?.meta?.total ?? 0;
  const totalEvents = eventsData?.meta?.total ?? 0;
  const totalBookings = bookingsData?.meta?.total ?? 0;
  const availableVehicles = vehiclesData?.filter(v => v.status === 'AVAILABLE')?.length ?? 0;
  const pendingBookings = bookingsData?.data?.filter(b => b.status === 'PENDING')?.length ?? 0;
  const allBookings = bookingsData?.data ?? [];
  const recentBookings = allBookings.slice(0, 5);
  const chartData = buildBookingChart(allBookings);

  // Calculate generic revenue based on confirmed/checked_in bookings
  const revenue = allBookings
    .filter(booking => booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED')
    .reduce((sum, booking) => sum + (booking.amount ?? 0), 0);

  const vehicleStatusData = [
    { label: 'Mavjud', count: vehiclesData?.filter(vehicle => vehicle.status === 'AVAILABLE').length ?? 0, color: 'text-green-400' },
    { label: 'Band qilingan', count: vehiclesData?.filter(vehicle => vehicle.status === 'RESERVED').length ?? 0, color: 'text-yellow-400' },
    { label: 'Texnik xizmatda', count: vehiclesData?.filter(vehicle => vehicle.status === 'MAINTENANCE').length ?? 0, color: 'text-blue-400' },
    { label: 'Faolsiz', count: vehiclesData?.filter(vehicle => vehicle.status === 'DISABLED').length ?? 0, color: 'text-zinc-400' },
  ];

  if (isAnyError) {
    return (
      <div className="p-6 bg-background min-h-[60vh] flex items-center justify-center">
        <ErrorState type="server" title="Statistika yuklanmadi" description="API so'rovlarida xatolik yuz berdi." />
      </div>
    );
  }

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
        <div className="flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/25 rounded-2xl px-4 py-2 w-fit backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <div className={`w-2.5 h-2.5 rounded-full ${healthData?.status === 'ok' && !errHealth ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-yellow-500'}`} />
          <span className={`${healthData?.status === 'ok' && !errHealth ? 'text-green-400' : 'text-yellow-400'} font-heading font-bold uppercase tracking-wider`}>
            {healthData?.status === 'ok' && !errHealth ? 'Tizim Onlayn' : 'Holat tekshirilmoqda'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isAnyLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Foydalanuvchilar" value={totalUsers.toLocaleString()} icon={Users} color="red" />
            <StatCard title="Eventlar" value={totalEvents} icon={Calendar} color="blue" subtitle="Rejalashgan" />
            <StatCard title="Bookinglar" value={totalBookings.toLocaleString()} icon={BookOpen} color="green" />
            <StatCard title="Mavjud Mashinalar" value={availableVehicles} icon={Flag} color="orange" subtitle="Bron qilish mumkin" />
            <StatCard title="Bronlar Summasi" value={revenue.toLocaleString()} icon={CreditCard} color="yellow" subtitle="Backend amount" />
            <StatCard title="Kutilmoqda" value={pendingBookings} icon={Activity} color="purple" subtitle="Tasdiqlash kerak" />
          </>
        )}
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
            <AreaChart data={chartData}>
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

        {/* Vehicle status */}
        <div className="bg-card/60 border border-border/80 rounded-2xl p-5 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <Flag className="w-5 h-5 text-primary" />
                  Avtomobil holati
                </h2>
                <p className="text-[10px] text-muted-foreground font-heading tracking-wide uppercase mt-0.5">Real inventar taqsimoti</p>
              </div>
              <Link to="/admin/vehicles">
                <Button variant="outline" size="sm" className="h-8 rounded-xl px-3 border-primary/20 text-primary hover:text-white hover:border-primary/60">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {vehicleStatusData.map((status, index) => (
                <div key={status.label} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-bold flex-shrink-0 border bg-white/5 border-border/60 text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-heading font-bold truncate">{status.label}</p>
                    <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider truncate mt-0.5">Vehicle status</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-display font-bold ${status.color}`}>{status.count}</p>
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
              {isAnyLoading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : (
                recentBookings.map((booking, i) => (
                  <tr key={booking.id} className={`border-b border-border/40 hover:bg-white/2 transition-colors duration-200 ${i === recentBookings.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary flex-shrink-0">
                          {booking.user?.fullName?.[0] || booking.user?.email?.[0] || 'U'}
                        </div>
                        <span className="text-sm text-white font-heading font-bold">
                          {booking.user?.fullName || booking.user?.email || 'Foydalanuvchi'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground font-heading font-medium">
                        {booking.event?.name || `Event #${booking.eventId}`}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-heading">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono">
                          {new Date(booking.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-display font-bold text-white">
                        {booking.amount?.toLocaleString() ?? 'вЂ”'} {booking.event?.currency ?? ''}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
