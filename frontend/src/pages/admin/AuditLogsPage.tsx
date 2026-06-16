import { useState } from 'react';
import { Activity, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import RoleBadge from '@/components/admin/RoleBadge';

const mockLogs = [
  { id: 1, action: 'USER_CREATED', entity: 'User', entityId: 'usr_001', user: 'SUPERADMIN', userRole: 'SUPERADMIN', ip: '192.168.1.1', time: '2025-02-14 10:23:15', details: 'Yangi admin foydalanuvchi yaratildi' },
  { id: 2, action: 'BOOKING_STATUS_CHANGED', entity: 'Booking', entityId: 'BK-001', user: 'Operator Aliyev', userRole: 'OPERATOR', ip: '192.168.1.5', time: '2025-02-14 10:45:32', details: 'PENDING → CONFIRMED' },
  { id: 3, action: 'CHECK_IN_DONE', entity: 'Booking', entityId: 'BK-002', user: 'Operator Aliyev', userRole: 'OPERATOR', ip: '192.168.1.5', time: '2025-02-14 11:02:44', details: 'Racer check-in qilindi: Sardor M.' },
  { id: 4, action: 'EVENT_CREATED', entity: 'Event', entityId: 'evt_003', user: 'Admin Karimov', userRole: 'ADMIN', ip: '192.168.1.8', time: '2025-02-14 09:15:00', details: 'GT Race Night Series yaratildi' },
  { id: 5, action: 'RESULT_CREATED', entity: 'RaceResult', entityId: 'rr_001', user: 'Operator Aliyev', userRole: 'OPERATOR', ip: '192.168.1.5', time: '2025-02-14 12:30:22', details: 'Formula RC Sprint Heat 1 natijalari kiritildi' },
  { id: 6, action: 'PAYMENT_UPDATED', entity: 'Payment', entityId: 'pay_001', user: 'System', userRole: 'SUPERADMIN', ip: '127.0.0.1', time: '2025-02-14 11:55:10', details: 'PENDING → PAID · $45' },
  { id: 7, action: 'USER_STATUS_CHANGED', entity: 'User', entityId: 'usr_012', user: 'Admin Karimov', userRole: 'ADMIN', ip: '192.168.1.8', time: '2025-02-14 09:45:33', details: 'ACTIVE → INACTIVE (bloklandi)' },
  { id: 8, action: 'VEHICLE_CREATED', entity: 'Vehicle', entityId: 'veh_005', user: 'Admin Karimov', userRole: 'ADMIN', ip: '192.168.1.8', time: '2025-02-13 16:20:11', details: "Yangi mashina qo'shildi: Bugatti RC" },
];

const actionColors: Record<string, string> = {
  USER_CREATED: 'text-blue-400 bg-blue-500/10',
  USER_STATUS_CHANGED: 'text-orange-400 bg-orange-500/10',
  BOOKING_STATUS_CHANGED: 'text-yellow-400 bg-yellow-500/10',
  CHECK_IN_DONE: 'text-green-400 bg-green-500/10',
  EVENT_CREATED: 'text-purple-400 bg-purple-500/10',
  RESULT_CREATED: 'text-cyan-400 bg-cyan-500/10',
  PAYMENT_UPDATED: 'text-green-400 bg-green-500/10',
  VEHICLE_CREATED: 'text-red-400 bg-red-500/10',
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = mockLogs.filter(l => {
    const matchSearch = !search || l.action.includes(search.toUpperCase()) || l.user.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = ['ALL', ...new Set(mockLogs.map(l => l.action))];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Audit Log
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Barcha tizim harakatlari tarixi</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Amal, foydalanuvchi yoki tafsilotlar..." className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>
      </div>

      {/* Action filters */}
      <div className="flex gap-2 flex-wrap">
        {uniqueActions.slice(0, 6).map(a => (
          <button key={a} onClick={() => setActionFilter(a)} className={`px-3 py-1.5 rounded-lg text-[10px] font-display font-bold tracking-wide transition-all ${actionFilter === a ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-white hover:border-white/20'}`}>
            {a === 'ALL' ? 'Barchasi' : a}
          </button>
        ))}
      </div>

      {/* Logs timeline */}
      <div className="space-y-2">
        {filtered.map((log, i) => {
          const actionStyle = actionColors[log.action] || 'text-gray-400 bg-gray-500/10';
          return (
            <div key={log.id} className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-all">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${log.action.includes('STATUS') ? 'bg-yellow-400' : log.action.includes('CREATED') ? 'bg-blue-400' : log.action.includes('DONE') ? 'bg-green-400' : log.action.includes('UPDATED') ? 'bg-purple-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded tracking-widest ${actionStyle}`}>{log.action}</span>
                    <RoleBadge role={log.userRole} />
                    <span className="text-xs text-muted-foreground font-mono ml-auto">{log.time}</span>
                  </div>
                  <p className="text-sm text-white font-heading">{log.details}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span>👤 {log.user}</span>
                    <span>📋 {log.entity} · {log.entityId}</span>
                    <span>🌐 {log.ip}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}