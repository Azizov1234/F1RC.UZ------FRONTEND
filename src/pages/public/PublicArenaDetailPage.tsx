import { useParams, Link } from 'react-router-dom';
import { usePublicArena } from '@/hooks/api/useArenas';
import { MapPin, ArrowLeft, Layers, Compass } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getFileUrl } from '@/lib/getFileUrl';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

export default function PublicArenaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: arena, isLoading, isError, refetch } = usePublicArena(id);

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState type="server" title="Arena ma'lumotlari yuklanmadi" onRetry={() => { void refetch(); }} />
        <div className="mt-4 text-center">
          <Link to="/arenas" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Arenalar ro'yxatiga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/arenas" className="inline-flex items-center gap-2 text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <Skeleton className="h-64 rounded-2xl w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !arena ? (
        <div className="text-center py-12 text-muted-foreground">Arena topilmadi.</div>
      ) : (
        <div className="space-y-8">
          {/* Cover image & Title card */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
            <div className="h-64 sm:h-80 bg-muted relative flex items-center justify-center">
              {arena.coverImageUrl ? (
                <ImageWithFallback src={getFileUrl(arena.coverImageUrl)} fallbackType="arena" alt={arena.name} className="w-full h-full object-cover" />
              ) : (
                <MapPin className="w-16 h-16 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full bg-primary/95 text-white">
                  Racing Track Layout
                </span>
                <h1 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-wide">
                  {arena.name}
                </h1>
                {arena.city && (
                  <p className="text-xs sm:text-sm text-zinc-300 font-mono flex items-center gap-1.5">
                    📍 {arena.city} {arena.address ? `• ${arena.address}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-6 sm:p-8 space-y-4">
              <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                Arena tavsifi
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-body">
                {arena.description || arena.address || 'Tavsif hali kiritilmagan.'}
              </p>
            </div>
          </div>

          {/* Track Layouts & Zones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: Track Layouts */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-lg">
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-3">
                <Compass className="w-5 h-5 text-primary" />
                Trek chizmalari (Layouts)
              </h3>

              {arena.trackLayouts && arena.trackLayouts.length > 0 ? (
                <div className="space-y-3">
                  {arena.trackLayouts.map((track) => (
                    <div key={track.id} className="border border-border/80 rounded-2xl p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-white font-heading uppercase tracking-wide">{track.name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-muted-foreground pt-1">
                        <div>Uzunligi: <span className="text-white font-semibold">{track.lengthMeters != null ? `${track.lengthMeters} m` : '—'}</span></div>
                        <div>Murakkablik: <span className="text-white font-semibold">{track.difficulty || '—'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground py-6 text-center">
                  Hozircha trek chizmalari mavjud emas.
                </div>
              )}
            </div>

            {/* Column 2: Arena Zones */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-lg">
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-3">
                <Layers className="w-5 h-5 text-primary" />
                Arena zonalari
              </h3>

              {arena.arenaZones && arena.arenaZones.length > 0 ? (
                <div className="space-y-3">
                  {arena.arenaZones.map((zone) => (
                    <div key={zone.id} className="border border-border/80 rounded-2xl p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-white font-heading uppercase tracking-wide">{zone.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-body">
                        {zone.description || 'Tavsif hali kiritilmagan.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground py-6 text-center">
                  Zonalar haqida ma'lumot mavjud emas.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
