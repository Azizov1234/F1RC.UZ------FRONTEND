import { useState } from 'react';
import { Car, Search, Plus, Wrench, CheckCircle, Fuel, Zap, Tag, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { useI18n } from '@/lib/i18n';
import PremiumIconBox from '@/components/ui/PremiumIconBox';
import { Button } from '@/components/ui/button';

interface Vehicle {
  id: string;
  number: string;
  model: string;
  category: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  batteryLevel: number;
  totalRaces: number;
  lastUsed: string;
  speed: string;
  color: string;
}

const mockVehicles: Vehicle[] = [
  { id: 'v1',  number: '#001', model: 'Tamiya F104 Pro', category: 'Formula RC',  status: 'AVAILABLE',   batteryLevel: 95, totalRaces: 142, lastUsed: '2026-06-16', speed: '80 km/h',  color: '#FF0000' },
  { id: 'v2',  number: '#002', model: 'Kyosho Inferno',   category: 'GT Race',     status: 'IN_USE',      batteryLevel: 42, totalRaces: 98,  lastUsed: '2026-06-16', speed: '75 km/h',  color: '#0066FF' },
  { id: 'v3',  number: '#003', model: 'HPI Baja 5B',      category: 'Rally RC',    status: 'MAINTENANCE', batteryLevel: 0,  totalRaces: 210, lastUsed: '2026-06-14', speed: '70 km/h',  color: '#FF6600' },
  { id: 'v4',  number: '#004', model: 'Traxxas XO-1',     category: 'Hypercar',    status: 'AVAILABLE',   batteryLevel: 88, totalRaces: 65,  lastUsed: '2026-06-15', speed: '160 km/h', color: '#FFCC00' },
  { id: 'v5',  number: '#005', model: 'Tamiya F104 Pro', category: 'Formula RC',  status: 'AVAILABLE',   batteryLevel: 72, totalRaces: 88,  lastUsed: '2026-06-15', speed: '80 km/h',  color: '#FFFFFF' },
  { id: 'v6',  number: '#006', model: 'Kyosho Inferno',   category: 'GT Race',     status: 'IN_USE',      batteryLevel: 55, totalRaces: 134, lastUsed: '2026-06-16', speed: '75 km/h',  color: '#00CC44' },
  { id: 'v7',  number: '#007', model: 'Losi 5IVE-T',      category: 'Rally RC',    status: 'AVAILABLE',   batteryLevel: 100,totalRaces: 47,  lastUsed: '2026-06-13', speed: '68 km/h',  color: '#9900FF' },
  { id: 'v8',  number: '#008', model: 'Traxxas XO-1',     category: 'Hypercar',    status: 'MAINTENANCE', batteryLevel: 0,  totalRaces: 180, lastUsed: '2026-06-12', speed: '160 km/h', color: '#FF0066' },
];

const categoryColors: Record<string, string> = {
  'Formula RC': 'bg-red-500/5 text-red-400 border-red-500/20',
  'GT Race':    'bg-blue-500/5 text-blue-400 border-blue-500/20',
  'Rally RC':   'bg-orange-500/5 text-orange-400 border-orange-500/20',
  'Hypercar':   'bg-purple-500/5 text-purple-400 border-purple-500/20',
};

const statusConfig = {
  AVAILABLE:   { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-500/5 border-green-500/20',  label: 'Mavjud' },
  IN_USE:      { icon: Zap,         color: 'text-yellow-400', bg: 'bg-yellow-500/5 border-yellow-500/20', label: 'Band' },
  MAINTENANCE: { icon: Wrench,      color: 'text-red-400',    bg: 'bg-red-500/5 border-red-500/20',       label: 'Remont' },
};

function BatteryBar({ level }: { level: number }) {
  const color = level > 60 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : level > 20 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden border border-border">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs font-display font-bold text-muted-foreground w-8 text-right">{level}%</span>
    </div>
  );
}

const CATEGORIES = ['Barchasi', 'Formula RC', 'GT Race', 'Rally RC', 'Hypercar'];
const STATUSES   = ['Barchasi', 'AVAILABLE', 'IN_USE', 'MAINTENANCE'];

export default function VehiclesPage() {
  const { t } = useI18n();
  const [search, setSearch]     = useState('');
  const [catFilter, setCat]     = useState('Barchasi');
  const [statFilter, setStat]   = useState('Barchasi');
  const [view, setView]         = useState<'grid' | 'list'>('grid');

  const filtered = mockVehicles.filter(v => {
    const q = search.toLowerCase();
    const matchQ = v.number.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
    const matchC = catFilter === 'Barchasi' || v.category === catFilter;
    const matchS = statFilter === 'Barchasi' || v.status === statFilter;
    return matchQ && matchC && matchS;
  });

  const counts = {
    available:   mockVehicles.filter(v => v.status === 'AVAILABLE').length,
    inUse:       mockVehicles.filter(v => v.status === 'IN_USE').length,
    maintenance: mockVehicles.filter(v => v.status === 'MAINTENANCE').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.vehicles}
        subtitle="RC avtomobillar inventarizatsiyasi"
        icon={Car}
        actions={
          <Button variant="default" className="h-10">
            <Plus className="w-4 h-4 mr-1.5" />
            {t.addVehicle}
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t.available,    count: counts.available,   icon: CheckCircle, color: 'red' as const },
          { label: t.inUse,        count: counts.inUse,       icon: Zap,         color: 'yellow' as const },
          { label: t.maintenance,  count: counts.maintenance, icon: Wrench,      color: 'blue' as const },
        ].map(s => (
          <div key={s.label} className="bg-card/60 border border-border/85 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4">
              <PremiumIconBox icon={s.icon} color={s.color} size="sm" glow={true} />
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1.5 group-hover:text-primary transition-colors duration-300">{s.count}</p>
            <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${t.search} raqam, model...`}
            className="w-full pl-10 pr-4 py-3 bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={catFilter}
              onChange={e => setCat(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-card/60 border border-border/80 rounded-2xl text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} className="bg-zinc-950">{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statFilter}
              onChange={e => setStat(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-card/60 border border-border/80 rounded-2xl text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              {STATUSES.map(s => <option key={s} className="bg-zinc-950">{s === 'AVAILABLE' ? t.available : s === 'IN_USE' ? t.inUse : s === 'MAINTENANCE' ? t.maintenance : s}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {/* View toggle */}
          <div className="flex rounded-2xl border border-border/80 overflow-hidden bg-card/60 backdrop-blur-md">
            {(['grid', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4.5 py-3 text-xs font-heading transition-all duration-300 ${view === v ? 'bg-primary/20 text-white border-r border-border/40' : 'text-muted-foreground hover:text-white border-r border-transparent'}`}
              >
                {v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map(v => {
            return (
              <div key={v.id} className="bg-card/50 border border-border/80 rounded-2xl p-5 hover:border-primary/45 transition-all duration-300 group shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-xl text-white tracking-wide group-hover:text-primary transition-colors">{v.number}</span>
                  <StatusBadge status={v.status} />
                </div>

                {/* Info block */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-border bg-white/5 shadow-md group-hover:scale-105 duration-300" style={{ borderColor: v.color + '40' }}>
                    <Car className="w-6 h-6" style={{ color: v.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading font-bold text-white truncate">{v.model}</p>
                    <span className={`inline-block text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-1 ${categoryColors[v.category] ?? ''}`}>
                      {v.category}
                    </span>
                  </div>
                </div>

                {/* Battery */}
                <div className="mb-4 py-3 border-y border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-widest flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-muted-foreground" /> Batareya quvvati
                    </span>
                  </div>
                  <BatteryBar level={v.batteryLevel} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pb-4">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-heading uppercase tracking-widest">Poygalar</p>
                    <p className="text-base font-display font-bold text-white mt-0.5">{v.totalRaces}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-heading uppercase tracking-widest">Max Tezlik</p>
                    <p className="text-base font-display font-bold text-primary mt-0.5">{v.speed}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border/40">
                  <Button variant="outline" size="sm" className="flex-1">
                    Tahrirlash
                  </Button>
                  {v.status === 'AVAILABLE' && (
                    <Button variant="premium" size="sm" className="flex-1 text-xs">
                      Ta'mirlash
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-card/50 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/80 bg-white/2">
                  {['Raqam', 'Model', 'Kategoriya', 'Batareya', 'Status', 'Poygalar', 'Max Tezlik', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-heading text-muted-foreground tracking-widest uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => {
                  return (
                    <tr key={v.id} className={`border-b border-border/40 hover:bg-white/2 transition-colors duration-200 ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-border/40 flex items-center justify-center">
                            <Car className="w-4 h-4" style={{ color: v.color }} />
                          </div>
                          <span className="font-display font-bold text-white text-sm tracking-wide">{v.number}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white font-heading font-semibold">{v.model}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColors[v.category] ?? ''}`}>
                          {v.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 min-w-[120px]"><BatteryBar level={v.batteryLevel} /></td>
                      <td className="px-5 py-4">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="px-5 py-4 text-sm font-display font-bold text-white">{v.totalRaces}</td>
                      <td className="px-5 py-4 text-sm font-display font-bold text-primary">{v.speed}</td>
                      <td className="px-5 py-4 text-right">
                        <Button variant="outline" size="sm">
                          Tahrirlash
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground font-heading text-sm">{t.noData}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
