import { usePublicStreams } from '@/hooks/api/useStreams';
import { Radio, Play, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFileUrl } from '@/lib/getFileUrl';
import { isValidSafeUrl } from '@/lib/security';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

export default function PublicStreamsPage() {
  const { data: streams, isLoading, isError, refetch } = usePublicStreams({ limit: 100 });

  if (isError) {
    return <div className="max-w-7xl mx-auto px-4"><ErrorState type="server" title="Streamlar yuklanmadi" onRetry={() => { void refetch(); }} /></div>;
  }

  const items = streams?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white tracking-wide uppercase flex items-center gap-2.5">
          <Radio className="w-8 h-8 text-primary animate-pulse" />
          Videotranslyatsiyalar
        </h1>
        <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-1">
          F1RC.UZ • Live race streams
        </p>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-2xl space-y-3">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="Translyatsiyalar topilmadi" description="Hozirda hech qanday faol efirlar mavjud emas." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(stream => {
            const isLive = stream.status === 'LIVE';
            const safeStreamUrl = isValidSafeUrl(stream.streamUrl) ? stream.streamUrl : undefined;
            return (
              <div
                key={stream.id}
                className="bg-card border border-border hover:border-primary/30 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 group"
              >
                {/* Cover/Thumbnail */}
                <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                  {stream.event?.coverImageUrl ? (
                    <ImageWithFallback src={getFileUrl(stream.event.coverImageUrl)} fallbackType="stream" alt={stream.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <Radio className="w-12 h-12 text-muted-foreground" />
                  )}

                  {/* Play overlay for live stream */}
                  {isLive && (
                    <Link
                      to={`/live?id=${stream.id}`}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </Link>
                  )}

                  {/* Live/Offline Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                      isLive ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                      {stream.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading font-semibold text-white tracking-wide text-base leading-snug">
                      {stream.title}
                    </h3>
                    {stream.event?.name && <p className="text-xs text-muted-foreground font-body">{stream.event.name}</p>}
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    {isLive ? (
                      <Link
                        to={`/live?id=${stream.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        Tomosha qilish
                        <Play className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground font-heading">
                        Efir yakunlangan
                      </span>
                    )}

                    {safeStreamUrl && (
                      <a
                        href={safeStreamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                      >
                        <span className="font-mono text-[10px]">Tashqi Havola</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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
