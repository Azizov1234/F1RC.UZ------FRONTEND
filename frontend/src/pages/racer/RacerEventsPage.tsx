import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const mockEvents = [
  { id: 1, title: 'Formula RC Sprint Championship', category: 'Formula RC', date: '2025-02-15', time: '14:00', arena: 'F1RC Arena Toshkent', capacity: 20, booked: 18, status: 'UPCOMING', price: '$45', myBooking: null },
  { id: 2, title: 'GT Race Night Series', category: 'GT RC', date: '2025-02-16', time: '19:00', arena: 'F1RC Arena Toshkent', capacity: 16, booked: 16, status: 'ACTIVE', price: '$60', myBooking: 'CONFIRMED' },
  { id: 3, title: 'Rally Endurance Pro', category: 'Rally RC', date: '2025-02-18', time: '10:00', arena: 'F1RC Arena Toshkent', capacity: 12, booked: 7, status: 'UPCOMING', price: '$35', myBooking: null },
  { id: 4, title: 'Hypercar Challenge Cup', category: 'Hypercar RC', date: '2025-02-20', time: '20:00', arena: 'F1RC Arena Toshkent', capacity: 8, booked: 3, status: 'UPCOMING', price: '$80', myBooking: null },
];

export default function RacerEventsPage() {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'MY' ? mockEvents.filter(e => e.myBooking) : mockEvents;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-heading font-bold text-white">Eventlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Poyga tadbirlariga ro'yxatdan o'ting</p>
      </div>

      <div className="flex gap-2">
        {['ALL', 'MY'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-xs font-heading font-semibold transition-all ${filter === f ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-white'}`}>
            {f === 'ALL' ? 'Barchasi' : 'Mening Eventlarim'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(event => {
          const slotsLeft = event.capacity - event.booked;
          return (
            <div key={event.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-heading font-bold tracking-widest uppercase text-primary">{event.category}</span>
                <StatusBadge status={event.status} />
              </div>
              <h3 className="font-heading font-semibold text-white mb-2">{event.title}</h3>
              <div className="space-y-1.5 mb-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Clock className="w-3 h-3" /><span className="font-mono">{event.date} · {event.time}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /><span>{event.arena}</span></div>
                <div className="flex items-center gap-2"><Users className="w-3 h-3" /><span>{slotsLeft > 0 ? `${slotsLeft} bo'sh joy` : "Joy qolmagan"}</span></div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xl font-display font-bold text-primary">{event.price}</span>
                {event.myBooking ? (
                  <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg font-heading font-semibold">Booking qilingan ✓</span>
                ) : slotsLeft > 0 ? (
                  <button className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all">
                    Booking qilish
                  </button>
                ) : (
                  <span className="text-xs text-red-400 font-heading">To'liq</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}