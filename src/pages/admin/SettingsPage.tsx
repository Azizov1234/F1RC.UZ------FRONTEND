import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Braces, Eye, EyeOff, Plus, Search, Settings, SlidersHorizontal, Trash2, Pencil, Power } from 'lucide-react';
import { settingsApi } from '@/api/settings.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import type { Setting, SettingValue } from '@/types';

type View = 'admin' | 'public';
type ValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary';

function valueText(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value, null, 2); } catch { return ''; }
}

function parseValue(value: string, type: ValueType): SettingValue {
  if (type === 'NUMBER') return Number(value);
  if (type === 'BOOLEAN') return value === 'true';
  if (type === 'JSON') {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, unknown>;
    throw new Error('JSON qiymat object yoki array bo‘lishi kerak.');
  }
  return value;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo‘lmadi.';
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('admin');
  const [search, setSearch] = useState('');
  const [valueType, setValueType] = useState<'ALL' | ValueType>('ALL');
  const [selectedId, setSelectedId] = useState<number>();
  const [editing, setEditing] = useState<Setting>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleting, setDeleting] = useState<Setting>();

  const adminQuery = useQuery({
    queryKey: queryKeys.settings.admin({ search, valueType }),
    queryFn: () => settingsApi.getAdminSettings({ search: search || undefined, valueType: valueType === 'ALL' ? undefined : valueType, limit: 100, sortBy: 'key', sortOrder: 'asc' }),
    enabled: view === 'admin',
  });
  const publicQuery = useQuery({
    queryKey: queryKeys.settings.public(),
    queryFn: () => settingsApi.getPublicSettings(),
    enabled: view === 'public',
  });
  const detailQuery = useQuery({
    queryKey: queryKeys.settings.detail(selectedId ?? ''),
    queryFn: async () => (await settingsApi.getSettingById(selectedId ?? 0)).data,
    enabled: view === 'admin' && selectedId !== undefined,
  });
  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => settingsApi.toggleSetting(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() }),
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => settingsApi.deleteSetting(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() }); setDeleting(undefined); toast({ title: 'Sozlama o‘chirildi' }); },
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });
  const activeQuery = view === 'admin' ? adminQuery : publicQuery;
  const settings = activeQuery.data?.data ?? [];

  return <div className="space-y-5">
    <PageHeader title="Sozlamalar" subtitle="Platforma konfiguratsiyasi va public qiymatlar" icon={Settings} actions={view === 'admin' ? <Button onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus /> Yangi sozlama</Button> : undefined} />

    <div className="flex gap-2 rounded-2xl border border-border bg-card/70 p-2"><button type="button" onClick={() => setView('admin')} className={`h-11 flex-1 rounded-xl text-sm font-heading font-semibold ${view === 'admin' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'}`}>Admin settings</button><button type="button" onClick={() => setView('public')} className={`h-11 flex-1 rounded-xl text-sm font-heading font-semibold ${view === 'public' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'}`}>Public preview</button></div>

    {view === 'admin' && <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Kalit bo‘yicha qidirish" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary" /></div><select value={valueType} onChange={event => setValueType(event.target.value as 'ALL' | ValueType)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground"><option value="ALL">Barcha turlar</option>{(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'] as ValueType[]).map(type => <option key={type}>{type}</option>)}</select></section>}

    {activeQuery.isError ? <ErrorState onRetry={() => activeQuery.refetch()} /> : activeQuery.isLoading ? <div className="space-y-3"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div> : settings.length === 0 ? <EmptyState icon={SlidersHorizontal} title="Sozlamalar yo‘q" /> : <div className="grid gap-4 lg:grid-cols-2">{settings.map(setting => <article key={setting.id} className={`rounded-2xl border bg-card/70 p-4 ${selectedId === setting.id ? 'border-primary' : 'border-border'}`}><button type="button" onClick={() => view === 'admin' && setSelectedId(setting.id)} className="w-full text-left"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-mono text-sm font-bold text-foreground">{setting.key}</p><p className="mt-1 text-xs text-muted-foreground">{setting.description || 'Tavsif yo‘q'}</p></div><span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{setting.valueType}</span></div><pre className="mt-4 max-h-24 overflow-auto whitespace-pre-wrap rounded-xl bg-background p-3 text-xs text-foreground">{valueText(setting.value)}</pre><div className="mt-3 flex gap-2 text-[10px] uppercase tracking-wider"><span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${setting.isPublic ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' : 'border-border text-muted-foreground'}`}>{setting.isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{setting.isPublic ? 'PUBLIC' : 'PRIVATE'}</span><span className={`rounded-full border px-2 py-1 ${setting.isActive !== false ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-border text-muted-foreground'}`}>{setting.isActive !== false ? 'ACTIVE' : 'INACTIVE'}</span></div></button>{view === 'admin' && <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3"><Button size="sm" variant="outline" onClick={() => { setEditing(setting); setEditorOpen(true); }}><Pencil /> Tahrirlash</Button><Button size="sm" variant="ghost" onClick={() => toggle.mutate({ id: setting.id, isActive: setting.isActive === false })}><Power /> {setting.isActive === false ? 'Faollashtirish' : 'Nofaol'}</Button><Button size="sm" variant="destructive" onClick={() => setDeleting(setting)}><Trash2 /> O‘chirish</Button></div>}</article>)}</div>}

    {selectedId && view === 'admin' && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex justify-between"><div><p className="text-[10px] uppercase tracking-widest text-primary">Setting detail endpoint</p><p className="mt-1 font-mono text-sm font-bold text-foreground">{detailQuery.isLoading ? 'Yuklanmoqda…' : detailQuery.data?.key}</p></div><button type="button" onClick={() => setSelectedId(undefined)} className="text-xs text-muted-foreground">Yopish</button></div></div>}
    {editorOpen && <SettingEditor record={editing} onClose={() => setEditorOpen(false)} />}
    <ConfirmDialog isOpen={Boolean(deleting)} onClose={() => setDeleting(undefined)} onConfirm={() => deleting && remove.mutate(deleting.id)} loading={remove.isPending} title="Sozlamani o‘chirish" message={`${deleting?.key ?? ''} sozlamasi backenddan o‘chiriladi.`} />
  </div>;
}

function SettingEditor({ record, onClose }: { record?: Setting; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [key, setKey] = useState(record?.key ?? '');
  const [valueType, setValueType] = useState<ValueType>((record?.valueType as ValueType) ?? 'STRING');
  const [value, setValue] = useState(valueText(record?.value));
  const [description, setDescription] = useState(record?.description ?? '');
  const [isPublic, setIsPublic] = useState(record?.isPublic ?? false);
  const [isActive, setIsActive] = useState(record?.isActive ?? true);
  const mutation = useMutation({
    mutationFn: async () => {
      const data = { key: key.trim(), value: parseValue(value, valueType), valueType, description: description.trim() || undefined, isPublic, isActive };
      return record ? settingsApi.updateSetting(record.id, data) : settingsApi.createSetting(data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() }); onClose(); toast({ title: 'Sozlama saqlandi' }); },
    onError: error => toast({ title: 'Qiymat xatosi', description: messageOf(error), variant: 'destructive' }),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); mutation.mutate(); };
  return <Modal isOpen onClose={onClose} title={record ? 'Sozlamani tahrirlash' : 'Yangi sozlama'} size="lg"><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="text-xs text-muted-foreground">Kalit<input required value={key} onChange={event => setKey(event.target.value)} className={inputClass} /></label><label className="text-xs text-muted-foreground">Qiymat turi<select value={valueType} onChange={event => setValueType(event.target.value as ValueType)} className={inputClass}>{(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'] as ValueType[]).map(type => <option key={type}>{type}</option>)}</select></label><label className="sm:col-span-2 text-xs text-muted-foreground">Qiymat{valueType === 'BOOLEAN' ? <select value={value} onChange={event => setValue(event.target.value)} className={inputClass}><option value="true">true</option><option value="false">false</option></select> : <textarea required rows={valueType === 'JSON' ? 6 : 3} value={value} onChange={event => setValue(event.target.value)} className={`${inputClass} h-auto py-3 font-mono`} />}</label><label className="sm:col-span-2 text-xs text-muted-foreground">Tavsif<textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} className={`${inputClass} h-auto py-3`} /></label><label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isPublic} onChange={event => setIsPublic(event.target.checked)} /> Public</label><label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isActive} onChange={event => setIsActive(event.target.checked)} /> Active</label><div className="sm:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={mutation.isPending}><Braces /> Saqlash</Button></div></form></Modal>;
}
