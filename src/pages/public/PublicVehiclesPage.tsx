import { usePublicVehicles } from '@/hooks/api/useVehicles';
import { Car, Search, ArrowRight, Battery, Gauge } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFileUrl } from '@/lib/getFileUrl';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

export default function PublicVehiclesPage() {
  const [search, setSearch] = useState('');
  const { data: vehiclesRes, isLoading, isError, refetch } = usePublicVehicles({ limit: 100 });

  if (isError) {
    return <div className="max-w-7xl mx-auto px-4"><ErrorState type="server" title="Avtomobillar yuklanmadi" onRetry={() => { void refetch(); }} /></div>;
  }

  const items = vehiclesRes?.data ?? [];
  const filtered = items.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-wide uppercase flex items-center gap-2.5">
            <Car className="w-8 h-8 text-primary" />
            Avtomobillar GaraJi (Fleet)
          </h1>
          <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-1">
            F1RC.UZ • Professional RC racing fleet
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Model yoki klassni qidirish..."
            aria-label="Avtomobilni qidirish"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-h-11 w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
          />
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-5 rounded-2xl space-y-3">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Avtomobillar topilmadi" description="Fleet bo'limida hech qanday mos keladigan avtomobil topilmadi." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(vehicle => (
            <div
              key={vehicle.id}
              className="bg-card border border-border hover:border-primary/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-300 group"
            >
              {/* Image Box */}
              <div className="aspect-video bg-muted border border-border/80 rounded-xl overflow-hidden relative flex items-center justify-center mb-4">
                {vehicle.imageUrl ? (
                  <ImageWithFallback src={getFileUrl(vehicle.imageUrl)} fallbackType="vehicle" alt={vehicle.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Car className="w-12 h-12 text-muted-foreground" />
                )}
                {vehicle.difficulty && (
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-white uppercase tracking-wider">
                    {vehicle.difficulty}
                  </div>
                )}
              </div>

              {/* Info content */}
              <div className="space-y-3 flex-grow">
                <div>
                  <h3 className="font-heading font-semibold text-white tracking-wide text-base leading-snug group-hover:text-primary transition-colors">
                    {vehicle.name}
                  </h3>
                  {vehicle.category && (
                    <span className="text-[9px] font-mono tracking-wider font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {vehicle.category.name}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed font-body line-clamp-2">
                  {vehicle.description || 'Tavsif hali kiritilmagan.'}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border/60 text-xs font-mono text-white">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-primary" />
                    <span>{vehicle.topSpeedKmh != null ? `${vehicle.topSpeedKmh} km/h` : '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-green-400" />
                    <span>{vehicle.batteryLifeMinutes != null ? `${vehicle.batteryLifeMinutes} min` : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  vehicle.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-400 border border-green-500/25' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                }`}>
                  {vehicle.status}
                </span>
                <Link
                  to={`/vehicles/${vehicle.id}`}
                  className="inline-flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform font-heading font-bold uppercase tracking-wider text-[11px]"
                >
                  Batafsil
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
