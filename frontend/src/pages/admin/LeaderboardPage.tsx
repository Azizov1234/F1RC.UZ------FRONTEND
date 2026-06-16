import { useState } from 'react';
import { Trophy, Medal, Crown, Star, Zap } from 'lucide-react';

const mockLeaderboard = [
  { rank: 1, name: 'Jahongir Toshmatov', nickname: 'J_RACER', points: 2840, wins: 12, podiums: 18, races: 24, bestLap: '01:23.456', winRate: 50, category: 'Formula RC', level: 'ELITE' },
  { rank: 2, name: 'Sardor Mirzayev', nickname: 'S_SPEED', points: 2650, wins: 10, podiums: 15, races: 22, bestLap: '01:24.112', winRate: 45, category: 'GT RC', level: 'PRO' },
  { rank: 3, name: 'Aziz Karimov', nickname: 'AZ_DRIFT', points: 2410, wins: 8, podiums: 14, races: 20, bestLap: '01:25.890', winRate: 40, category: 'Rally RC', level: 'PRO' },
  { rank: 4, name: 'Bobur Hasanov', nickname: 'BOBUR_RC', points: 2180, wins: 7, podiums: 12, races: 19, bestLap: '01:26.234', winRate: 37, category: 'Formula RC', level: 'ADVANCED' },
  { rank: 5, name: 'Ulugbek Nazarov', nickname: 'U_HYPER', points: 1960, wins: 6, podiums: 10, races: 18, bestLap: '01:27.567', winRate: 33, category: 'Hypercar RC', level: 'ADVANCED' },
  { rank: 6, name: 'Kamol Yusupov', nickname: 'KAMOL_LM', points: 1740, wins: 5, podiums: 9, races: 17, bestLap: '01:28.123', winRate: 29, category: 'Le Mans RC', level: 'INTERMEDIATE' },
  { rank: 7, name: 'Sherzod Ergashev', nickname: 'SHER_GT', points: 1520, wins: 4, podiums: 8, races: 16, bestLap: '01:29.456', winRate: 25, category: 'GT RC', level: 'INTERMEDIATE' },
  { rank: 8, name: 'Otabek Ruziyev', nickname: 'OTA_SC', points: 1280, wins: 3, podiums: 6, races: 15, bestLap: '01:30.789', winRate: 20, category: 'Supercar RC', level: 'BEGINNER' },
];

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  ELITE: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  PRO: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  ADVANCED: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  INTERMEDIATE: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  BEGINNER: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' },
};

const categories = ['Barchasi', 'Formula RC', 'GT RC', 'Rally RC', 'Hypercar RC', 'Le Mans RC', 'Supercar RC'];

export default function LeaderboardPage() {
  const [categoryFilter, setCategoryFilter] = useState('Barchasi');
  const [view, setView] = useState('global');

  const filtered = mockLeaderboard.filter(r => categoryFilter === 'Barchasi' || r.category === categoryFilter);

  const top3 = filtered.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Eng yaxshi poygachilar reytingi</p>
        </div>
        <div className="flex gap-2">
          {['global', 'category'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${view === v ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-white'}`}>
              {v === 'global' ? 'Global' : 'Kategoriya'}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${categoryFilter === c ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-white hover:border-white/20'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          {/* 2nd */}
          <div className="bg-card border border-gray-500/20 rounded-xl p-4 text-center order-1 flex flex-col items-center mt-4">
            <div className="w-12 h-12 rounded-full bg-gray-400/10 border-2 border-gray-400/30 flex items-center justify-center mb-2">
              <Medal className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 font-display font-bold">2</p>
            <p className="text-sm font-heading font-semibold text-white mt-1 truncate w-full">{top3[1].name}</p>
            <p className="text-xs text-muted-foreground font-mono">@{top3[1].nickname}</p>
            <p className="text-xl font-display font-bold text-gray-300 mt-2">{top3[1].points.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">ball</p>
          </div>
          {/* 1st */}
          <div className="bg-card border border-yellow-500/30 rounded-xl p-4 text-center order-0 flex flex-col items-center racing-glow">
            <div className="w-14 h-14 rounded-full bg-yellow-500/15 border-2 border-yellow-500/40 flex items-center justify-center mb-2">
              <Crown className="w-7 h-7 text-yellow-500" />
            </div>
            <p className="text-xs text-yellow-400 font-display font-bold">1</p>
            <p className="text-sm font-heading font-semibold text-white mt-1 truncate w-full">{top3[0].name}</p>
            <p className="text-xs text-muted-foreground font-mono">@{top3[0].nickname}</p>
            <p className="text-2xl font-display font-bold text-yellow-400 mt-2">{top3[0].points.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">ball</p>
          </div>
          {/* 3rd */}
          <div className="bg-card border border-orange-500/20 rounded-xl p-4 text-center order-2 flex flex-col items-center mt-6">
            <div className="w-12 h-12 rounded-full bg-orange-400/10 border-2 border-orange-400/30 flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-xs text-orange-400 font-display font-bold">3</p>
            <p className="text-sm font-heading font-semibold text-white mt-1 truncate w-full">{top3[2].name}</p>
            <p className="text-xs text-muted-foreground font-mono">@{top3[2].nickname}</p>
            <p className="text-xl font-display font-bold text-orange-400 mt-2">{top3[2].points.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">ball</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">#</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Racer</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden md:table-cell">Kategoriya</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden sm:table-cell">Daraja</th>
                <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Ball</th>
                <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden lg:table-cell">G'alaba</th>
                <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden xl:table-cell">Win %</th>
                <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden xl:table-cell">Best Lap</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((racer, i) => {
                const level = levelColors[racer.level] || levelColors.BEGINNER;
                return (
                  <tr key={racer.rank} className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-5 py-3.5">
                      <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-display font-bold
                        ${racer.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : racer.rank === 2 ? 'bg-gray-400/20 text-gray-300' : racer.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted text-muted-foreground'}
                      `}>{racer.rank}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary flex-shrink-0">
                          {racer.name[0]}
                        </div>
                        <div>
                          <p className="text-sm text-white font-heading font-medium">{racer.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">@{racer.nickname}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground font-heading">{racer.category}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded border ${level.bg} ${level.text} ${level.border}`}>{racer.level}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-base font-display font-bold text-primary">{racer.points.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                      <span className="text-sm font-heading text-white">{racer.wins}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden xl:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${racer.winRate}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono w-8">{racer.winRate}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden xl:table-cell">
                      <span className="text-xs font-mono text-green-400">{racer.bestLap}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}