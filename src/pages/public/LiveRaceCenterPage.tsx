import { useSearchParams, Link } from 'react-router-dom';
import { usePublicStreams } from '@/hooks/api/useStreams';
import { usePublicEvent } from '@/hooks/api/useEvents';
import { Radio, ArrowLeft, RefreshCw, Cpu, Activity, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { useLeaderboard } from '@/hooks/api/useLeaderboard';
import { isValidSafeUrl } from '@/lib/security';

export default function LiveRaceCenterPage() {
  const [searchParams] = useSearchParams();
  const streamId = searchParams.get('id');

  // Load all public streams
  const { data: streams, isLoading: loadingStreams, isError: errStreams, refetch } = usePublicStreams({ limit: 100 });

  // Find the selected stream or the first active/live stream
  const activeStream = streams?.data?.find(s => String(s.id) === String(streamId)) ?? streams?.data?.find(s => s.status === 'LIVE');

  // Fetch detailed public event info if available
  const eventId = activeStream?.event?.id ?? activeStream?.eventId ?? undefined;
  const { data: eventDetail, isLoading: loadingEvent } = usePublicEvent(eventId, !!eventId);
  const leaderboardParams = eventDetail
    ? { seasonId: eventDetail.seasonId, categoryId: eventDetail.categoryId, limit: 5 }
    : undefined;
  const leaderboardQuery = useLeaderboard(leaderboardParams);
  const safeStreamUrl = activeStream?.streamUrl && isValidSafeUrl(activeStream.streamUrl)
    ? activeStream.streamUrl
    : undefined;

  if (errStreams) {
    return <div className="max-w-7xl mx-auto px-4"><ErrorState type="server" title="Efir ma'lumotlari yuklanmadi" onRetry={() => { void refetch(); }} /></div>;
  }

  const isLoading = loadingStreams || Boolean(eventId && loadingEvent);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/streams" className="inline-flex items-center gap-2 text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Barcha Efirlar
          </Link>
          <span className="text-muted-foreground/40 font-mono text-xs">/</span>
          <span className="text-xs text-white uppercase tracking-wider font-mono">Live Race Center</span>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex min-h-11 items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-xs font-heading text-muted-foreground hover:text-white transition-all duration-200 active:scale-95"
          aria-label="Jonli poyga ma'lumotlarini yangilash"
        >
          <RefreshCw className="w-3 h-3" /> Natijalarni yangilash
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        </div>
      ) : !activeStream ? (
        <div className="text-center py-16 bg-card border border-border rounded-3xl space-y-4" role="status" aria-live="polite">
          <Radio className="w-16 h-16 text-muted-foreground/60 mx-auto" />
          <h2 className="font-display text-xl font-bold text-white uppercase tracking-wide">Hozirda faol poygalar mavjud emas</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Jonli aylanma vaqtlar va poyga telemetriyasini ko'rish uchun keyingi musobaqalarni kuting.
          </p>
          <Link to="/events" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-heading font-semibold text-sm">
            Eventlarni ko'rish
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Stream Container */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-black rounded-3xl border border-border overflow-hidden relative shadow-2xl">
              {safeStreamUrl ? (
                <iframe
                  src={safeStreamUrl}
                  title={activeStream.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Radio className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white uppercase tracking-wider">Video oqim yuklanmadi</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">Efir havolasi backend tomonidan taqdim etilmagan.</p>
                  </div>
                </div>
              )}

              {/* Live indicator tag overlay */}
              {activeStream.status === 'LIVE' && (
                <div className="absolute top-4 left-4 z-10">
                  <LiveIndicator pulse size="sm" />
                </div>
              )}
            </div>

            {/* Stream info card */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h2 className="font-display text-xl font-black text-white uppercase tracking-wide">
                {activeStream.title}
              </h2>
              {activeStream.event?.name && <p className="text-xs text-muted-foreground font-body">{activeStream.event.name}</p>}
              {eventDetail && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border/60 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground block uppercase text-[9px] tracking-wider">Arena</span>
                    <span className="text-white font-semibold">{eventDetail.arena?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block uppercase text-[9px] tracking-wider">Kategoriya</span>
                    <span className="text-white font-semibold">{eventDetail.category?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block uppercase text-[9px] tracking-wider">Status</span>
                    <span className="text-primary font-semibold">{eventDetail.status || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block uppercase text-[9px] tracking-wider">Kirish narxi</span>
                    <span className="text-white font-semibold">{eventDetail.price == null ? '—' : eventDetail.price === 0 ? 'Bepul' : `${eventDetail.price.toLocaleString()} ${eventDetail.currency || ''}`.trim()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry & Leaderboard Details */}
          <div className="space-y-6">
            {/* Live Telemetry Panel */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-primary" />
                Datchik telemetriyasi
              </h3>

              {/* Simulated/Graceful telemetry status */}
              <div className="bg-zinc-950/60 border border-border/80 rounded-2xl p-4 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-zinc-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-zinc-400">Live telemetry unavailable</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Ushbu poyga sessiyasining datchik drayverlari va real vaqt aylanma telemetriyasi hozircha ochiq rejimda mavjud emas.
                  </p>
                </div>
              </div>

              {/* Telemetry placeholders to keep beautiful visual styling */}
              <div className="space-y-3 opacity-30 pointer-events-none font-mono">
                <div className="border border-border/40 rounded-xl p-3.5 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase text-[9px]">O'rtacha tezlik</span>
                  <span className="text-white font-bold">-- km/h</span>
                </div>
                <div className="border border-border/40 rounded-xl p-3.5 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase text-[9px]">Eng tez aylanish</span>
                  <span className="text-white font-bold">--:---</span>
                </div>
                <div className="border border-border/40 rounded-xl p-3.5 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase text-[9px]">Sessiya aylanmalari</span>
                  <span className="text-white font-bold">-- / --</span>
                </div>
              </div>
            </div>

            {/* Standings/Participants Preview */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-primary" />
                Reyting preview
              </h3>

              {leaderboardQuery.isFetching ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Reyting yuklanmoqda...</div>
              ) : (leaderboardQuery.data?.data.length ?? 0) > 0 ? (
                <ol className="space-y-2">
                  {leaderboardQuery.data?.data.map((entry, index) => (
                    <li key={entry.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-xs">
                      <span className="text-foreground">{entry.rank ?? index + 1}. {entry.user?.fullName || 'Ism ko‘rsatilmagan'}</span>
                      <span className="font-mono font-bold text-primary">{entry.totalPoints} pts</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Public sessiya ishtirokchilari va reyting ma'lumoti hozircha mavjud emas.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
