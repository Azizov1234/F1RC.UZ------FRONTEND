import { useState } from 'react';
import { Car, Search, Plus, Wrench, CheckCircle, Fuel, Zap, ChevronDown, Image as ImageIcon, Eye } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { useI18n } from '@/lib/i18n';
import PremiumIconBox from '@/components/ui/PremiumIconBox';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import { toast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  useVehicles,
  useAdminVehicle,
  useCreateVehicle,
  useUpdateVehicle,
  useDisableVehicle
} from '@/hooks/api/useVehicles';
import { useCategories } from '@/hooks/api/useCategories';
import { getFileUrl } from '@/lib/getFileUrl';
import { Modal } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import {
  VehicleStatus,
  type Vehicle,
  type VehicleControlType,
  type VehicleDifficulty,
} from '@/types';

const categoryColors = [
  'bg-red-500/5 text-red-400 border-red-500/20',
  'bg-blue-500/5 text-blue-400 border-blue-500/20',
  'bg-orange-500/5 text-orange-400 border-orange-500/20',
  'bg-purple-500/5 text-purple-400 border-purple-500/20',
] as const;

const vehicleStatuses = [
  VehicleStatus.AVAILABLE,
  VehicleStatus.RESERVED,
  VehicleStatus.MAINTENANCE,
  VehicleStatus.DISABLED,
] as const;
const vehicleControlTypes: readonly VehicleControlType[] = ['RC_CONTROLLER', 'FPV', 'STEERING_WHEEL', 'MOBILE_APP', 'SIMULATOR'];
const vehicleDifficulties: readonly VehicleDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO', 'ELITE'];

function isVehicleStatus(value: string): value is Vehicle['status'] {
  return vehicleStatuses.some(status => status === value);
}

function isVehicleControlType(value: string): value is VehicleControlType {
  return vehicleControlTypes.some(controlType => controlType === value);
}

function isVehicleDifficulty(value: string): value is VehicleDifficulty {
  return vehicleDifficulties.some(difficulty => difficulty === value);
}

function categoryColor(categoryId: number) {
  return categoryColors[Math.abs(categoryId) % categoryColors.length];
}

function BatteryLifeBar({ minutes }: { minutes: number | null | undefined }) {
  const value = minutes ?? 0;
  const width = Math.min(100, Math.max(0, (value / 120) * 100));
  const color = value >= 60 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : value >= 30 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden border border-border">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs font-display font-bold text-muted-foreground w-14 text-right">{value} min</span>
    </div>
  );
}

interface VehicleForm {
  categoryId: number;
  name: string;
  slug: string;
  topSpeedKmh: number;
  batteryLifeMinutes: number;
  controlType: VehicleControlType;
  difficulty: VehicleDifficulty;
  status: Vehicle['status'];
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface ModalProps {
  vehicle?: Vehicle | null;
  onClose: () => void;
}

function VehicleModal({ vehicle, onClose }: ModalProps) {
  const { t } = useI18n();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const { data: categories = [] } = useCategories({ limit: 100, isActive: true });
  const [form, setForm] = useState<VehicleForm>({
    categoryId: vehicle?.categoryId ?? 0,
    name: vehicle?.name ?? '',
    slug: vehicle?.slug ?? '',
    topSpeedKmh: vehicle?.topSpeedKmh ?? 0,
    batteryLifeMinutes: vehicle?.batteryLifeMinutes ?? 0,
    controlType: vehicle?.controlType ?? 'RC_CONTROLLER',
    difficulty: vehicle?.difficulty ?? 'BEGINNER',
    status: vehicle?.status ?? VehicleStatus.AVAILABLE,
    description: vehicle?.description ?? '',
    sortOrder: vehicle?.sortOrder ?? 0,
    isActive: vehicle?.isActive ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(vehicle?.imageUrl ? getFileUrl(vehicle.imageUrl) : null);

  const isEdit = !!vehicle;

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!vehicle && form.categoryId === 0 && categories[0]) {
      setForm(current => ({ ...current, categoryId: categories[0].id }));
    }
  }, [categories, form.categoryId, vehicle]);

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
    if (!form.name.trim() || form.categoryId <= 0) {
      toast({ title: 'Majburiy maydonlar', description: 'Nomi va kategoriya tanlanishi shart.', variant: 'destructive' });
      return;
    }
    const formData = new FormData();
    formData.append('categoryId', String(form.categoryId));
    formData.append('name', form.name.trim());
    if (form.slug.trim()) formData.append('slug', form.slug.trim());
    formData.append('topSpeedKmh', String(form.topSpeedKmh));
    formData.append('batteryLifeMinutes', String(form.batteryLifeMinutes));
    formData.append('controlType', form.controlType);
    formData.append('difficulty', form.difficulty);
    formData.append('status', form.status);
    if (form.description.trim()) formData.append('description', form.description.trim());
    formData.append('sortOrder', String(form.sortOrder));
    formData.append('isActive', String(form.isActive));
    if (imageFile) {
      formData.append('imageUrl', imageFile);
    }

    if (isEdit && vehicle?.id) {
      updateMutation.mutate({ id: vehicle.id, data: formData }, {
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
          {isEdit ? "Avtomobilni tahrirlash" : t.addVehicle}
        </h2>

        <div className="grid grid-cols-2 gap-4 relative max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Nomi</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="Tamiya F104 Pro"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase() }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="tamiya-f104-pro"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{t.vehicleCategory}</label>
            <select
              value={form.categoryId}
              onChange={e => setForm(p => ({ ...p, categoryId: Number(e.target.value) }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            >
              <option value={0} className="bg-zinc-950">Kategoriya tanlang</option>
              {categories.map(category => <option key={category.id} value={category.id} className="bg-zinc-950">{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{t.vehicleStatus}</label>
            <select
              value={form.status}
              onChange={e => {
                const value = e.target.value;
                if (isVehicleStatus(value)) setForm(p => ({ ...p, status: value }));
              }}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            >
              {vehicleStatuses.map(s => <option key={s} value={s} className="bg-zinc-950">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{t.maxSpeed}</label>
            <input
              type="number"
              min={0}
              value={form.topSpeedKmh}
              onChange={e => setForm(p => ({ ...p, topSpeedKmh: Number(e.target.value) }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="80"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Batareya (min)</label>
            <input
              type="number"
              min={0}
              value={form.batteryLifeMinutes}
              onChange={e => setForm(p => ({ ...p, batteryLifeMinutes: Number(e.target.value) }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Boshqaruv</label>
            <select
              value={form.controlType}
              onChange={e => {
                const value = e.target.value;
                if (isVehicleControlType(value)) setForm(p => ({ ...p, controlType: value }));
              }}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            >
              {vehicleControlTypes.map(type => <option key={type} value={type} className="bg-zinc-950">{type.split('_').join(' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Qiyinlik</label>
            <select
              value={form.difficulty}
              onChange={e => {
                const value = e.target.value;
                if (isVehicleDifficulty(value)) setForm(p => ({ ...p, difficulty: value }));
              }}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            >
              {vehicleDifficulties.map(difficulty => <option key={difficulty} value={difficulty} className="bg-zinc-950">{difficulty}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Tavsif</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="col-span-2">
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Avtomobil rasmi</label>
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
                  id="vehicle-image-file"
                />
                <label htmlFor="vehicle-image-file" className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/5 border border-border hover:bg-white/10 text-xs font-semibold text-white cursor-pointer transition-all">
                  Rasm tanlash
                </label>
                <p className="text-[10px] text-muted-foreground mt-1">{IMAGE_UPLOAD_RULES_LABEL}</p>
              </div>
            </div>
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
            {createMutation.isPending || updateMutation.isPending ? 'Saqlanmoqda...' : isEdit ? t.save : t.addVehicle}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const { t } = useI18n();
  const [search, setSearch]     = useState('');
  const [catFilter, setCat]     = useState('ALL');
  const [statFilter, setStat]   = useState('ALL');
  const [view, setView]         = useState<'grid' | 'list'>('grid');
  const [modal, setModal]       = useState<{ open: boolean; vehicle?: Vehicle | null }>({ open: false });
  const [detailId, setDetailId] = useState<number>();

  const { data: vehicles = [], isLoading } = useVehicles();
  const { data: categories = [] } = useCategories({ limit: 100 });
  const detailQuery = useAdminVehicle(detailId);
  const disableMutation = useDisableVehicle();

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchQ = v.name.toLowerCase().includes(q) ||
      v.slug?.toLowerCase().includes(q) ||
      v.category?.name.toLowerCase().includes(q);
    const matchC = catFilter === 'ALL' || v.categoryId === Number(catFilter);
    const matchS = statFilter === 'ALL' || v.status === statFilter;
    return matchQ && matchC && matchS;
  });

  const counts = {
    available:   vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length,
    reserved:    vehicles.filter(v => v.status === VehicleStatus.RESERVED).length,
    maintenance: vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.vehicles}
        subtitle="RC avtomobillar inventarizatsiyasi"
        icon={Car}
        actions={
          <Button onClick={() => setModal({ open: true, vehicle: null })} variant="default" className="h-10">
            <Plus className="w-4 h-4 mr-1.5" />
            {t.addVehicle}
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t.available,    count: counts.available,   icon: CheckCircle, color: 'red' as const },
          { label: 'Band qilingan', count: counts.reserved, icon: Zap, color: 'yellow' as const },
          { label: t.maintenance,  count: counts.maintenance, icon: Wrench,      color: 'blue' as const },
        ].map(s => (
          <div key={s.label} className="bg-card/60 border border-border/85 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4">
              <PremiumIconBox icon={s.icon} color={s.color} size="sm" glow={true} />
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1.5 group-hover:text-primary transition-colors duration-300">
              {isLoading ? '...' : s.count}
            </p>
            <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${t.search} raqam, model...`}
            className="w-full pl-10 pr-4 py-3 bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={catFilter}
              onChange={e => setCat(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-card/60 border border-border/80 rounded-2xl text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-950">Barchasi</option>
              {categories.map(category => <option key={category.id} value={category.id} className="bg-zinc-950">{category.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statFilter}
              onChange={e => setStat(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-card/60 border border-border/80 rounded-2xl text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-950">Barchasi</option>
              {vehicleStatuses.map(s => <option key={s} value={s} className="bg-zinc-950">{s === 'AVAILABLE' ? t.available : s === 'RESERVED' ? 'Band qilingan' : s === 'MAINTENANCE' ? t.maintenance : 'Faolsiz'}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {/* View toggle */}
          <div className="flex rounded-2xl border border-border/80 overflow-hidden bg-card/60 backdrop-blur-md">
            {(['grid', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4.5 py-3 text-xs font-heading transition-all duration-300 ${view === v ? 'bg-primary/20 text-white border-r border-border/40' : 'text-muted-foreground hover:text-white border-r border-transparent'}`}
              >
                {v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-card/50 border border-border/80 rounded-2xl h-56" />
          ))}
        </div>
      ) : view === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map(v => {
            return (
              <div key={v.id} className="bg-card/50 border border-border/80 rounded-2xl p-5 hover:border-primary/45 transition-all duration-300 group shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-sm text-white tracking-wide group-hover:text-primary transition-colors">{v.slug || `#${v.id}`}</span>
                  <StatusBadge status={v.status} />
                </div>

                {/* Info block */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-border bg-white/5 shadow-md group-hover:scale-105 duration-300 overflow-hidden">
                    {v.imageUrl ? (
                      <img src={getFileUrl(v.imageUrl)} alt={v.name} className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading font-bold text-white truncate">{v.name}</p>
                    <span className={`inline-block text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-1 ${categoryColor(v.categoryId)}`}>
                      {v.category?.name || `Kategoriya #${v.categoryId}`}
                    </span>
                  </div>
                </div>

                {/* Battery */}
                <div className="mb-4 py-3 border-y border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-widest flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-muted-foreground" /> Batareya quvvati
                    </span>
                  </div>
                  <BatteryLifeBar minutes={v.batteryLifeMinutes} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pb-4">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-heading uppercase tracking-widest">Qiyinlik</p>
                    <p className="text-base font-display font-bold text-white mt-0.5">{v.difficulty || 'вЂ”'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-heading uppercase tracking-widest">Max Tezlik</p>
                    <p className="text-base font-display font-bold text-primary mt-0.5">{v.topSpeedKmh ? `${v.topSpeedKmh} km/h` : 'вЂ”'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border/40">
                  <Button onClick={() => setDetailId(v.id)} variant="outline" size="sm" className="px-3" title="Backend detailini ko‘rish">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button onClick={() => setModal({ open: true, vehicle: v })} variant="outline" size="sm" className="flex-1">
                    Tahrirlash
                  </Button>
                  <Button
                    onClick={() => disableMutation.mutate(v.id)}
                    disabled={disableMutation.isPending || v.status === VehicleStatus.DISABLED}
                    variant={v.status === VehicleStatus.DISABLED ? "outline" : "premium"}
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    {v.status === VehicleStatus.DISABLED ? 'Faolsiz' : "O'chirish"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-card/50 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/80 bg-white/2">
                  {['ID', 'Nomi', 'Kategoriya', 'Batareya', 'Status', 'Qiyinlik', 'Max Tezlik', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-heading text-muted-foreground tracking-widest uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => {
                  return (
                    <tr key={v.id} className={`border-b border-border/40 hover:bg-white/2 transition-colors duration-200 ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-border/40 flex items-center justify-center overflow-hidden">
                            {v.imageUrl ? (
                              <img src={getFileUrl(v.imageUrl)} alt={v.name} className="w-full h-full object-cover" />
                            ) : (
                              <Car className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <span className="font-display font-bold text-white text-sm tracking-wide">#{v.id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white font-heading font-semibold">{v.name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColor(v.categoryId)}`}>
                          {v.category?.name || `#${v.categoryId}`}
                        </span>
                      </td>
                      <td className="px-5 py-4 min-w-[140px]"><BatteryLifeBar minutes={v.batteryLifeMinutes} /></td>
                      <td className="px-5 py-4">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="px-5 py-4 text-sm font-display font-bold text-white">{v.difficulty || 'вЂ”'}</td>
                      <td className="px-5 py-4 text-sm font-display font-bold text-primary">{v.topSpeedKmh ? `${v.topSpeedKmh} km/h` : 'вЂ”'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button onClick={() => setDetailId(v.id)} variant="outline" size="sm" title="Backend detailini ko‘rish">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button onClick={() => setModal({ open: true, vehicle: v })} variant="outline" size="sm">
                            Tahrirlash
                          </Button>
                          <Button
                            onClick={() => disableMutation.mutate(v.id)}
                            disabled={disableMutation.isPending || v.status === VehicleStatus.DISABLED}
                            variant="outline"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                          >
                            {v.status === VehicleStatus.DISABLED ? 'Faolsiz' : "O'chirish"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground font-heading text-sm">{t.noData}</div>
            )}
          </div>
        </div>
      )}

      {modal.open && (
        <VehicleModal
          vehicle={modal.vehicle}
          onClose={() => setModal({ open: false })}
        />
      )}

      <Modal
        isOpen={detailId !== undefined}
        onClose={() => setDetailId(undefined)}
        title="Mashina tafsiloti"
        description="Admin vehicle detail endpointidan olingan ma’lumot"
        size="lg"
      >
        {detailQuery.isLoading ? (
          <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
        ) : detailQuery.isError || !detailQuery.data ? (
          <ErrorState
            size="sm"
            title="Mashina tafsiloti yuklanmadi"
            onRetry={() => { void detailQuery.refetch(); }}
            retrying={detailQuery.isFetching}
          />
        ) : (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
              {detailQuery.data.imageUrl ? <img src={getFileUrl(detailQuery.data.imageUrl)} alt={detailQuery.data.name} className="h-52 w-full object-cover" /> : <div className="flex h-40 items-center justify-center"><Car className="h-12 w-12 text-primary/60" /></div>}
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-heading text-xl font-bold text-foreground">{detailQuery.data.name}</h3><p className="mt-1 font-mono text-xs text-muted-foreground">#{detailQuery.data.id} · {detailQuery.data.slug || 'slug yo‘q'}</p></div>
              <StatusBadge status={detailQuery.data.status} />
            </div>
            {detailQuery.data.description && <p className="rounded-xl border border-border bg-background/50 p-3 text-sm leading-6 text-muted-foreground">{detailQuery.data.description}</p>}
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ['Kategoriya', detailQuery.data.category?.name || `#${detailQuery.data.categoryId}`],
                ['Maksimal tezlik', detailQuery.data.topSpeedKmh ? `${detailQuery.data.topSpeedKmh} km/h` : '—'],
                ['Batareya', detailQuery.data.batteryLifeMinutes ? `${detailQuery.data.batteryLifeMinutes} min` : '—'],
                ['Boshqaruv', detailQuery.data.controlType || '—'],
                ['Qiyinlik', detailQuery.data.difficulty || '—'],
                ['Tartib', String(detailQuery.data.sortOrder)],
                ['Faollik', detailQuery.data.isActive ? 'Faol' : 'Nofaol'],
                ['Yaratilgan', new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(detailQuery.data.createdAt))],
              ].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-muted/20 p-3"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd></div>)}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
