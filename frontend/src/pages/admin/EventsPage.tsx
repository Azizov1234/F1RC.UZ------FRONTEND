import { useState } from 'react';
import { Calendar, Plus, Search, ChevronRight, MapPin, Users, Clock } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const mockEvents = [
  { id: 1, title: 'Formula RC Sprint Championship', category: 'Formula RC', date: '2025-02-15', time: '14:00', arena: 'F1RC Arena Toshkent', capacity: 20, booked: 18, status: 'UPCOMING', price: '$45' },
  { id: 2, title: 'GT Race Night Series', category: 'GT RC', date: '2025-02-16', time: '19:00', arena: 'F1RC Arena Toshkent', capacity: 16, booked: 16, status: 'ACTIVE', price: '$60' },
  { id: 3, title: 'Rally Endurance Pro', category: 'Rally RC', date: '2025-02-18', time: '10:00', arena: 'F1RC Arena Toshkent', capacity: 12, booked: 7, status: 'UPCOMING', price: '$35' },
  { id: 4, title: 'Hypercar Challenge Cup', category: 'Hypercar RC', date: '2025-02-20', time: '20:00', arena: 'F1RC Arena Toshkent', capacity: 8, booked: 3, status: 'DRAFT', price: '$80' },
  { id: 5, title: 'Le Mans Endurance Race', category: 'Le Mans RC', date: '2025-01-28', time: '09:00', arena: 'F1RC Arena Toshkent', capacity: 24, booked: 24, status: 'FINISHED', price: '$70' },
  { id: 6, title: 'Supercar Speed Run', category: 'Supercar RC', date: '2025-02-22', time: '15:00', arena: 'F1RC Arena Toshkent', capacity: 10, booked: 0, status: 'DRAFT', price: '$55' },
];

const categoryColors: Record<string, string> = {
  'Formula RC': 'text-red-400',
  'GT RC': 'text-blue-400',
  'Rally RC': 'text-green-400',
  'Hypercar RC': 'text-purple-400',
  'Le Mans RC': 'text-yellow-400',
  'Supercar RC': 'text-orange-400',
};

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = mockEvents.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Eventlar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{mockEvents.length} ta event</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yangi Event</span>
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading font-bold text-white text-lg mb-5">Yangi Event Yaratish</h3>
            <div className="space-y-4">
              {[
                { label: 'Sarlavha', placeholder: 'Formula RC Sprint...', type: 'text' },
                { label: 'Sana', placeholder: '', type: 'date' },
                { label: 'Vaqt', placeholder: '', type: 'time' },
                { label: 'Kapasite', placeholder: '20', type: 'number' },
                { label: 'Narx ($)', placeholder: '45', type: 'number' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                </div>
              ))}
              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1 block">Kategoriya</label>
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                  {['Formula RC', 'GT RC', 'Rally RC', 'Hypercar RC', 'Le Mans RC', 'Supercar RC'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-white hover:border-white/30 transition-all font-heading">Bekor</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm text-white font-heading font-semibold transition-all">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Event qidirish..." className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2">
          {['ALL', 'DRAFT', 'UPCOMING', 'ACTIVE', 'FINISHED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-heading font-semibold tracking-wide transition-all ${statusFilter === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-white hover:border-white/20'}`}>
              {s === 'ALL' ? 'Barchasi' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(event => (
          <div key={event.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group">
            {/* Color stripe */}
            <div className={`h-1 w-full ${event.status === 'ACTIVE' ? 'bg-primary' : event.status === 'UPCOMING' ? 'bg-blue-500' : event.status === 'DRAFT' ? 'bg-gray-600' : 'bg-gray-700'}`} />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-heading font-bold tracking-widest uppercase ${categoryColors[event.category] || 'text-muted-foreground'}`}>{event.category}</span>
                <StatusBadge status={event.status} />
              </div>
              <h3 className="font-heading font-semibold text-white text-sm leading-snug mb-3">{event.title}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-mono">{event.date} · {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{event.arena}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{event.booked}/{event.capacity}</span>
                  </div>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(event.booked / event.capacity) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-lg font-display font-bold text-primary">{event.price}</span>
                <button className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 font-heading transition-colors group-hover:text-white">
                  Boshqarish <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}