import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Flag, Zap, ChevronRight, Clock, Star } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const mockUpcomingEvents = [
  { id: 1, title: 'Formula RC Sprint', date: '2025-02-15', time: '14:30', slots: 2, price: '$45', category: 'Formula RC' },
  { id: 2, title: 'GT Race Night', date: '2025-02-16', time: '19:00', slots: 0, price: '$60', category: 'GT RC' },
  { id: 3, title: 'Rally Endurance', date: '2025-02-18', time: '10:00', slots: 5, price: '$35', category: 'Rally RC' },
];

const mockMyResults = [
  { pos: 1, event: 'Formula RC Sprint', date: '2025-02-08', points: '+25', bestLap: '01:23.456' },
  { pos: 3, event: 'GT Race Night', date: '2025-02-05', points: '+15', bestLap: '01:24.890' },
  { pos: 2, event: 'Rally Endurance', date: '2025-02-01', points: '+18', bestLap: '01:25.112' },
];

export default function RacerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-xs text-muted-foreground font-heading uppercase tracking-widest">Xush kelibsiz,</p>
          <h1 className="text-xl font-heading font-bold text-white mt-0.5">{user?.full_name || 'Racer'} 👋</h1>
          <div className="flex gap-4 mt-3">
            {[
              { label: 'Umumiy ball', value: '2,840', color: 'text-primary' },
              { label: "G'alaba", value: '12', color: 'text-yellow-400' },
              { label: 'Poyga', value: '24', color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-lg font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-heading">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Reyting', value: '#1', icon: Trophy, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Daraja', value: 'ELITE', icon: Star, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
          { label: 'Win Rate', value: '50%', icon: Flag, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-3 text-center ${s.color}`}>
            <s.icon className="w-5 h-5 mx-auto mb-1" />
            <p className="text-lg font-display font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-heading">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-white text-sm">Kelgusi Eventlar</h2>
          <Link to="/racer/events" className="text-xs text-primary hover:text-primary/80 font-heading flex items-center gap-1">
            Barchasi <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border/50">
          {mockUpcomingEvents.map(event => (
            <div key={event.id} className="flex items-center gap-3 p-4 hover:bg-white/2 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-medium text-white truncate">{event.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{event.date} · {event.time}</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-display font-bold text-primary">{event.price}</p>
                <p className={`text-[10px] font-heading ${event.slots > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {event.slots > 0 ? `${event.slots} joy` : 'To\'liq'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last results */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-white text-sm">So'nggi Natijalar</h2>
        </div>
        <div className="divide-y divide-border/50">
          {mockMyResults.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-bold flex-shrink-0
                ${r.pos === 1 ? 'bg-yellow-500/20 text-yellow-400' : r.pos === 2 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-500/20 text-orange-400'}
              `}>{r.pos}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-medium text-white truncate">{r.event}</p>
                <p className="text-xs text-muted-foreground font-mono">{r.date} · Best: {r.bestLap}</p>
              </div>
              <span className="text-sm font-display font-bold text-green-400 flex-shrink-0">{r.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}