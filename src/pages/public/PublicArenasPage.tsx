import { usePublicArenas } from '@/hooks/api/useArenas';
import { MapPin, ArrowRight, Grid, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFileUrl } from '@/lib/getFileUrl';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

export default function PublicArenasPage() {
  const { data: arenas, isLoading, isError, refetch } = usePublicArenas({ limit: 100 });

  if (isError) {
    return <div className="max-w-7xl mx-auto px-4"><ErrorState type="server" title="Arenalar yuklanmadi" onRetry={() => { void refetch(); }} /></div>;
  }

  const items = arenas?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white tracking-wide uppercase flex items-center gap-2.5">
          <Navigation className="w-8 h-8 text-primary" />
          Poyga Arenalari
        </h1>
        <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-1">
          F1RC.UZ • Professional RC race tracks
        </p>
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
      ) : items.length === 0 ? (
        <EmptyState title="Arenalar topilmadi" description="Hozirda hech qanday faol poyga arenalari ro'yxatga olinmagan." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(arena => (
            <div
              key={arena.id}
              className="bg-card border border-border hover:border-primary/30 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 group"
            >
              {/* Cover Image */}
              <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center">
                {arena.coverImageUrl ? (
                  <ImageWithFallback src={getFileUrl(arena.coverImageUrl)} fallbackType="arena" alt={arena.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <MapPin className="w-12 h-12 text-muted-foreground" />
                )}
                {arena.city && (
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-white uppercase tracking-wider">
                    📍 {arena.city}
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-white tracking-wide text-lg uppercase group-hover:text-primary transition-colors">
                    {arena.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body line-clamp-3">
                    {arena.description || arena.address || 'Tavsif hali kiritilmagan.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-end justify-between gap-3 text-xs text-muted-foreground">
                  <div className="space-y-1">
                  {typeof arena.trackLayoutsCount === 'number' && (
                    <div className="flex items-center gap-1">
                      <Grid className="w-3.5 h-3.5 text-primary" />
                      <span>Treklar: {arena.trackLayoutsCount}</span>
                    </div>
                  )}
                  {typeof arena.zonesCount === 'number' && <div>Zonalar: {arena.zonesCount}</div>}
                  </div>
                  <Link
                    to={`/arenas/${arena.id}`}
                    className="inline-flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform font-heading font-bold uppercase tracking-wider text-[11px]"
                  >
                    Tafsilotlar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
