import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePublicEvent } from '@/hooks/api/useEvents';
import { useAuth } from '@/lib/AuthContext';
import { Calendar, ArrowLeft, MapPin, Grid, DollarSign, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getFileUrl } from '@/lib/getFileUrl';
import { format } from 'date-fns';
import SEO from '@/components/SEO';

export default function PublicEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: event, isLoading, isError, refetch } = usePublicEvent(id);

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState type="server" title="Event ma'lumotlari yuklanmadi" onRetry={() => { void refetch(); }} />
        <div className="mt-4 text-center">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Eventlar ro'yxatiga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!isOpen) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/events/${id}`)}`);
    } else if (user?.role === 'racer') {
      navigate('/racer/events');
    } else {
      navigate('/403');
    }
  };

  const formattedDate = event?.startsAt
    ? format(new Date(event.startsAt), 'dd.MM.yyyy HH:mm')
    : 'Sana aniqlanmagan';
  const isOpen = event?.status === 'REGISTRATION_OPEN';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {event && (
        <SEO
          title={event.name}
          description={event.description || `${event.name} event tafsilotlari, sana, arena va ro'yxatdan o'tish holati.`}
          canonicalPath={`/events/${event.id}`}
          image={event.coverImageUrl ? getFileUrl(event.coverImageUrl) : undefined}
          type="article"
          structuredData={{
            '@context': 'https://schema.org',
            '@type': 'SportsEvent',
            name: event.name,
            startDate: event.startsAt,
            endDate: event.endsAt || undefined,
            eventStatus: event.status,
            location: event.arena
              ? { '@type': 'Place', name: event.arena.name, address: event.arena.address || event.arena.city || undefined }
              : undefined,
          }}
        />
      )}
      {/* Back button */}
      <div>
        <Link to="/events" className="inline-flex items-center gap-2 text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <Skeleton className="h-64 rounded-2xl w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !event ? (
        <div className="text-center py-12 text-muted-foreground">Event topilmadi.</div>
      ) : (
        <div className="space-y-8">
          {/* Cover image & Title card */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
            <div className="h-64 sm:h-80 bg-muted relative flex items-center justify-center">
              {event.coverImageUrl ? (
                <img src={getFileUrl(event.coverImageUrl)} alt={event.name} className="w-full h-full object-cover" />
              ) : (
                <Calendar className="w-16 h-16 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {event.category?.name && (
                    <span className="text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full bg-primary/95 text-white">
                      {event.category.name}
                    </span>
                  )}
                  <span className={`text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full ${
                    isOpen ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-wide">
                  {event.name}
                </h1>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 sm:p-8 space-y-4 border-b border-border/60">
              <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                Musobaqa haqida
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-body">
                {event.description || 'Tavsif hali kiritilmagan.'}
              </p>
            </div>

            {/* Specifications & Booking */}
            <div className="p-6 sm:p-8 bg-zinc-950/40 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Sana va Vaqt: <strong className="text-white">{formattedDate}</strong></span>
                </div>
                {event.arena && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Arena: <strong className="text-white">{event.arena.name}</strong></span>
                  </div>
                )}
                {event.trackLayout && (
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-primary" />
                    <span>Trek: <strong className="text-white">{event.trackLayout.name}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span>Kirish to'lovi: <strong className="text-white">{event.price == null ? '—' : event.price === 0 ? 'Bepul' : `${event.price.toLocaleString()} ${event.currency || ''}`.trim()}</strong></span>
                </div>
                {'scheduleSlots' in event && Array.isArray(event.scheduleSlots) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Bo'sh joylar: <strong className="text-white">{event.scheduleSlots.reduce((total, slot) => total + Math.max(0, slot.capacity - slot.bookedCount), 0)}</strong></span>
                  </div>
                )}
              </div>

              {/* Booking Action */}
              <div className="space-y-3">
                <button
                  onClick={handleBooking}
                  disabled={!isOpen}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-display text-sm font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isOpen ? 'Bron qilish' : 'Ro‘yxatdan o‘tish yopiq'}
                </button>
                <p className="text-[10px] text-center text-muted-foreground font-mono leading-relaxed">
                  * Tizimda ro'yxatdan o'tgan 'Racer' foydalanuvchilar poygani bron qila oladi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
