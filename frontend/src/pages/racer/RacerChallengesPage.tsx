import { useState } from 'react';
import { Swords, Trophy, Clock, Users, Lock } from 'lucide-react';

const mockChallenges = [
  { id: 1, title: 'Sprint King', desc: '3 ketma-ket sprintda 1-o\'rin egalla', reward: '500 ball', deadline: '2025-02-28', participants: 24, status: 'ACTIVE', progress: 2, target: 3 },
  { id: 2, title: 'Lap Master', desc: '1:23 dan tez lap vaqtini ko\'rsat', reward: '300 ball', deadline: '2025-03-15', participants: 18, status: 'ACTIVE', progress: 0, target: 1 },
  { id: 3, title: 'Season Champion', desc: 'Spring season 1-o\'rnini egalla', reward: '$150,000', deadline: '2025-06-30', participants: 124, status: 'LOCKED', progress: 0, target: 1 },
  { id: 4, title: 'Podium Streak', desc: '5 ketma-ket podyumga chiq', reward: '800 ball', deadline: '2025-03-01', participants: 32, status: 'COMPLETED', progress: 5, target: 5 },
];

export default function RacerChallengesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-heading font-bold text-white flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" /> Challenge
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Maxsus vazifalar va mukofotlar</p>
      </div>

      <div className="space-y-3">
        {mockChallenges.map(ch => (
          <div key={ch.id} className={`bg-card border rounded-xl p-4 ${ch.status === 'COMPLETED' ? 'border-green-500/30 bg-green-500/5' : ch.status === 'LOCKED' ? 'border-border opacity-60' : 'border-border hover:border-primary/30 transition-all'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {ch.status === 'COMPLETED' ? <span className="text-green-400 text-xs font-heading font-bold">✓ BAJARILDI</span>
                  : ch.status === 'LOCKED' ? <span className="flex items-center gap-1 text-muted-foreground text-xs font-heading"><Lock className="w-3 h-3" /> BLOKLANGAN</span>
                  : <span className="text-primary text-xs font-heading font-bold">● AKTIV</span>}
              </div>
              <div className="text-right">
                <p className="text-sm font-display font-bold text-yellow-400">{ch.reward}</p>
                <p className="text-[10px] text-muted-foreground">mukofot</p>
              </div>
            </div>
            <h3 className="font-heading font-bold text-white mb-1">{ch.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{ch.desc}</p>
            
            {ch.status !== 'LOCKED' && (
              <div className="mb-2">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Jarayon</span>
                  <span>{ch.progress}/{ch.target}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${ch.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${(ch.progress / ch.target) * 100}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><Users className="w-3 h-3" /><span>{ch.participants} qatnashchi</span></div>
              <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{ch.deadline}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}