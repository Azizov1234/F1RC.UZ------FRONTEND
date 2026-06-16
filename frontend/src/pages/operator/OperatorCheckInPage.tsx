import { useState } from 'react';
import { QrCode, Search, CheckCircle, XCircle } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const mockBookings = [
  { code: 'F1RC-A4K2', user: 'Jahongir T.', event: 'Formula RC Sprint', slot: '14:30', vehicle: 'Ferrari F1RC', status: 'CONFIRMED' },
  { code: 'F1RC-B8X9', user: 'Sardor M.', event: 'GT Race Night', slot: '16:00', vehicle: 'GT Racer Pro', status: 'CHECKED_IN' },
  { code: 'F1RC-C3Y1', user: 'Aziz K.', event: 'Formula RC Sprint', slot: '14:30', vehicle: 'Rally Monster', status: 'CONFIRMED' },
];

interface Booking {
  code: string;
  user: string;
  event: string;
  slot: string;
  vehicle: string;
  status: string;
}

export default function OperatorCheckInPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const found = mockBookings.find(b => b.code.toLowerCase() === code.toLowerCase().trim());
    setResult(found || null);
    setSearched(true);
  };

  const handleCheckIn = () => {
    setResult(prev => prev ? { ...prev, status: 'CHECKED_IN' } : null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-heading font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-400" /> QR Check-In
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Booking kodi orqali racerni kiriting</p>
      </div>

      {/* QR input */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="w-24 h-24 rounded-xl bg-blue-500/10 border-2 border-dashed border-blue-500/30 flex flex-col items-center justify-center mx-auto gap-2">
          <QrCode className="w-10 h-10 text-blue-400" />
          <span className="text-[10px] text-muted-foreground font-heading">QR SCAN</span>
        </div>
        <p className="text-center text-xs text-muted-foreground">Yoki qo'lda kodni kiriting:</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="F1RC-XXXX"
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 font-mono uppercase"
            />
          </div>
          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all">Qidirish</button>
        </div>
      </div>

      {/* Result */}
      {searched && (
        result ? (
          <div className={`bg-card border rounded-xl p-5 ${result.status === 'CHECKED_IN' ? 'border-green-500/30' : 'border-blue-500/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-bold text-primary">{result.code}</span>
              <StatusBadge status={result.status} />
            </div>
            <div className="space-y-2 mb-4">
              {[
                { label: 'Racer', value: result.user },
                { label: 'Event', value: result.event },
                { label: 'Slot', value: result.slot },
                { label: 'Mashina', value: result.vehicle },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-heading">{f.label}</span>
                  <span className="text-sm font-heading font-medium text-white">{f.value}</span>
                </div>
              ))}
            </div>
            {result.status === 'CONFIRMED' ? (
              <button onClick={handleCheckIn} className="w-full flex items-center justify-center gap-2 bg-green-500/15 border border-green-500/30 hover:bg-green-500 hover:text-white text-green-400 rounded-xl py-3 text-sm font-heading font-bold transition-all">
                <CheckCircle className="w-4 h-4" /> CHECK-IN QILISH
              </button>
            ) : result.status === 'CHECKED_IN' ? (
              <div className="w-full flex items-center justify-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl py-3 text-sm font-heading font-bold">
                <CheckCircle className="w-4 h-4" /> ALLAQACHON CHECK-IN QILINGAN ✓
              </div>
            ) : null}
          </div>
        ) : (
          <div className="bg-card border border-red-500/30 rounded-xl p-5 flex flex-col items-center gap-3 text-center">
            <XCircle className="w-10 h-10 text-red-400" />
            <p className="font-heading font-semibold text-white">Booking topilmadi</p>
            <p className="text-xs text-muted-foreground">"{code}" kodi bo'yicha hech narsa yo'q</p>
          </div>
        )
      )}

      {/* Recent check-ins */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-white text-sm">So'nggi Check-Inlar</h2>
        </div>
        <div className="divide-y divide-border/50">
          {mockBookings.filter(b => b.status === 'CHECKED_IN').map(b => (
            <div key={b.code} className="flex items-center gap-3 p-4">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-heading text-white">{b.user}</p>
                <p className="text-xs text-muted-foreground font-mono">{b.code}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}