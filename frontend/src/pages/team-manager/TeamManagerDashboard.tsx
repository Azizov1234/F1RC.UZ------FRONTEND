import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ShieldCheck,
  UserRound,
  Users2,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton, ListItemSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { usePublicEvents } from '@/hooks/api/useEvents';
import { useMyTeam, useMyTeams } from '@/hooks/api/useTeams';
import { useAuth } from '@/lib/AuthContext';
import { getFileUrl } from '@/lib/getFileUrl';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function TeamManagerDashboard() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<number>();
  const [startsFrom] = useState(() => new Date().toISOString());
  const teamsQuery = useMyTeams({ limit: 50, sortBy: 'name', sortOrder: 'asc' });
  const teamSummaries = teamsQuery.data?.data ?? [];
  const teamId = selectedTeamId ?? teamSummaries[0]?.id;
  const teamQuery = useMyTeam(teamId);
  const eventsQuery = usePublicEvents({ limit: 6, startsFrom });
  const team = teamQuery.data;
  const events = eventsQuery.data?.data ?? [];
  const activeMembers = team?.members?.filter((member) => member.isActive !== false && !member.removedAt) ?? [];
  const memberCount = team?.memberCount ?? activeMembers.length;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Team Manager</p>
        <h1 className="mt-1 font-heading text-xl font-bold text-foreground">
          Xush kelibsiz, <span className="text-yellow-400">{user?.full_name || 'Manager'}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Jamoa tarkibi va yaqinlashayotgan eventlar backenddan olinadi.</p>
      </header>

      {teamsQuery.isLoading ? (
        <div className="space-y-4"><CardSkeleton /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div></div>
      ) : teamsQuery.isError ? (
        <ErrorState onRetry={() => { void teamsQuery.refetch(); }} retrying={teamsQuery.isFetching} />
      ) : teamSummaries.length === 0 ? (
        <EmptyState icon={Building2} title="Sizga jamoa biriktirilmagan" description="Team Manager akkaunti uchun backend hech qanday jamoa qaytarmadi." />
      ) : (
        <>
          {teamSummaries.length > 1 && (
            <label className="block max-w-sm space-y-1 text-xs text-muted-foreground">
              Jamoani tanlang
              <select
                value={teamId ?? ''}
                onChange={(event) => {
                  const nextId = Number(event.target.value);
                  if (Number.isFinite(nextId) && nextId > 0) setSelectedTeamId(nextId);
                }}
                className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-yellow-500"
              >
                {teamSummaries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          )}

          {teamQuery.isLoading ? (
            <CardSkeleton />
          ) : teamQuery.isError || !team ? (
            <ErrorState title="Jamoa tafsilotlari yuklanmadi" onRetry={() => { void teamQuery.refetch(); }} retrying={teamQuery.isFetching} />
          ) : (
            <>
              <section className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-yellow-500/5 blur-2xl" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-yellow-500/30 bg-yellow-500/10">
                    {team.logoUrl ? <img src={getFileUrl(team.logoUrl)} alt={team.name} className="h-full w-full object-cover" /> : <Building2 className="h-7 w-7 text-yellow-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-xl font-bold text-foreground">{team.name}</h2>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${team.isActive ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>
                        {team.isActive ? 'FAOL' : 'NOFAOL'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Team #{team.id}{team.slug ? ` · ${team.slug}` : ''}</p>
                    {team.description && <p className="mt-2 max-w-2xl text-sm leading-5 text-muted-foreground">{team.description}</p>}
                  </div>
                  <div className="rounded-xl border border-border bg-background/50 px-4 py-3 sm:text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Manager</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{team.manager?.fullName || `User #${team.managerId}`}</p>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4"><Users2 className="mb-2 h-4 w-4 text-yellow-400" /><p className="font-display text-2xl font-bold text-yellow-400">{memberCount}</p><p className="mt-1 text-[11px] text-muted-foreground">Jami a’zolar</p></div>
                <div className="rounded-xl border border-border bg-card p-4"><CheckCircle2 className="mb-2 h-4 w-4 text-emerald-400" /><p className="font-display text-2xl font-bold text-emerald-400">{activeMembers.length}</p><p className="mt-1 text-[11px] text-muted-foreground">Faol a’zolar</p></div>
                <div className="rounded-xl border border-border bg-card p-4"><CalendarDays className="mb-2 h-4 w-4 text-blue-400" /><p className="font-display text-2xl font-bold text-blue-400">{eventsQuery.data?.meta.total ?? events.length}</p><p className="mt-1 text-[11px] text-muted-foreground">Kelgusi eventlar</p></div>
                <div className="rounded-xl border border-border bg-card p-4"><ShieldCheck className="mb-2 h-4 w-4 text-primary" /><p className="font-display text-lg font-bold text-primary">{team.isActive ? 'Faol' : 'Nofaol'}</p><p className="mt-1 text-[11px] text-muted-foreground">Jamoa holati</p></div>
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <section className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Users2 className="h-4 w-4 text-yellow-400" /> Jamoa a’zolari</h2>
                    <Link to="/team-manager/team" className="flex items-center gap-1 text-xs font-semibold text-yellow-400 hover:text-yellow-300">Barchasi <ChevronRight className="h-3 w-3" /></Link>
                  </div>
                  {activeMembers.length === 0 ? (
                    <EmptyState size="sm" icon={UserRound} title="Faol a’zolar yo‘q" />
                  ) : (
                    <div className="divide-y divide-border/50">
                      {activeMembers.slice(0, 6).map((member) => (
                        <div key={member.id} className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                            {member.user?.avatarUrl ? <img src={getFileUrl(member.user.avatarUrl)} alt="" className="h-full w-full object-cover" /> : (member.user?.fullName || 'R')[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{member.user?.fullName || `User #${member.userId}`}</p>
                            <p className="text-xs text-muted-foreground">{member.user?.role || 'Rol ko‘rsatilmagan'} · {formatDate(member.joinedAt)}</p>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">FAOL</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><CalendarDays className="h-4 w-4 text-blue-400" /> Kelgusi eventlar</h2>
                    <Link to="/team-manager/events" className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300">Barchasi <ChevronRight className="h-3 w-3" /></Link>
                  </div>
                  {eventsQuery.isLoading ? (
                    <div><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div>
                  ) : eventsQuery.isError ? (
                    <ErrorState size="sm" title="Eventlar yuklanmadi" onRetry={() => { void eventsQuery.refetch(); }} retrying={eventsQuery.isFetching} />
                  ) : events.length === 0 ? (
                    <EmptyState size="sm" icon={CalendarDays} title="Kelgusi eventlar yo‘q" />
                  ) : (
                    <div className="divide-y divide-border/50">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10"><Clock3 className="h-4 w-4 text-blue-400" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(event.startsAt)} · {event.category?.name || `Category #${event.categoryId}`}</p>
                          </div>
                          <StatusBadge status={event.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
