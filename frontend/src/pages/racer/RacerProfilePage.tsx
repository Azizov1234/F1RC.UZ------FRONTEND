import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Trophy, Flag, Star, Zap, LogOut, ChevronRight } from 'lucide-react';

export default function RacerProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-2xl font-display font-bold text-primary">
            {user?.full_name?.[0] || 'R'}
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-white">{user?.full_name || 'Racer'}</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-display font-bold px-2 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">RACER</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Ball', value: '2,840', icon: Zap, color: 'text-primary' },
            { label: "G'alaba", value: '12', icon: Trophy, color: 'text-yellow-400' },
            { label: 'Podyum', value: '18', icon: Star, color: 'text-purple-400' },
            { label: 'Poyga', value: '24', icon: Flag, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-background rounded-lg p-2.5 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className={`text-sm font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-heading">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
        {[
          { label: 'Mening bookinglarim', desc: 'Joriy va o\'tgan bookinglar' },
          { label: 'Natijalar tarixi', desc: 'Barcha poyga natijalarim' },
          { label: 'Mukofotlar', desc: 'Olingan prize va ball tarix' },
          { label: 'Sozlamalar', desc: 'Profil va bildirishnoma' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between p-4 hover:bg-white/2 transition-colors cursor-pointer">
            <div>
              <p className="text-sm font-heading font-medium text-white">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      <button onClick={() => base44.auth.logout('/login')} className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-xl py-3 text-sm font-heading font-semibold transition-all">
        <LogOut className="w-4 h-4" /> Chiqish
      </button>
    </div>
  );
}