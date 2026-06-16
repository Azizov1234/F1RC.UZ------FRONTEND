import { useState } from 'react';
import { Radio, Search, CheckCircle, XCircle, ExternalLink, Eye, Tv } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import PremiumIconBox from '@/components/ui/PremiumIconBox';

const mockStreams = [
  { id: 1, title: 'Formula RC Sprint LIVE!', user: 'Jahongir T.', platform: 'YouTube', url: 'https://youtube.com/live/...', status: 'LIVE', clicks: 1240, isFeatured: true, startedAt: '14:30' },
  { id: 2, title: 'GT Racing - Practice Session', user: 'Sardor M.', platform: 'Instagram', url: 'https://instagram.com/live/...', status: 'APPROVED', clicks: 450, isFeatured: false, startedAt: null },
  { id: 3, title: 'Rally Endurance Race Day', user: 'Aziz K.', platform: 'Telegram', url: 'https://t.me/...', status: 'PENDING', clicks: 0, isFeatured: false, startedAt: null },
  { id: 4, title: 'Hypercar Challenge Highlights', user: 'Bobur H.', platform: 'YouTube', url: 'https://youtube.com/...', status: 'REJECTED', clicks: 0, isFeatured: false, startedAt: null },
  { id: 5, title: 'F1RC Arena Tour', user: 'Ulugbek N.', platform: 'Instagram', url: 'https://instagram.com/...', status: 'OFFLINE', clicks: 890, isFeatured: false, startedAt: null },
];

const platformColors: Record<string, string> = {
  YouTube: 'text-red-400 bg-red-500/5 border-red-500/20',
  Instagram: 'text-pink-400 bg-pink-500/5 border-pink-500/20',
  Telegram: 'text-blue-400 bg-blue-500/5 border-blue-500/20',
  Twitch: 'text-purple-400 bg-purple-500/5 border-purple-500/20',
};

export default function StreamsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockStreams.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.user.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Streamlar"
        subtitle="Racer live stream moderatsiyasi"
        icon={Radio}
      />

      {/* Live banner */}
      {mockStreams.filter(s => s.status === 'LIVE').map(s => (
        <div key={s.id} className="relative overflow-hidden bg-green-500/10 border border-green-500/25 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.15)] animate-pulse">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3.5 relative">
            <PremiumIconBox icon={Radio} color="green" size="md" glow={true} />
            <div>
              <p className="text-sm font-heading font-bold text-green-400 uppercase tracking-wider">🔴 HOZIR LIVE: {s.user}</p>
              <p className="text-xs text-muted-foreground font-heading mt-0.5">{s.title} · {s.platform}</p>
            </div>
          </div>
          <Button
            onClick={() => window.open(s.url, '_blank')}
            variant="outline"
            size="sm"
            className="border-green-500/20 hover:border-green-500/50 text-green-400 hover:bg-green-500/10 h-9 relative shrink-0"
          >
            Ko'rish <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      ))}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Stream qidirish..."
            className="w-full pl-10 pr-4 py-3 bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all duration-300"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'LIVE', 'PENDING', 'APPROVED', 'REJECTED', 'OFFLINE'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-heading font-semibold tracking-wide transition-all ${
                statusFilter === s
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-card/60 border border-border/80 text-muted-foreground hover:text-white hover:border-white/20'
              }`}
            >
              {s === 'ALL' ? 'Barchasi' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(stream => {
          return (
            <div key={stream.id} className="bg-card/50 border border-border/80 rounded-2xl overflow-hidden hover:border-primary/45 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group">
              {/* Cover placeholder representing dynamic iOS/premium grid preview */}
              <div className="aspect-video bg-gradient-to-br from-zinc-900 to-zinc-950 border-b border-border/80 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />
                <Tv className="w-10 h-10 text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all duration-500" />
                {stream.status === 'LIVE' && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-heading font-bold px-2 py-0.5 rounded-md tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.6)]">
                    LIVE
                  </span>
                )}
                {stream.startedAt && (
                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-mono px-2 py-0.5 rounded-md border border-white/10">
                    {stream.startedAt}
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={stream.status} />
                  <span className={`text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 border rounded-lg ${platformColors[stream.platform] || 'text-muted-foreground'}`}>{stream.platform}</span>
                </div>
                <h3 className="text-sm font-heading font-bold text-white mb-1 leading-snug group-hover:text-primary transition-colors duration-300">{stream.title}</h3>
                <p className="text-xs text-muted-foreground font-heading mb-4">@{stream.user}</p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-3 border-t border-border/40 mb-4">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-mono">{stream.clicks.toLocaleString()} marta ko'rildi</span>
                </div>

                {stream.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-grow border-green-500/20 text-green-400 hover:bg-green-500/10">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Ruxsat
                    </Button>
                    <Button variant="outline" size="sm" className="flex-grow border-red-500/20 text-red-400 hover:bg-red-500/10">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Rad etish
                    </Button>
                  </div>
                )}
                {(stream.status === 'APPROVED' || stream.status === 'LIVE') && (
                  <Button
                    onClick={() => window.open(stream.url, '_blank')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Ko'rish
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}