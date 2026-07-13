import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  type LucideIcon,
  Award,
  CheckCircle2,
  Crown,
  Eye,
  Flame,
  Medal,
  Pencil,
  Plus,
  Power,
  Search,
  Sparkles,
  Target,
  Timer,
  Trophy,
  UserRoundCheck,
} from 'lucide-react';
import type { CreateAchievementDto } from '@/api/achievements.api';
import TablePagination from '@/components/admin/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import {
  useAdminAchievement,
  useAdminAchievements,
  useAwardAchievement,
  useCreateAchievement,
  useToggleAchievement,
  useUpdateAchievement,
} from '@/hooks/api/useAchievements';
import { getFileUrl } from '@/lib/getFileUrl';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import type { Achievement, AchievementType } from '@/types';

const inputClass =
  'mt-2 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/10';

const achievementTypes: AchievementType[] = [
  'FIRST_RACE',
  'BEST_LAP',
  'WINNER',
  'TOP_RANK',
  'STREAK',
  'CUSTOM',
];

const typeLabels: Record<AchievementType, string> = {
  FIRST_RACE: 'Birinchi poyga',
  BEST_LAP: 'Eng yaxshi lap',
  WINNER: 'G‘olib',
  TOP_RANK: 'Yuqori rank',
  STREAK: 'Seriya',
  CUSTOM: 'Maxsus',
};

const typeIcons: Record<AchievementType, LucideIcon> = {
  FIRST_RACE: CheckCircle2,
  BEST_LAP: Timer,
  WINNER: Trophy,
  TOP_RANK: Crown,
  STREAK: Flame,
  CUSTOM: Sparkles,
};

type ActiveFilter = 'all' | 'active' | 'inactive';

function isAchievementType(value: string): value is AchievementType {
  return achievementTypes.some((type) => type === value);
}

function isActiveFilter(value: string): value is ActiveFilter {
  return value === 'all' || value === 'active' || value === 'inactive';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseOptionalRecord(value: string, label: string): Record<string, unknown> | undefined {
  const normalized = value.trim();
  if (!normalized) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new Error(`${label} to‘g‘ri JSON formatida bo‘lishi kerak`);
  }
  if (!isRecord(parsed)) {
    throw new Error(`${label} JSON obyekt bo‘lishi kerak`);
  }
  return parsed;
}

function prettyRecord(value?: Record<string, unknown> | null): string {
  return value ? JSON.stringify(value, null, 2) : '';
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
  }
  return "Amalni bajarib bo'lmadi";
}

function displayDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function AchievementIcon({ achievement, className }: { achievement: Achievement; className?: string }) {
  const FallbackIcon = typeIcons[achievement.type];
  if (achievement.iconUrl) {
    return <img src={getFileUrl(achievement.iconUrl)} alt={`${achievement.name} ikonkasi`} className={className} />;
  }
  return <FallbackIcon className={className} />;
}

function AchievementFormModal({ achievement, onClose }: { achievement?: Achievement; onClose: () => void }) {
  const createAchievement = useCreateAchievement();
  const updateAchievement = useUpdateAchievement();
  const [code, setCode] = useState(achievement?.code ?? '');
  const [name, setName] = useState(achievement?.name ?? '');
  const [description, setDescription] = useState(achievement?.description ?? '');
  const [type, setType] = useState<AchievementType>(achievement?.type ?? 'CUSTOM');
  const [points, setPoints] = useState(String(achievement?.points ?? 0));
  const [criteria, setCriteria] = useState(prettyRecord(achievement?.criteria));
  const [isActive, setIsActive] = useState(achievement?.isActive ?? true);
  const [icon, setIcon] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const pending = createAchievement.isPending || updateAchievement.isPending;

  useEffect(() => {
    if (!icon) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(icon);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [icon]);

  function selectIcon(file?: File): boolean {
    if (!file) return false;
    const validation = validateUploadedFile(file);
    if (!validation.isValid) {
      toast({
        title: 'Ikonka qabul qilinmadi',
        description: validation.error,
        variant: 'destructive',
      });
      return false;
    }
    setIcon(file);
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = code.trim();
    const normalizedName = name.trim();
    if (!normalizedCode || !normalizedName) {
      toast({ title: 'Kod va nom majburiy', variant: 'destructive' });
      return;
    }
    const parsedPoints = Number(points);
    if (!Number.isInteger(parsedPoints) || parsedPoints < 0) {
      toast({ title: 'Ball 0 yoki undan katta butun son bo‘lishi kerak', variant: 'destructive' });
      return;
    }

    try {
      const payload: CreateAchievementDto = {
        code: normalizedCode,
        name: normalizedName,
        description: description.trim() || undefined,
        type,
        iconUrl: icon,
        criteria: parseOptionalRecord(criteria, 'Criteria'),
        points: parsedPoints,
        isActive,
      };
      if (achievement) {
        await updateAchievement.mutateAsync({ id: achievement.id, data: payload });
        toast({ title: 'Achievement yangilandi' });
      } else {
        await createAchievement.mutateAsync(payload);
        toast({ title: 'Achievement yaratildi' });
      }
      onClose();
    } catch (error: unknown) {
      toast({
        title: achievement ? 'Achievement yangilanmadi' : 'Achievement yaratilmadi',
        description: errorText(error),
        variant: 'destructive',
      });
    }
  }

  const currentIcon = preview ?? (achievement?.iconUrl ? getFileUrl(achievement.iconUrl) : undefined);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={achievement ? 'Achievementni tahrirlash' : 'Yangi achievement'}
      description="Achievement qoidalari, ballari va xavfsiz ikonkasini kiriting."
      size="xl"
    >
      <form onSubmit={submit} className="grid max-h-[74vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Unikal kod
          <input value={code} onChange={(event) => setCode(event.target.value)} required className={inputClass} placeholder="FIRST_VICTORY" />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Nomi
          <input value={name} onChange={(event) => setName(event.target.value)} required className={inputClass} placeholder="Birinchi g‘alaba" />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Turi
          <select
            value={type}
            onChange={(event) => {
              const value = event.target.value;
              if (isAchievementType(value)) setType(value);
            }}
            className={inputClass}
          >
            {achievementTypes.map((value) => <option key={value} value={value}>{typeLabels[value]}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Ball
          <input value={points} onChange={(event) => setPoints(event.target.value)} type="number" min="0" step="1" required className={inputClass} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Tavsif
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Racer bu achievementni qanday olishini tushuntiring" />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Criteria (JSON obyekt)
          <textarea value={criteria} onChange={(event) => setCriteria(event.target.value)} rows={5} spellCheck={false} className={`${inputClass} resize-y font-mono text-xs`} placeholder={'{\n  "wins": 1\n}'} />
        </label>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:col-span-2">
          Ikonka — JPG, JPEG, PNG yoki WEBP; maksimal 5 MB
          <input
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            onChange={(event) => { if (!selectIcon(event.target.files?.[0])) event.currentTarget.value = ''; }}
            className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-bold file:text-primary`}
          />
          <span className="mt-1.5 block normal-case tracking-normal text-[11px] font-normal text-muted-foreground">{IMAGE_UPLOAD_RULES_LABEL}</span>
        </label>
        {currentIcon && (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/45 p-4 sm:col-span-2">
            <img src={currentIcon} alt="Achievement ikonka preview" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-border" />
            <div><p className="text-sm font-bold text-foreground">Ikonka tayyor</p><p className="mt-1 text-xs text-muted-foreground">Saqlanganda multipart orqali yuklanadi.</p></div>
          </div>
        )}
        <label className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-sm font-semibold text-foreground sm:col-span-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-primary" />
          Achievement faol va racerlar uchun mavjud
        </label>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-muted-foreground hover:text-foreground">Bekor qilish</button>
          <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,0,0,0.24)] disabled:opacity-50">
            {pending ? 'Saqlanmoqda…' : achievement ? 'O‘zgarishlarni saqlash' : 'Achievement yaratish'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AwardModal({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  const awardAchievement = useAwardAchievement();
  const [userId, setUserId] = useState('');
  const [metadata, setMetadata] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedUserId = Number(userId);
    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      toast({ title: 'To‘g‘ri racer User ID kiriting', variant: 'destructive' });
      return;
    }
    try {
      await awardAchievement.mutateAsync({
        achievementId: achievement.id,
        userId: parsedUserId,
        metadata: parseOptionalRecord(metadata, 'Metadata'),
      });
      toast({ title: 'Achievement racerga berildi', description: `${achievement.name} · User #${parsedUserId}` });
      onClose();
    } catch (error: unknown) {
      toast({ title: 'Achievement berilmadi', description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Racerga achievement berish" description={`${achievement.name} achievementini aniq User ID bo‘yicha biriktiring.`} size="md">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Racer User ID
          <input value={userId} onChange={(event) => setUserId(event.target.value)} type="number" min="1" step="1" required className={inputClass} placeholder="128" />
        </label>
        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Metadata (ixtiyoriy JSON obyekt)
          <textarea value={metadata} onChange={(event) => setMetadata(event.target.value)} rows={5} spellCheck={false} className={`${inputClass} resize-y font-mono text-xs`} placeholder={'{\n  "source": "admin"\n}'} />
        </label>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-muted-foreground">Bekor qilish</button>
          <button type="submit" disabled={awardAchievement.isPending} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50">
            {awardAchievement.isPending ? 'Berilmoqda…' : 'Achievementni berish'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AchievementDetail({
  id,
  onEdit,
  onAward,
}: {
  id: number | string;
  onEdit: (achievement: Achievement) => void;
  onAward: (achievement: Achievement) => void;
}) {
  const query = useAdminAchievement(id);
  const toggleAchievement = useToggleAchievement();
  const achievement = query.data;

  async function toggle() {
    if (!achievement) return;
    try {
      await toggleAchievement.mutateAsync({ id: achievement.id, isActive: !achievement.isActive });
      toast({ title: achievement.isActive ? 'Achievement nofaol qilindi' : 'Achievement faollashtirildi' });
    } catch (error: unknown) {
      toast({ title: 'Status yangilanmadi', description: errorText(error), variant: 'destructive' });
    }
  }

  if (query.isLoading) return <div className="rounded-3xl border border-border bg-card/70 p-5"><CardSkeleton /></div>;
  if (query.isError || !achievement) return <div className="rounded-3xl border border-border bg-card/70"><ErrorState onRetry={() => query.refetch()} /></div>;

  const TypeIcon = typeIcons[achievement.type];
  return (
    <aside className="overflow-hidden rounded-3xl border border-border bg-card/75 shadow-2xl xl:sticky xl:top-20 xl:self-start">
      <div className="relative overflow-hidden border-b border-border p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-[0_0_25px_rgba(255,0,0,0.15)]">
            <AchievementIcon achievement={achievement} className={achievement.iconUrl ? 'h-full w-full object-cover' : 'h-9 w-9'} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">#{achievement.id}</span>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${achievement.isActive ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-border bg-muted/40 text-muted-foreground'}`}>{achievement.isActive ? 'Faol' : 'Nofaol'}</span>
            </div>
            <h2 className="mt-2 break-words font-heading text-xl font-black text-foreground">{achievement.name}</h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{achievement.code}</p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-sm leading-6 text-muted-foreground">{achievement.description || 'Tavsif kiritilmagan.'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background/45 p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><TypeIcon className="h-4 w-4 text-primary" /><span className="text-[10px] font-bold uppercase tracking-widest">Turi</span></div>
            <p className="mt-2 text-sm font-bold text-foreground">{typeLabels[achievement.type]}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/45 p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><Medal className="h-4 w-4 text-amber-400" /><span className="text-[10px] font-bold uppercase tracking-widest">Mukofot</span></div>
            <p className="mt-2 text-sm font-bold text-foreground">{achievement.points} ball</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Criteria</p>
          {achievement.criteria ? (
            <pre className="max-h-52 overflow-auto rounded-2xl border border-border bg-background/70 p-4 font-mono text-xs leading-5 text-foreground">{JSON.stringify(achievement.criteria, null, 2)}</pre>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">Criteria kiritilmagan.</div>
          )}
        </div>
        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="rounded-xl bg-background/45 p-3"><span className="block text-[9px] uppercase tracking-widest">Yaratilgan</span><strong className="mt-1 block font-medium text-foreground">{displayDate(achievement.createdAt)}</strong></div>
          <div className="rounded-xl bg-background/45 p-3"><span className="block text-[9px] uppercase tracking-widest">Yangilangan</span><strong className="mt-1 block font-medium text-foreground">{displayDate(achievement.updatedAt)}</strong></div>
        </div>
        <div className="grid gap-2 border-t border-border pt-5 sm:grid-cols-3">
          <button onClick={() => onEdit(achievement)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"><Pencil className="h-4 w-4" /> Tahrirlash</button>
          <button onClick={toggle} disabled={toggleAchievement.isPending} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"><Power className="h-4 w-4" /> {achievement.isActive ? 'Nofaol' : 'Faollashtir'}</button>
          <button onClick={() => onAward(achievement)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white shadow-[0_0_18px_rgba(255,0,0,0.22)]"><UserRoundCheck className="h-4 w-4" /> Racerga berish</button>
        </div>
      </div>
    </aside>
  );
}

export default function AchievementsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AchievementType | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [selectedId, setSelectedId] = useState<number | string>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement>();
  const [awarding, setAwarding] = useState<Achievement>();
  const toggleAchievement = useToggleAchievement();
  const query = useAdminAchievements({
    page,
    limit: 12,
    search: search.trim() || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const achievements = useMemo(() => query.data?.data ?? [], [query.data]);
  const meta = query.data?.meta;

  const summary = useMemo(() => ({
    active: achievements.filter((achievement) => achievement.isActive).length,
    points: achievements.reduce((total, achievement) => total + achievement.points, 0),
  }), [achievements]);

  async function toggleFromList(achievement: Achievement) {
    try {
      await toggleAchievement.mutateAsync({ id: achievement.id, isActive: !achievement.isActive });
      toast({ title: achievement.isActive ? 'Achievement nofaol qilindi' : 'Achievement faollashtirildi' });
    } catch (error: unknown) {
      toast({ title: 'Status yangilanmadi', description: errorText(error), variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 shadow-2xl sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400"><Award className="h-3.5 w-3.5" /> Reward engine</div>
            <h1 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">Achievementlar</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Racer yutuqlarini yarating, qoidalarini boshqaring va kerakli foydalanuvchiga admin sifatida biriktiring.</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_0_24px_rgba(255,0,0,0.3)] hover:bg-primary/90"><Plus className="h-4 w-4" /> Yangi achievement</button>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Jami', value: meta?.total ?? 0, icon: Trophy },
            { label: 'Sahifadagi faol', value: summary.active, icon: Target },
            { label: 'Sahifadagi ballar', value: summary.points, icon: Medal },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/45 p-4 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400"><item.icon className="h-5 w-5" /></div>
              <div><p className="text-2xl font-black text-foreground">{item.value}</p><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p></div>
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-3 rounded-2xl border border-border bg-card/60 p-3 md:grid-cols-[minmax(0,1fr)_190px_190px]">
        <label className="relative">
          <span className="sr-only">Achievement qidirish</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Kod yoki nom bo‘yicha qidirish…" className={`${inputClass} mt-0 pl-9`} />
        </label>
        <label>
          <span className="sr-only">Achievement turi</span>
          <select
            value={typeFilter}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'all' || isAchievementType(value)) {
                setTypeFilter(value);
                setPage(1);
              }
            }}
            className={`${inputClass} mt-0`}
          >
            <option value="all">Barcha turlar</option>
            {achievementTypes.map((value) => <option key={value} value={value}>{typeLabels[value]}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Status filtri</span>
          <select
            value={activeFilter}
            onChange={(event) => {
              const value = event.target.value;
              if (isActiveFilter(value)) {
                setActiveFilter(value);
                setPage(1);
              }
            }}
            className={`${inputClass} mt-0`}
          >
            <option value="all">Barcha statuslar</option>
            <option value="active">Faqat faol</option>
            <option value="inactive">Faqat nofaol</option>
          </select>
        </label>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="space-y-4">
          {query.isError ? (
            <div className="rounded-3xl border border-border bg-card/70"><ErrorState onRetry={() => query.refetch()} retrying={query.isFetching} /></div>
          ) : query.isLoading ? (
            Array.from({ length: 5 }).map((_, index) => <CardSkeleton key={index} />)
          ) : achievements.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card/70"><EmptyState icon={Award} isFiltered={Boolean(search || typeFilter !== 'all' || activeFilter !== 'all')} action={!search && typeFilter === 'all' && activeFilter === 'all' ? <button onClick={() => setCreateOpen(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Birinchi achievementni yarating</button> : undefined} /></div>
          ) : (
            achievements.map((achievement) => {
              const TypeIcon = typeIcons[achievement.type];
              return (
                <article key={achievement.id} className={`rounded-3xl border bg-card/70 p-4 shadow-lg transition sm:p-5 ${selectedId === achievement.id ? 'border-primary/50 bg-primary/[0.04]' : 'border-border hover:border-primary/30'}`}>
                  <div className="flex items-start gap-4">
                    <button type="button" onClick={() => setSelectedId(achievement.id)} className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-2xl border border-border bg-background/60 text-primary">
                      <AchievementIcon achievement={achievement} className={achievement.iconUrl ? 'h-full w-full object-cover' : 'h-6 w-6'} />
                    </button>
                    <button type="button" onClick={() => setSelectedId(achievement.id)} className="min-w-0 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">{achievement.code}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${achievement.isActive ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-border text-muted-foreground'}`}>{achievement.isActive ? 'Faol' : 'Nofaol'}</span>
                      </div>
                      <h2 className="mt-1 truncate font-heading text-base font-black text-foreground">{achievement.name}</h2>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{achievement.description || 'Tavsif kiritilmagan'}</p>
                    </button>
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-center">
                      <p className="text-lg font-black text-amber-400">{achievement.points}</p><p className="text-[8px] font-bold uppercase tracking-widest text-amber-300/70">ball</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center">
                    <span className="mr-auto inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><TypeIcon className="h-3.5 w-3.5 text-primary" /> {typeLabels[achievement.type]}</span>
                    <button onClick={() => setSelectedId(achievement.id)} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-xs font-bold text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /> Detail</button>
                    <button onClick={() => setEditing(achievement)} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-xs font-bold text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /> Edit</button>
                    <button onClick={() => toggleFromList(achievement)} disabled={toggleAchievement.isPending} aria-label={achievement.isActive ? 'Achievementni nofaol qilish' : 'Achievementni faollashtirish'} className="flex min-h-10 items-center justify-center rounded-xl border border-border px-3 text-muted-foreground hover:text-primary disabled:opacity-50"><Power className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })
          )}
          {meta && <TablePagination total={meta.total} page={meta.page} limit={meta.limit} totalPages={meta.totalPages} onPageChange={setPage} isLoading={query.isFetching} showingCount={achievements.length} />}
        </section>

        {selectedId !== undefined ? (
          <AchievementDetail id={selectedId} onEdit={setEditing} onAward={setAwarding} />
        ) : (
          <aside className="rounded-3xl border border-border bg-card/70 xl:sticky xl:top-20 xl:self-start"><EmptyState icon={Eye} title="Achievementni tanlang" description="Detail, criteria, tahrirlash va racerga berish actionlari shu yerda ochiladi." /></aside>
        )}
      </div>

      {createOpen && <AchievementFormModal onClose={() => setCreateOpen(false)} />}
      {editing && <AchievementFormModal key={editing.id} achievement={editing} onClose={() => setEditing(undefined)} />}
      {awarding && <AwardModal key={awarding.id} achievement={awarding} onClose={() => setAwarding(undefined)} />}
    </div>
  );
}
