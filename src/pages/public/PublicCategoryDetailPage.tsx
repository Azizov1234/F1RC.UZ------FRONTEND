import { useParams, Link } from 'react-router-dom';
import { usePublicCategory } from '@/hooks/api/useCategories';
import { ArrowLeft, Gauge, Activity, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getFileUrl } from '@/lib/getFileUrl';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

export default function PublicCategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: category, isLoading, isError, refetch } = usePublicCategory(id);

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState type="server" title="Kategoriya ma'lumotlari yuklanmadi" onRetry={() => { void refetch(); }} />
        <div className="mt-4 text-center">
          <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Toifalar ro'yxatiga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/categories" className="inline-flex items-center gap-2 text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !category ? (
        <div className="text-center py-12 text-muted-foreground">Kategoriya topilmadi.</div>
      ) : (
        <div className="space-y-8">
          {/* Main Info Card */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              {category.imageUrl && (
                <ImageWithFallback
                  src={getFileUrl(category.imageUrl)}
                  fallbackType="category"
                  alt={category.name}
                  className="mb-6 aspect-[16/7] w-full rounded-2xl object-cover"
                />
              )}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  Motorsport klass
                </span>
                {category.slug && (
                  <span className="text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full bg-zinc-800 text-white">
                    {category.slug}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-wide">
                {category.name}
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed font-body max-w-2xl">
                {category.description || 'Tavsif hali kiritilmagan.'}
              </p>
            </div>
          </div>

          {/* Config details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">Tezlik ko'rsatkichi</span>
              <div className="flex items-center gap-2 text-white">
                <Gauge className="w-5 h-5 text-primary" />
                <span className="text-lg font-black font-mono">{category.speedRange || '—'}</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">Trek turi</span>
              <div className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-lg font-black font-mono">{category.trackType || '—'}</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">Holati</span>
              <div className="flex items-center gap-2 text-white">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-black font-mono uppercase">{category.isActive ? 'Faol' : 'Nofaol'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
