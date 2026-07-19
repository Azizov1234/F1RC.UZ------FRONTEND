import { useParams, Link } from 'react-router-dom';
import { usePublicVehicle } from '@/hooks/api/useVehicles';
import { Car, ArrowLeft, Battery, Gauge, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getFileUrl } from '@/lib/getFileUrl';

export default function PublicVehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading, isError, refetch } = usePublicVehicle(id);

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState type="server" title="Avtomobil ma'lumotlari yuklanmadi" onRetry={() => { void refetch(); }} />
        <div className="mt-4 text-center">
          <Link to="/vehicles" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> GaraJga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/vehicles" className="inline-flex items-center gap-2 text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <Skeleton className="h-64 rounded-2xl w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !vehicle ? (
        <div className="text-center py-12 text-muted-foreground">Avtomobil topilmadi.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Image container */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-center items-center p-6 min-h-[300px]">
            {vehicle.imageUrl ? (
              <img src={getFileUrl(vehicle.imageUrl)} alt={vehicle.name} className="max-h-64 object-contain rounded-2xl" />
            ) : (
              <Car className="w-24 h-24 text-muted-foreground" />
            )}
          </div>

          {/* Column 2: Spec details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {vehicle.category?.name && (
                  <span className="text-[10px] font-mono tracking-widest font-bold uppercase px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                    {vehicle.category.name}
                  </span>
                )}
                {vehicle.difficulty && (
                  <span className="text-[10px] font-mono tracking-widest font-bold uppercase px-2.5 py-0.5 rounded bg-zinc-800 text-white">
                    Diff: {vehicle.difficulty}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl font-black text-white uppercase tracking-wide">
                {vehicle.name}
              </h1>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed font-body">
              {vehicle.description || 'Tavsif hali kiritilmagan.'}
            </p>

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">Maksimal Tezlik</span>
                <div className="flex items-center gap-2 text-white">
                  <Gauge className="w-5 h-5 text-primary" />
                  <span className="text-lg font-black font-mono">{vehicle.topSpeedKmh != null ? `${vehicle.topSpeedKmh} km/h` : '—'}</span>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">Batareya Quvvati</span>
                <div className="flex items-center gap-2 text-white">
                  <Battery className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-black font-mono">{vehicle.batteryLifeMinutes != null ? `${vehicle.batteryLifeMinutes} min` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Other details */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Texnik xususiyatlar
              </h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground font-mono">
                <li className="flex justify-between">
                  <span>Drayver Boshqaruvi:</span>
                  <span className="text-white font-semibold">{vehicle.controlType || '—'}</span>
                </li>
                <li className="flex justify-between">
                  <span>GaraJ holati:</span>
                  <span className="text-primary font-semibold">{vehicle.status}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
