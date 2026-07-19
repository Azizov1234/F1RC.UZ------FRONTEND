import { usePublicEvents } from '@/hooks/api/useEvents';
import { Calendar, Search, ArrowRight, MapPin, DollarSign, Clock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFileUrl } from '@/lib/getFileUrl';
import { format } from 'date-fns';

export default function PublicEventsPage() {
  const [search, setSearch] = useState('');
  const [startsFrom] = useState(() => new Date().toISOString());
  const { data: eventsRes, isLoading, isError, refetch } = usePublicEvents({ limit: 100, startsFrom });

  if (isError) {
    return <div className="max-w-7xl mx-auto px-4"><ErrorState type="server" title="Eventlar yuklanmadi" onRetry={() => { void refetch(); }} /></div>;
  }

  const items = eventsRes?.data ?? [];
  const filtered = items.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-wide uppercase flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-primary" />
            Poygalar va Musobaqalar
          </h1>
          <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-1">
            F1RC.UZ • Upcoming motorsport events
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Eventni qidirish..."
            aria-label="Eventni qidirish"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-h-11 w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
          />
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-3xl space-y-4">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Kelgusi poygalar topilmadi" description="Hozirda hech qanday faol poygalar rejalashtirilmagan." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(event => {
            const formattedDate = event.startsAt
              ? format(new Date(event.startsAt), 'dd.MM.yyyy HH:mm')
              : 'Sana aniqlanmagan';
            const isOpen = event.status === 'REGISTRATION_OPEN';

            return (
              <div
                key={event.id}
                className="bg-card border border-border hover:border-primary/30 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 group"
              >
                {/* Cover Image */}
                <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center">
                  {event.coverImageUrl ? (
                    <img src={getFileUrl(event.coverImageUrl)} alt={event.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <Calendar className="w-12 h-12 text-muted-foreground" />
                  )}
                  {event.category?.name && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded text-[8px] font-mono text-white uppercase tracking-wider">
                      {event.category.name}
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-2.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                    isOpen ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                  }`}>
                    {event.status}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-white tracking-wide text-lg uppercase group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-body line-clamp-3">
                      {event.description || 'Tavsif hali kiritilmagan.'}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="pt-3 border-t border-border space-y-2 text-xs font-mono text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{formattedDate}</span>
                    </div>
                    {event.arena && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{event.arena.name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-green-400" />
                        <span>{event.price == null ? '—' : event.price === 0 ? 'Bepul' : `${event.price.toLocaleString()} ${event.currency || ''}`.trim()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60">
                    <Link
                      to={`/events/${event.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-display text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-md shadow-primary/10"
                    >
                      Batafsil ko'rish
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
