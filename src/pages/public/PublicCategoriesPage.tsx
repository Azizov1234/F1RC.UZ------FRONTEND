import { usePublicCategories } from '@/hooks/api/useCategories';
import { Search, ArrowRight, Layers, Award } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFileUrl } from '@/lib/getFileUrl';

export default function PublicCategoriesPage() {
  const [search, setSearch] = useState('');
  const { data: categoriesRes, isLoading, isError, refetch } = usePublicCategories({ limit: 100 });

  if (isError) {
    return <div className="max-w-7xl mx-auto px-4"><ErrorState type="server" title="Kategoriyalar yuklanmadi" onRetry={() => { void refetch(); }} /></div>;
  }

  const items = categoriesRes?.data ?? [];
  const filtered = items.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-wide uppercase flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-primary" />
            Poyga Toifalari
          </h1>
          <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-1">
            F1RC.UZ • Motorsport racing categories
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kategoriyani qidirish..."
            aria-label="Kategoriyani qidirish"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-h-11 w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
          />
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-5 rounded-2xl space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Kategoriyalar topilmadi" description="Hech qanday poyga kategoriyasi topilmadi." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(category => (
            <div
              key={category.id}
              className="bg-card border border-border hover:border-primary/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-300 group"
            >
              <div className="mb-5 aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                {category.imageUrl ? (
                  <img
                    src={getFileUrl(category.imageUrl)}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Layers className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-display font-extrabold text-white tracking-wide text-lg uppercase group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.slug && (
                    <span className="text-[10px] font-mono tracking-wider font-bold uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                      {category.slug}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed font-body">
                  {category.description || 'Tavsif hali kiritilmagan.'}
                </p>

                {/* Specs details */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-zinc-300">
                  <div>Trek: <span className="text-white font-semibold">{category.trackType || '—'}</span></div>
                  <div>Tezlik: <span className="text-white font-semibold">{category.speedRange || '—'}</span></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Klass statusi: {category.isActive ? 'Faol' : 'Nofaol'}</span>
                </div>
                <Link
                  to={`/categories/${category.id}`}
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
