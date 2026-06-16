import { useState } from 'react';
import { Tag, Plus, Pencil, Trash2, Flag, Clock, Zap, Search } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { useI18n } from '@/lib/i18n';
import PremiumIconBox from '@/components/ui/PremiumIconBox';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  laps: number;
  maxSpeed: string;
  vehicleCount: number;
  minAge: number;
  entryFee: string;
  active: boolean;
}

const mockCategories: Category[] = [
  {
    id: 'c1', name: 'Formula RC', code: 'FRC', active: true, color: '#FF0000',
    description: 'Open-wheel Formula tarzida RC poyga. Eng tezkor sinf.',
    laps: 20, maxSpeed: '80 km/h', vehicleCount: 6, minAge: 14, entryFee: '$45',
  },
  {
    id: 'c2', name: 'GT Race', code: 'GTR', active: true, color: '#0066FF',
    description: 'Gran Turismo uslubidagi RC poyga. Sport mashinalar sinfi.',
    laps: 15, maxSpeed: '75 km/h', vehicleCount: 6, minAge: 12, entryFee: '$35',
  },
  {
    id: 'c3', name: 'Rally RC', code: 'RRC', active: true, color: '#FF6600',
    description: 'Offroad va gravel yo\'llar uchun rally sinfi.',
    laps: 12, maxSpeed: '70 km/h', vehicleCount: 4, minAge: 12, entryFee: '$30',
  },
  {
    id: 'c4', name: 'Hypercar', code: 'HYP', active: true, color: '#9900FF',
    description: 'Ultra-tezkor hypercar RC sinfi. Tajribali racerlar uchun.',
    laps: 25, maxSpeed: '160 km/h', vehicleCount: 4, minAge: 16, entryFee: '$80',
  },
  {
    id: 'c5', name: 'Junior RC', code: 'JRC', active: false, color: '#00CC44',
    description: 'Yosh racerlar uchun mo\'tadil tezlikdagi sinf.',
    laps: 10, maxSpeed: '40 km/h', vehicleCount: 6, minAge: 8, entryFee: '$20',
  },
];

const colorOptions = [
  '#FF0000', '#0066FF', '#FF6600', '#9900FF', '#00CC44',
  '#FFCC00', '#FF0066', '#00CCFF', '#FF9900', '#666666',
];

interface ModalProps {
  category?: Category | null;
  onClose: () => void;
}

function CategoryModal({ category, onClose }: ModalProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<Partial<Category>>(
    category ?? { name: '', code: '', description: '', color: '#FF0000', laps: 15, maxSpeed: '80 km/h', minAge: 12, entryFee: '$30', active: true }
  );
  const isEdit = !!category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute inset-0.5 rounded-[inherit] bg-gradient-to-b from-white/5 to-white/0 pointer-events-none" />
        <h2 className="font-heading font-bold text-white text-lg mb-5 tracking-wider uppercase">
          {isEdit ? 'Kategoriyani tahrirlash' : t.addCategory}
        </h2>

        <div className="grid grid-cols-2 gap-4 relative">
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
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{t.categoryCode}</label>
            <input
              value={form.code ?? ''}
              onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
              maxLength={5}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="FRC"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Kirish narxi</label>
            <input
              value={form.entryFee ?? ''}
              onChange={e => setForm(p => ({ ...p, entryFee: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="$45"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{t.lapsCount}</label>
            <input
              type="number"
              value={form.laps ?? 15}
              onChange={e => setForm(p => ({ ...p, laps: Number(e.target.value) }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{t.maxSpeed}</label>
            <input
              value={form.maxSpeed ?? ''}
              onChange={e => setForm(p => ({ ...p, maxSpeed: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
              placeholder="80 km/h"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Min. yosh</label>
            <input
              type="number"
              value={form.minAge ?? 12}
              onChange={e => setForm(p => ({ ...p, minAge: Number(e.target.value) }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 transition-colors"
            />
          </div>

          {/* Color */}
          <div className="col-span-2">
            <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-2">Rang</label>
            <div className="flex gap-2.5 flex-wrap">
              {colorOptions.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
          <Button variant="default" onClick={onClose} className="flex-1">
            {isEdit ? t.save : t.addCategory}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; category?: Category | null }>({ open: false });

  const filtered = mockCategories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
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
          { label: 'Jami kategoriya', value: mockCategories.length, icon: Tag, color: 'zinc' as const },
          { label: 'Faol',            value: mockCategories.filter(c => c.active).length, icon: Flag, color: 'green' as const },
          { label: 'Jami avtomobil',  value: mockCategories.reduce((s, c) => s + c.vehicleCount, 0), icon: Zap, color: 'blue' as const },
          { label: 'Avg. lap',        value: Math.round(mockCategories.reduce((s, c) => s + c.laps, 0) / mockCategories.length), icon: Clock, color: 'orange' as const },
        ].map(s => (
          <div key={s.label} className="bg-card/60 border border-border/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4">
              <PremiumIconBox icon={s.icon} color={s.color} size="sm" glow={true} />
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1.5 group-hover:text-primary transition-colors duration-300">{s.value}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(cat => (
          <div key={cat.id} className="bg-card/50 border border-border/80 rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-lg group hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            {/* Top color bar */}
            <div className="h-1.5 w-full opacity-80" style={{ backgroundColor: cat.color }} />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-border transition-transform group-hover:scale-105 duration-300 shadow-md" style={{ backgroundColor: cat.color + '10', borderColor: cat.color + '30' }}>
                    <Flag className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-base tracking-wide">{cat.name}</h3>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{cat.code}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md ${cat.active ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-zinc-500/5 border-zinc-500/20 text-zinc-400'}`}>
                  {cat.active ? t.active : t.inactive}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground font-heading mb-4 leading-relaxed line-clamp-2">{cat.description}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 py-4 border-y border-border/40">
                {[
                  { label: t.lapsCount,    value: `${cat.laps} lap`,    icon: Clock },
                  { label: t.maxSpeed,     value: cat.maxSpeed,          icon: Zap },
                  { label: 'Min. yosh',    value: `${cat.minAge}+`,     icon: Flag },
                  { label: 'Narx',         value: cat.entryFee,          icon: Tag },
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
                  {Array.from({ length: cat.vehicleCount }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-lg bg-white/5 border border-border/80 flex items-center justify-center hover:scale-110 transition-transform duration-200">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
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
                  variant="outline"
                  size="sm"
                  className="px-3 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <CategoryModal
          category={modal.category}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
