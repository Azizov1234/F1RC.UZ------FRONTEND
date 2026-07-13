import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Pencil, Plus, Power, Search, Shield, Trash2, UserPlus, Users2 } from 'lucide-react';
import { teamsApi } from '@/api/teams.api';
import { queryKeys } from '@/hooks/api/useQueryKeys';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { getFileUrl } from '@/lib/getFileUrl';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import type { Team } from '@/types';

type Scope = 'admin' | 'manager';
const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary';

function useImagePreview(file?: File) {
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return preview;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo‘lmadi.';
}

export default function TeamsPage() {
  const { user } = useAuth();
  const scope: Scope = user?.role === 'team_manager' ? 'manager' : 'admin';
  return <TeamsWorkspace scope={scope} />;
}

function TeamsWorkspace({ scope }: { scope: Scope }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number>();
  const [editing, setEditing] = useState<Team>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [memberModal, setMemberModal] = useState(false);

  const teamsQuery = useQuery({
    queryKey: scope === 'admin' ? queryKeys.teams.adminList({ search }) : queryKeys.teams.myList({ search }),
    queryFn: () => scope === 'admin' ? teamsApi.getAdminTeams({ search: search || undefined, limit: 100, sortBy: 'name', sortOrder: 'asc' }) : teamsApi.getMyTeams({ search: search || undefined, limit: 100, sortBy: 'name', sortOrder: 'asc' }),
  });
  const detailQuery = useQuery({
    queryKey: scope === 'admin' ? queryKeys.teams.adminDetail(selectedId ?? '') : queryKeys.teams.detail(selectedId ?? ''),
    queryFn: async () => scope === 'admin' ? (await teamsApi.getAdminTeamById(selectedId ?? 0)).data : (await teamsApi.getMyTeamById(selectedId ?? 0)).data,
    enabled: selectedId !== undefined,
  });
  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => teamsApi.toggleTeam(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() }),
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });
  const removeMember = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) => teamsApi.removeMember(teamId, userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() }); toast({ title: 'A’zo olib tashlandi' }); },
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });
  const teams = teamsQuery.data?.data ?? [];
  const selected = detailQuery.data;

  return <div className="space-y-5">
    <PageHeader title={scope === 'admin' ? 'Jamoalar' : 'Mening jamoalarim'} subtitle={scope === 'admin' ? 'Admin team boshqaruvi va tarkib ko‘rinishi' : 'Team manager uchun ruxsatli jamoa va a’zolar boshqaruvi'} icon={Users2} actions={scope === 'admin' ? <Button onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus /> Yangi jamoa</Button> : undefined} />
    <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Jamoa qidirish" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary" /></div>

    {teamsQuery.isError ? <ErrorState onRetry={() => teamsQuery.refetch()} /> : <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
      <section>{teamsQuery.isLoading ? <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div> : teams.length === 0 ? <EmptyState icon={Users2} title="Jamoalar yo‘q" /> : <div className="grid gap-4 md:grid-cols-2">{teams.map(team => <button key={team.id} type="button" onClick={() => setSelectedId(team.id)} className={`overflow-hidden rounded-2xl border bg-card/70 text-left transition hover:border-primary/40 ${selectedId === team.id ? 'border-primary' : 'border-border'}`}><div className="flex h-28 items-center justify-center bg-muted/30">{team.logoUrl ? <img src={getFileUrl(team.logoUrl)} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-9 w-9 text-muted-foreground" />}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-heading font-bold text-foreground">{team.name}</h3><span className={`rounded-full border px-2 py-0.5 text-[10px] ${team.isActive ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-border text-muted-foreground'}`}>{team.isActive ? 'FAOL' : 'NOFAOL'}</span></div><p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{team.description || 'Tavsif yo‘q'}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs"><span className="text-muted-foreground">{team.memberCount ?? team.members?.length ?? 0} a’zo</span><span className="font-semibold text-foreground">{team.manager?.fullName ?? `Manager #${team.managerId}`}</span></div></div></button>)}</div>}</section>
      <aside className="rounded-2xl border border-border bg-card/70 p-5 xl:sticky xl:top-20 xl:self-start">{!selectedId ? <EmptyState icon={Shield} title="Jamoani tanlang" description="Detail va a’zolar shu yerda ko‘rinadi." size="sm" /> : detailQuery.isLoading ? <ListItemSkeleton /> : detailQuery.isError || !selected ? <ErrorState size="sm" onRetry={() => detailQuery.refetch()} /> : <div className="space-y-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-primary">Team detail #{selected.id}</p><h2 className="mt-1 font-heading text-lg font-bold text-foreground">{selected.name}</h2><p className="mt-1 text-xs text-muted-foreground">{selected.manager?.fullName ?? `Manager #${selected.managerId}`}</p></div><Button size="sm" variant="ghost" onClick={() => { setEditing(selected); setEditorOpen(true); }}><Pencil /></Button></div><p className="text-sm leading-6 text-muted-foreground">{selected.description || 'Tavsif kiritilmagan.'}</p>{scope === 'admin' && <Button size="sm" variant="outline" onClick={() => toggle.mutate({ id: selected.id, isActive: !selected.isActive })} disabled={toggle.isPending}><Power /> {selected.isActive ? 'Nofaol qilish' : 'Faollashtirish'}</Button>}<div><div className="mb-3 flex items-center justify-between"><h3 className="font-heading font-bold text-foreground">A’zolar</h3>{scope === 'manager' && <Button size="sm" onClick={() => setMemberModal(true)}><UserPlus /> Qo‘shish</Button>}</div>{!selected.members?.length ? <EmptyState icon={Users2} title="A’zolar yo‘q" size="sm" /> : <div className="space-y-2">{selected.members.map(member => <div key={member.id} className="flex items-center gap-3 rounded-xl bg-background p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-heading font-bold text-primary">{member.user?.fullName?.[0] ?? 'R'}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{member.user?.fullName ?? `User #${member.userId}`}</p><p className="truncate text-xs text-muted-foreground">{member.user?.email ?? 'Email yo‘q'}</p></div>{scope === 'manager' && <button type="button" onClick={() => removeMember.mutate({ teamId: selected.id, userId: member.userId })} disabled={removeMember.isPending} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400" aria-label="A’zoni olib tashlash"><Trash2 className="h-4 w-4" /></button>}</div>)}</div>}</div></div>}</aside>
    </div>}

    {editorOpen && <TeamEditor scope={scope} record={editing} onClose={() => setEditorOpen(false)} />}
    {memberModal && selected && <MemberEditor teamId={selected.id} onClose={() => setMemberModal(false)} />}
  </div>;
}

function TeamEditor({ scope, record, onClose }: { scope: Scope; record?: Team; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(record?.name ?? '');
  const [slug, setSlug] = useState(record?.slug ?? '');
  const [description, setDescription] = useState(record?.description ?? '');
  const [managerId, setManagerId] = useState(record ? String(record.managerId) : '');
  const [isActive, setIsActive] = useState(record?.isActive ?? true);
  const [file, setFile] = useState<File>();
  const preview = useImagePreview(file);
  const mutation = useMutation({
    mutationFn: () => {
      const data = new FormData();
      data.append('name', name.trim());
      if (slug.trim()) data.append('slug', slug.trim());
      if (description.trim()) data.append('description', description.trim());
      if (managerId && scope === 'admin') data.append('managerId', managerId);
      data.append('isActive', String(isActive));
      if (file) data.append('logoUrl', file);
      if (!record) return teamsApi.createTeam(data);
      return scope === 'admin' ? teamsApi.updateAdminTeam(record.id, data) : teamsApi.updateMyTeam(record.id, data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() }); onClose(); toast({ title: 'Jamoa saqlandi' }); },
    onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
  });
  const pickFile = (next?: File) => { if (!next) return false; const validation = validateUploadedFile(next); if (!validation.isValid) { toast({ title: 'Rasm qabul qilinmadi', description: validation.error, variant: 'destructive' }); return false; } setFile(next); return true; };
  return <Modal isOpen onClose={onClose} title={record ? 'Jamoani tahrirlash' : 'Yangi jamoa'} size="lg">
    <form onSubmit={(event: FormEvent) => { event.preventDefault(); mutation.mutate(); }} className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs text-muted-foreground">Nomi<input required value={name} onChange={event => setName(event.target.value)} className={inputClass} /></label>
      <label className="text-xs text-muted-foreground">Slug<input value={slug} onChange={event => setSlug(event.target.value)} className={inputClass} /></label>
      {(scope === 'admin' || !record) && <label className="text-xs text-muted-foreground">Manager ID<input required type="number" min="1" value={managerId} onChange={event => setManagerId(event.target.value)} className={inputClass} /></label>}
      <label className="text-xs text-muted-foreground">
        Logo
        <input type="file" accept={IMAGE_UPLOAD_ACCEPT} onChange={event => { if (!pickFile(event.target.files?.[0])) event.currentTarget.value = ''; }} className={`${inputClass} file:text-foreground`} />
        <span className="mt-1 block text-[10px]">{IMAGE_UPLOAD_RULES_LABEL}</span>
      </label>
      {(preview || record?.logoUrl) && <img src={preview || getFileUrl(record?.logoUrl ?? undefined)} alt="Jamoa logosi preview" className="col-span-full h-36 w-full rounded-xl object-cover" />}
      <label className="sm:col-span-2 text-xs text-muted-foreground">Tavsif<textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} className={`${inputClass} h-auto py-3`} /></label>
      {scope === 'admin' && <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isActive} onChange={event => setIsActive(event.target.checked)} /> Faol</label>}
      <div className="sm:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={mutation.isPending}>Saqlash</Button></div>
    </form>
  </Modal>;
}

function MemberEditor({ teamId, onClose }: { teamId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState('');
  const mutation = useMutation({ mutationFn: () => teamsApi.addMember(teamId, Number(userId)), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() }); onClose(); toast({ title: 'A’zo qo‘shildi' }); }, onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }) });
  return <Modal isOpen onClose={onClose} title="Jamoaga a’zo qo‘shish"><form onSubmit={event => { event.preventDefault(); mutation.mutate(); }} className="space-y-4"><label className="text-xs text-muted-foreground">User ID<input required type="number" min="1" value={userId} onChange={event => setUserId(event.target.value)} className={inputClass} /></label><div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={mutation.isPending}>Qo‘shish</Button></div></form></Modal>;
}
