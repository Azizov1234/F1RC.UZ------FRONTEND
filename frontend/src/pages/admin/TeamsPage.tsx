import { useState } from 'react';
import { Users2, Trophy, Search, Plus, ChevronRight } from 'lucide-react';

const mockTeams = [
  { id: 1, name: 'Red Storm Racing', slug: 'red-storm', category: 'Formula RC', manager: 'Jahongir T.', members: 4, points: 8240, wins: 18, isActive: true },
  { id: 2, name: 'Speed Devils', slug: 'speed-devils', category: 'GT RC', manager: 'Sardor M.', members: 3, points: 6850, wins: 14, isActive: true },
  { id: 3, name: 'Desert Racers', slug: 'desert-racers', category: 'Rally RC', manager: 'Aziz K.', members: 5, points: 5420, wins: 11, isActive: true },
  { id: 4, name: 'Hyperforce', slug: 'hyperforce', category: 'Hypercar RC', manager: 'Bobur H.', members: 2, points: 4180, wins: 8, isActive: true },
  { id: 5, name: 'Le Mans Masters', slug: 'le-mans-masters', category: 'Le Mans RC', manager: 'Kamol Y.', members: 6, points: 3650, wins: 7, isActive: false },
];

const categoryColors: Record<string, string> = {
  'Formula RC': 'text-red-400',
  'GT RC': 'text-blue-400',
  'Rally RC': 'text-green-400',
  'Hypercar RC': 'text-purple-400',
  'Le Mans RC': 'text-yellow-400',
};

export default function TeamsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockTeams.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <Users2 className="w-6 h-6 text-primary" />
            Jamoalar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{mockTeams.length} ta jamoa</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yangi Jamoa</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Jamoa qidirish..." className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((team) => (
          <div key={team.id} className={`bg-card border rounded-xl p-5 hover:border-primary/30 transition-all group ${team.isActive ? 'border-border' : 'border-border/50 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-display font-bold text-primary">
                {team.name[0]}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-heading font-semibold ${team.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                {team.isActive ? 'FAOL' : 'NOFAOL'}
              </span>
            </div>
            <h3 className="font-heading font-bold text-white text-sm mb-0.5">{team.name}</h3>
            <p className={`text-[10px] font-heading font-bold tracking-widest uppercase mb-3 ${categoryColors[team.category] || 'text-muted-foreground'}`}>{team.category}</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'A\'zolar', value: team.members },
                { label: 'Ball', value: team.points.toLocaleString() },
                { label: "G'alaba", value: team.wins },
              ].map(s => (
                <div key={s.label} className="bg-background rounded-lg p-2 text-center">
                  <p className="text-base font-display font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-heading">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <p className="text-xs text-muted-foreground font-heading">Menejer: <span className="text-white">{team.manager}</span></p>
              <button className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-heading transition-colors">
                Ko'rish <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}