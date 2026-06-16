import { useState } from 'react';
import { BookOpen, Search, Download, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import RoleBadge from '@/components/admin/RoleBadge';

const mockBookings = [
  { id: 'BK-001', user: 'Jahongir Toshmatov', event: 'Formula RC Sprint', slot: '14:30–15:30', vehicle: 'Ferrari F1RC', code: 'F1RC-A4K2', status: 'CONFIRMED', payment: 'PAID', amount: '$45', createdAt: '2025-02-10' },
  { id: 'BK-002', user: 'Sardor Mirzayev', event: 'GT Race Night', slot: '19:00–20:30', vehicle: 'GT Racer Pro', code: 'F1RC-B8X9', status: 'CHECKED_IN', payment: 'PAID', amount: '$60', createdAt: '2025-02-11' },
  { id: 'BK-003', user: 'Aziz Karimov', event: 'Rally Endurance', slot: '10:00–12:00', vehicle: 'Rally Monster', code: 'F1RC-C3Y1', status: 'PENDING', payment: 'UNPAID', amount: '$35', createdAt: '2025-02-12' },
  { id: 'BK-004', user: 'Bobur Hasanov', event: 'Formula RC Sprint', slot: '14:30–15:30', vehicle: 'Red Bull RC', code: 'F1RC-D7Z5', status: 'CANCELLED', payment: 'REFUNDED', amount: '$45', createdAt: '2025-02-09' },
  { id: 'BK-005', user: 'Ulugbek Nazarov', event: 'Hypercar Challenge', slot: '20:00–21:00', vehicle: 'Bugatti RC', code: 'F1RC-E2W8', status: 'CONFIRMED', payment: 'PAID', amount: '$80', createdAt: '2025-02-13' },
  { id: 'BK-006', user: 'Kamol Yusupov', event: 'Le Mans Endurance', slot: '09:00–14:00', vehicle: 'Porsche RC LM', code: 'F1RC-F6T4', status: 'COMPLETED', payment: 'PAID', amount: '$70', createdAt: '2025-01-28' },
];

export default function BookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockBookings.filter(b => {
    const matchSearch = !search || b.user.toLowerCase().includes(search.toLowerCase()) || b.event.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    CONFIRMED: mockBookings.filter(b => b.status === 'CONFIRMED').length,
    CHECKED_IN: mockBookings.filter(b => b.status === 'CHECKED_IN').length,
    PENDING: mockBookings.filter(b => b.status === 'PENDING').length,
    CANCELLED: mockBookings.filter(b => b.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Bookinglar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{mockBookings.length} ta booking</p>
        </div>
        <button className="flex items-center gap-2 bg-card border border-border hover:border-white/20 text-muted-foreground hover:text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tasdiqlangan', value: statusCounts.CONFIRMED, color: 'border-green-500/20 bg-green-500/5', textColor: 'text-green-400' },
          { label: 'Check-In', value: statusCounts.CHECKED_IN, color: 'border-blue-500/20 bg-blue-500/5', textColor: 'text-blue-400' },
          { label: 'Kutilmoqda', value: statusCounts.PENDING, color: 'border-yellow-500/20 bg-yellow-500/5', textColor: 'text-yellow-400' },
          { label: 'Bekor', value: statusCounts.CANCELLED, color: 'border-red-500/20 bg-red-500/5', textColor: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className={`border ${s.color} rounded-xl p-4`}>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-display font-bold mt-1 ${s.textColor}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish: ism, event, kod..." className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-heading font-semibold tracking-wide transition-all ${statusFilter === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-white hover:border-white/20'}`}>
              {s === 'ALL' ? 'Barchasi' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">ID / Kod</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Foydalanuvchi</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden lg:table-cell">Event</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden xl:table-cell">Mashina</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden md:table-cell">To'lov</th>
                <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Summa</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking, i) => (
                <tr key={booking.id} className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-xs font-display font-bold text-primary">{booking.id}</p>
                      <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                        <QrCode className="w-2.5 h-2.5" />
                        {booking.code}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary flex-shrink-0">
                        {booking.user[0]}
                      </div>
                      <span className="text-sm text-white font-heading">{booking.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div>
                      <p className="text-sm text-white font-heading">{booking.event}</p>
                      <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{booking.slot}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden xl:table-cell">
                    <span className="text-sm text-muted-foreground font-heading">{booking.vehicle}</span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={booking.status} /></td>
                  <td className="px-5 py-3.5 hidden md:table-cell"><StatusBadge status={booking.payment} /></td>
                  <td className="px-5 py-3.5 text-right">
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