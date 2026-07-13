import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Flag, IdCard, Pencil, Shield, Star, User } from 'lucide-react';
import { useMyProfile, useProfileByUserId, useUpdateMyProfile } from '@/hooks/api/useProfiles';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import { getFileUrl } from '@/lib/getFileUrl';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import type { ExperienceLevel, Profile } from '@/types';

const levels: ExperienceLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO', 'ELITE'];
const inputClass = 'mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary';

function usePreview(file?: File) {
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
  return error instanceof Error ? error.message : 'Profilni saqlab bo‘lmadi.';
}

export default function RacerProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const myProfile = useMyProfile();
  const otherProfile = useProfileByUserId(userId);
  const [editorOpen, setEditorOpen] = useState(false);
  const query = userId ? otherProfile : myProfile;
  const profile = query.data;
  const canEdit = !userId;

  if (query.isLoading) return <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>;
  if (query.isError || !profile) return <ErrorState type="notfound" title="Profil topilmadi" onRetry={() => query.refetch()} />;

  return <div className="space-y-5">
    <PageHeader title={profile.nickname || profile.user?.fullName || user?.full_name || 'Racer'} subtitle={userId ? 'Foydalanuvchi profilining read-only ko‘rinishi' : 'Racer profilingiz va avatar sozlamalari'} icon={User} badge={{ label: profile.experienceLevel || 'BEGINNER', color: 'blue' }} actions={canEdit ? <Button onClick={() => setEditorOpen(true)}><Pencil /> Profilni tahrirlash</Button> : undefined} />
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6 text-center"><div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/15 to-transparent" /><div className="relative mx-auto h-28 w-28 overflow-hidden rounded-3xl border-2 border-primary/30 bg-primary/10 shadow-xl shadow-primary/10">{profile.avatarUrl ? <img src={getFileUrl(profile.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-display text-4xl font-bold text-primary">{(profile.nickname || profile.user?.fullName || 'R')[0]}</div>}</div><h2 className="relative mt-4 font-heading text-xl font-bold text-foreground">{profile.nickname || profile.user?.fullName || 'Racer'}</h2><p className="relative mt-1 text-xs text-muted-foreground">{profile.user?.email || user?.email}</p><div className="relative mt-5 flex justify-center gap-2"><span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">{profile.experienceLevel || 'BEGINNER'}</span><span className="rounded-full border border-border bg-muted px-3 py-1 text-[10px] text-muted-foreground">USER #{profile.userId}</span></div></section>
      <section className="rounded-2xl border border-border bg-card/70 p-5"><div className="flex items-center gap-2"><Flag className="h-5 w-5 text-primary" /><h2 className="font-heading text-lg font-bold text-foreground">Racer bio</h2></div><p className="mt-4 min-h-24 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{profile.bio || 'Bu racer hali o‘zi haqida ma’lumot kiritmagan.'}</p><div className="mt-5 grid grid-cols-2 gap-3"><ProfileFact icon={IdCard} label="Profile ID" value={`#${profile.id}`} /><ProfileFact icon={Shield} label="Daraja" value={profile.experienceLevel || 'BEGINNER'} /><ProfileFact icon={Star} label="Nickname" value={profile.nickname || '—'} /><ProfileFact icon={User} label="User" value={profile.user?.fullName || `#${profile.userId}`} /></div></section>
    </div>
    {editorOpen && <ProfileEditor profile={profile} onClose={() => setEditorOpen(false)} />}
  </div>;
}

function ProfileFact({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return <div className="rounded-xl bg-background p-3"><Icon className="h-4 w-4 text-primary" /><p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p></div>;
}

function ProfileEditor({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const [nickname, setNickname] = useState(profile.nickname ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel ?? 'BEGINNER');
  const [file, setFile] = useState<File>();
  const preview = usePreview(file);
  const update = useUpdateMyProfile();
  const selectFile = (next?: File) => { if (!next) return false; const validation = validateUploadedFile(next); if (!validation.isValid) { toast({ title: 'Rasm qabul qilinmadi', description: validation.error, variant: 'destructive' }); return false; } setFile(next); return true; };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); update.mutate({ nickname: nickname.trim() || undefined, bio: bio.trim() || undefined, experienceLevel, avatarUrl: file }, { onSuccess: () => { onClose(); toast({ title: 'Profil yangilandi' }); }, onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }) }); };
  return <Modal isOpen onClose={onClose} title="Profilni tahrirlash" size="lg">
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-border bg-muted">
          {preview || profile.avatarUrl ? <img src={preview || getFileUrl(profile.avatarUrl ?? undefined)} alt="Avatar preview" className="h-full w-full object-cover" /> : <User className="m-6 h-8 w-8 text-muted-foreground" />}
        </div>
        <div>
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground hover:border-primary/40">
            <Camera className="h-4 w-4" /> Avatar tanlash
            <input type="file" accept={IMAGE_UPLOAD_ACCEPT} className="sr-only" onChange={event => { if (!selectFile(event.target.files?.[0])) event.currentTarget.value = ''; }} />
          </label>
          <p className="mt-1.5 max-w-xs text-[10px] text-muted-foreground">{IMAGE_UPLOAD_RULES_LABEL}</p>
        </div>
      </div>
      <label className="block text-xs text-muted-foreground">Nickname<input value={nickname} onChange={event => setNickname(event.target.value)} className={inputClass} /></label>
      <label className="block text-xs text-muted-foreground">Tajriba darajasi<select value={experienceLevel} onChange={event => setExperienceLevel(event.target.value as ExperienceLevel)} className={inputClass}>{levels.map(level => <option key={level}>{level}</option>)}</select></label>
      <label className="block text-xs text-muted-foreground">Bio<textarea rows={5} value={bio} onChange={event => setBio(event.target.value)} className={`${inputClass} h-auto py-3`} /></label>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={update.isPending}>Saqlash</Button></div>
    </form>
  </Modal>;
}
