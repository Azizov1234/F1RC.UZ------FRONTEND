import { useState } from 'react';
import { Trophy, Crown, Medal, Star } from 'lucide-react';

const mockLeaderboard = [
  { rank: 1, name: 'Jahongir T.', nickname: 'J_RACER', points: 2840, wins: 12, isMe: true },
  { rank: 2, name: 'Sardor M.', nickname: 'S_SPEED', points: 2650, wins: 10, isMe: false },
  { rank: 3, name: 'Aziz K.', nickname: 'AZ_DRIFT', points: 2410, wins: 8, isMe: false },
  { rank: 4, name: 'Bobur H.', nickname: 'BOBUR_RC', points: 2180, wins: 7, isMe: false },
  { rank: 5, name: 'Ulugbek N.', nickname: 'U_HYPER', points: 1960, wins: 6, isMe: false },
  { rank: 6, name: 'Kamol Y.', nickname: 'KAMOL_LM', points: 1740, wins: 5, isMe: false },
  { rank: 7, name: 'Sherzod E.', nickname: 'SHER_GT', points: 1520, wins: 4, isMe: false },
  { rank: 8, name: 'Otabek R.', nickname: 'OTA_SC', points: 1280, wins: 3, isMe: false },
];

export default function RacerLeaderboardPage() {
  const top3 = mockLeaderboard.slice(0, 3);
  const rest = mockLeaderboard.slice(3);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-heading font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Reyting
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Global poygachilar reytingi</p>
      </div>

      {/* My position highlight */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
          <Crown className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-heading">Sizning o'rningiz</p>
          <p className="text-lg font-display font-bold text-primary">#1 · 2,840 ball</p>
        </div>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-gray-500/20 rounded-xl p-3 text-center mt-3">
          <Medal className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400 font-display font-bold">2</p>
          <p className="text-xs font-heading font-semibold text-white truncate">{top3[1].name}</p>
          <p className="text-sm font-display font-bold text-gray-300 mt-1">{top3[1].points.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-yellow-500/30 rounded-xl p-3 text-center">
          <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-xs text-yellow-400 font-display font-bold">1</p>
          <p className="text-xs font-heading font-semibold text-white truncate">{top3[0].name}</p>
          <p className="text-sm font-display font-bold text-yellow-400 mt-1">{top3[0].points.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-orange-500/20 rounded-xl p-3 text-center mt-5">
          <Star className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-xs text-orange-400 font-display font-bold">3</p>
          <p className="text-xs font-heading font-semibold text-white truncate">{top3[2].name}</p>
          <p className="text-sm font-display font-bold text-orange-400 mt-1">{top3[2].points.toLocaleString()}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
        {mockLeaderboard.map((racer, i) => (
          <div key={racer.rank} className={`flex items-center gap-3 p-4 ${racer.isMe ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
            <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-display font-bold flex-shrink-0
              ${racer.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : racer.rank === 2 ? 'bg-gray-400/20 text-gray-300' : racer.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted text-muted-foreground'}
            `}>{racer.rank}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-heading font-medium ${racer.isMe ? 'text-primary' : 'text-white'}`}>{racer.name} {racer.isMe && '(Sen)'}</p>
              <p className="text-[10px] text-muted-foreground font-mono">@{racer.nickname}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-display font-bold ${racer.isMe ? 'text-primary' : 'text-white'}`}>{racer.points.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{racer.wins} g'alaba</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}