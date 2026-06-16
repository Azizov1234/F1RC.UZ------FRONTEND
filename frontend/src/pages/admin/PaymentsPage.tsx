import { useState } from 'react';
import { CreditCard, Search, Download, TrendingUp, DollarSign } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const mockPayments = [
  { id: 'PAY-001', user: 'Jahongir T.', booking: 'BK-001', method: 'Click', amount: 45, currency: 'USD', status: 'PAID', paidAt: '2025-02-10 14:23' },
  { id: 'PAY-002', user: 'Sardor M.', booking: 'BK-002', method: 'Payme', amount: 60, currency: 'USD', status: 'PAID', paidAt: '2025-02-11 09:15' },
  { id: 'PAY-003', user: 'Aziz K.', booking: 'BK-003', method: 'Cash', amount: 35, currency: 'USD', status: 'UNPAID', paidAt: null },
  { id: 'PAY-004', user: 'Bobur H.', booking: 'BK-004', method: 'Click', amount: 45, currency: 'USD', status: 'REFUNDED', paidAt: '2025-02-09 16:45' },
  { id: 'PAY-005', user: 'Ulugbek N.', booking: 'BK-005', method: 'Payme', amount: 80, currency: 'USD', status: 'PAID', paidAt: '2025-02-13 11:30' },
  { id: 'PAY-006', user: 'Kamol Y.', booking: 'BK-006', method: 'Cash', amount: 70, currency: 'USD', status: 'PAID', paidAt: '2025-01-28 08:55' },
  { id: 'PAY-007', user: 'Sherzod E.', booking: 'BK-007', method: 'Click', amount: 55, currency: 'USD', status: 'FAILED', paidAt: null },
];

const totalRevenue = mockPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
const pendingAmount = mockPayments.filter(p => p.status === 'UNPAID').reduce((sum, p) => sum + p.amount, 0);

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockPayments.filter(p => {
    const matchSearch = !search || p.user.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            To'lovlar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{mockPayments.length} ta to'lov</p>
        </div>
        <button className="flex items-center gap-2 bg-card border border-border hover:border-white/20 text-muted-foreground hover:text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Jami Daromad', value: `$${totalRevenue}`, color: 'border-green-500/20 bg-green-500/5', textColor: 'text-green-400', icon: DollarSign },
          { label: "Kutilmoqda", value: `$${pendingAmount}`, color: 'border-yellow-500/20 bg-yellow-500/5', textColor: 'text-yellow-400', icon: CreditCard },
          { label: "To'langan", value: mockPayments.filter(p => p.status === 'PAID').length, color: 'border-blue-500/20 bg-blue-500/5', textColor: 'text-blue-400', icon: TrendingUp },
          { label: 'Qaytarildi', value: mockPayments.filter(p => p.status === 'REFUNDED').length, color: 'border-red-500/20 bg-red-500/5', textColor: 'text-red-400', icon: CreditCard },
        ].map(s => (
          <div key={s.label} className={`border ${s.color} rounded-xl p-4 flex items-center justify-between`}>
            <div>
              <p className="text-xs text-muted-foreground font-heading uppercase tracking-widest">{s.label}</p>
              <p className={`text-xl font-display font-bold mt-1 ${s.textColor}`}>{s.value}</p>
            </div>
            <s.icon className={`w-5 h-5 ${s.textColor} opacity-50`} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ID yoki foydalanuvchi..." className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PAID', 'UNPAID', 'FAILED', 'REFUNDED'].map(s => (
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
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">ID</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Foydalanuvchi</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden md:table-cell">Booking</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden lg:table-cell">Usul</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden xl:table-cell">Vaqt</th>
                <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Summa</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment, i) => (
                <tr key={payment.id} className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3.5"><span className="text-xs font-display font-bold text-primary">{payment.id}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-heading font-bold text-primary flex-shrink-0">{payment.user[0]}</div>
                      <span className="text-sm text-white font-heading">{payment.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-xs text-muted-foreground font-mono">{payment.booking}</span></td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs font-heading text-white bg-muted px-2 py-1 rounded">{payment.method}</span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={payment.status} /></td>
                  <td className="px-5 py-3.5 hidden xl:table-cell"><span className="text-xs text-muted-foreground font-mono">{payment.paidAt || '—'}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-sm font-display font-bold ${payment.status === 'PAID' ? 'text-green-400' : payment.status === 'REFUNDED' ? 'text-red-400' : 'text-white'}`}>
                      ${payment.amount}
                    </span>
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