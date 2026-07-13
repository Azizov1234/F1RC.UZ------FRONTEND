import { useState } from 'react';
import { Tag, Plus, Pencil, Trash2, Flag, Clock, Zap, Search, Image as ImageIcon, Eye } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { useI18n } from '@/lib/i18n';
import PremiumIconBox from '@/components/ui/PremiumIconBox';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import { toast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  useCategories,
  useAdminCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from '@/hooks/api/useCategories';
import { useVehicles } from '@/hooks/api/useVehicles';
import { getFileUrl } from '@/lib/getFileUrl';
import type { RacingCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  speedRange: string;
  trackType: string;
  sortOrder: number;
  isActive: boolean;
}

const categoryAccents = [
  { bar: 'bg-red-500', text: 'text-red-400', surface: 'bg-red-500/10 border-red-500/25' },
  { bar: 'bg-blue-500', text: 'text-blue-400', surface: 'bg-blue-500/10 border-blue-500/25' },
  { bar: 'bg-orange-500', text: 'text-orange-400', surface: 'bg-orange-500/10 border-orange-500/25' },
  { bar: 'bg-purple-500', text: 'text-purple-400', surface: 'bg-purple-500/10 border-purple-500/25' },
] as const;

function categoryAccent(id: number) {
  return categoryAccents[Math.abs(id) % categoryAccents.length];
}

interface ModalProps {
  category?: RacingCategory | null;
  onClose: () => void;
}

function CategoryModal({ category, onClose }: ModalProps) {
  const { t } = useI18n();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const [form, setForm] = useState<CategoryForm>({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    speedRange: category?.speedRange ?? '',
    trackType: category?.trackType ?? '',
    sortOrder: category?.sortOrder ?? 0,
    isActive: category?.isActive ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(category?.imageUrl ? getFileUrl(category.imageUrl) : null);

  const isEdit = !!category;

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateUploadedFile(file);
      if (!validation.isValid) {
        toast({ title: 'Rasm xatoligi', description: validation.error, variant: 'destructive' });
        e.currentTarget.value = '';
        return;
      }
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append('name', form.name.trim());
    if (form.slug.trim()) formData.append('slug', form.slug.trim());
    if (form.description.trim()) formData.append('description', form.description.trim());
    if (form.speedRange.trim()) formData.append('speedRange', form.speedRange.trim());
    if (form.trackType.trim()) formData.append('trackType', form.trackType.trim());
    formData.append('sortOrder', String(form.sortOrder));
    formData.append('isActive', String(form.isActive));
    if (imageFile) {
      formData.append('imageUrl', imageFile);
    }

    if (isEdit && category?.id) {
      updateMutation.mutate({ id: category.id, data: formData }, {
        onSuccess: () => onClose()
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute inset-0.5 rounded-[inherit] bg-gradient-to-b from-white/5 to-white/0 pointer-events-none" />
        <h2 className="font-heading font-bold text-white text-lg mb-5 tracking-wider uppercase">
          {isEdit ? 'Kategoriyani tahrirlash' : t.addCategory}
        </h2>

        <div className="grid grid-cols-2 gap-4 relative max-h-[60vh] overflow-y-auto pr-1">
          <div className="col-span-2">
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{t.categoryName}</label>
            <input
              value={form.name ?? ''}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="Formula RC"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase() }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="formula-rc"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Track turi</label>
            <input
              value={form.trackType}
              onChange={e => setForm(p => ({ ...p, trackType: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="Circuit"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Tartib raqami</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Tezlik diapazoni</label>
            <input
              value={form.speedRange}
              onChange={e => setForm(p => ({ ...p, speedRange: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="60-80 km/h"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Holat</label>
            <select
              value={form.isActive ? 'ACTIVE' : 'INACTIVE'}
              onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'ACTIVE' }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            >
              <option value="ACTIVE" className="bg-zinc-950">Faol</option>
              <option value="INACTIVE" className="bg-zinc-950">Nofaol</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="col-span-2">
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Kategoriya rasmi</label>
            <div className="flex items-center gap-4 bg-background border border-border rounded-xl p-3">
              <div className="w-16 h-16 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept={IMAGE_UPLOAD_ACCEPT}
                  onChange={handleImageChange}
                  className="hidden"
                  id="category-image-file"
                />
                <label htmlFor="category-image-file" className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/5 border border-border hover:bg-white/10 text-xs font-semibold text-white cursor-pointer transition-all">
                  Rasm tanlash
                </label>
                <p className="text-[10px] text-muted-foreground mt-1">{IMAGE_UPLOAD_RULES_LABEL}</p>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Tavsif</label>
            <textarea
              value={form.description ?? ''}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 relative">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t.cancel}
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            className="flex-1"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saqlanmoqda...' : isEdit ? t.save : t.addCategory}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; category?: RacingCategory | null }>({ open: false });
  const [detailId, setDetailId] = useState<number>();
  const { data: categories = [], isLoading } = useCategories({ search });
  const { data: vehicles = [] } = useVehicles({ limit: 100 });
  const detailQuery = useAdminCategory(detailId);
  const deleteMutation = useDeleteCategory();

  const vehicleCounts = vehicles.reduce<Map<number, number>>((counts, vehicle) => {
    counts.set(vehicle.categoryId, (counts.get(vehicle.categoryId) ?? 0) + 1);
    return counts;
  }, new Map());

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase()) ||
    c.trackType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.categories}
        subtitle="Poyga kategoriyalarini boshqarish"
        icon={Tag}
        actions={
          <Button
            onClick={() => setModal({ open: true, category: null })}
            variant="default"
            className="h-10"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t.addCategory}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Jami kategoriya', value: categories.length, icon: Tag, color: 'zinc' as const },
          { label: 'Faol',            value: categories.filter(c => c.isActive).length, icon: Flag, color: 'green' as const },
          { label: 'Jami avtomobil',  value: vehicles.length, icon: Zap, color: 'blue' as const },
          { label: 'Track turlari',   value: new Set(categories.map(c => c.trackType).filter(Boolean)).size, icon: Clock, color: 'orange' as const },
        ].map(s => (
          <div key={s.label} className="bg-card/60 border border-border/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4">
              <PremiumIconBox icon={s.icon} color={s.color} size="sm" glow={true} />
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1.5 group-hover:text-primary transition-colors duration-300">
              {isLoading ? '...' : s.value}
            </p>
            <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`${t.search} kategoriya...`}
          className="w-full pl-10 pr-4 py-3 bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all duration-300"
        />
      </div>

      {/* Category cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-card/50 border border-border/80 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(cat => {
            const accent = categoryAccent(cat.id);
            const vehicleCount = vehicleCounts.get(cat.id) ?? 0;
            return (
            <div key={cat.id} className="bg-card/50 border border-border/80 rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-lg group hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              {/* Top color bar */}
              <div className={`h-1.5 w-full opacity-80 ${accent.bar}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 duration-300 shadow-md ${accent.surface}`}>
                      <Flag className={`w-5 h-5 ${accent.text}`} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white text-base tracking-wide">{cat.name}</h3>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{cat.slug || `category-${cat.id}`}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(cat.id)}
                    disabled={deleteMutation.isPending || !cat.isActive}
                    className={`text-[9px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md transition-all ${cat.isActive ? 'cursor-pointer hover:scale-105 active:scale-95 bg-green-500/5 border-green-500/20 text-green-400' : 'cursor-default bg-zinc-500/5 border-zinc-500/20 text-zinc-400'}`}
                  >
                    {cat.isActive ? t.active : t.inactive}
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground font-heading mb-4 leading-relaxed line-clamp-2">{cat.description}</p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 py-4 border-y border-border/40">
                  {[
                    { label: 'Track turi',   value: cat.trackType || 'вЂ”', icon: Flag },
                    { label: 'Tezlik',       value: cat.speedRange || 'вЂ”', icon: Zap },
                    { label: 'Tartib',       value: `#${cat.sortOrder}`, icon: Clock },
                    { label: 'Avtomobillar', value: vehicleCount, icon: Tag },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-border/40 flex items-center justify-center flex-shrink-0">
                        <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground font-heading uppercase tracking-widest">{s.label}</p>
                        <p className="text-xs font-display font-bold text-white">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vehicle count */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-widest">Avtomobillar</span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.min(vehicleCount, 8) }).map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-lg bg-white/5 border border-border/80 flex items-center justify-center hover:scale-110 transition-transform duration-200">
                        <div className={`w-1.5 h-1.5 rounded-full ${accent.bar}`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setDetailId(cat.id)}
                    variant="outline"
                    size="sm"
                    className="px-3"
                    title="Backend detailini ko‘rish"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => setModal({ open: true, category: cat })}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    {t.edit}
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(cat.id)}
                    disabled={deleteMutation.isPending || !cat.isActive}
                    variant="outline"
                    size="sm"
                    className={`px-3 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40`}
                    title={cat.isActive ? 'Faolsizlantirish' : 'Allaqachon faolsiz'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );})}
        </div>
      )}

      {modal.open && (
        <CategoryModal
          category={modal.category}
          onClose={() => setModal({ open: false })}
        />
      )}

      <Modal
        isOpen={detailId !== undefined}
        onClose={() => setDetailId(undefined)}
        title="Kategoriya tafsiloti"
        description="Admin detail endpointidan olingan to‘liq ma’lumot"
        size="lg"
      >
        {detailQuery.isLoading ? (
          <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
        ) : detailQuery.isError || !detailQuery.data ? (
          <ErrorState
            size="sm"
            title="Kategoriya tafsiloti yuklanmadi"
            onRetry={() => { void detailQuery.refetch(); }}
            retrying={detailQuery.isFetching}
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/30">
                {detailQuery.data.imageUrl ? <img src={getFileUrl(detailQuery.data.imageUrl)} alt={detailQuery.data.name} className="h-full w-full object-cover" /> : <Tag className="h-8 w-8 text-primary/60" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-foreground">{detailQuery.data.name}</h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${detailQuery.data.isActive ? 'border-green-500/25 bg-green-500/10 text-green-400' : 'border-zinc-500/25 bg-zinc-500/10 text-zinc-400'}`}>{detailQuery.data.isActive ? 'FAOL' : 'NOFAOL'}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">#{detailQuery.data.id} · {detailQuery.data.slug || 'slug yo‘q'}</p>
              </div>
            </div>
            {detailQuery.data.description && <p className="rounded-xl border border-border bg-background/50 p-3 text-sm leading-6 text-muted-foreground">{detailQuery.data.description}</p>}
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ['Track turi', detailQuery.data.trackType || '—'],
                ['Tezlik diapazoni', detailQuery.data.speedRange || '—'],
                ['Tartib', String(detailQuery.data.sortOrder)],
                ['Yaratilgan', new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(detailQuery.data.createdAt))],
              ].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-muted/20 p-3"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd></div>)}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
