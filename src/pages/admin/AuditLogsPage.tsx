import { useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe2,
  Monitor,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { useAuditLog, useAuditLogs } from '@/hooks/api/useAuditLogs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import type { AuditAction, AuditLog } from '@/types';

const AUDIT_ACTIONS: AuditAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'APPROVE',
  'REJECT',
  'CANCEL',
  'CHECK_IN',
  'START',
  'FINISH',
  'SYSTEM',
];

const actionStyles: Record<AuditAction, string> = {
  CREATE: 'bg-blue-500/10 text-blue-400',
  UPDATE: 'bg-amber-500/10 text-amber-400',
  DELETE: 'bg-red-500/10 text-red-400',
  LOGIN: 'bg-emerald-500/10 text-emerald-400',
  LOGOUT: 'bg-slate-500/10 text-slate-400',
  APPROVE: 'bg-green-500/10 text-green-400',
  REJECT: 'bg-rose-500/10 text-rose-400',
  CANCEL: 'bg-orange-500/10 text-orange-400',
  CHECK_IN: 'bg-cyan-500/10 text-cyan-400',
  START: 'bg-violet-500/10 text-violet-400',
  FINISH: 'bg-purple-500/10 text-purple-400',
  SYSTEM: 'bg-gray-500/10 text-gray-400',
};

function isAuditAction(value: string): value is AuditAction {
  return AUDIT_ACTIONS.some((action) => action === value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

function maskSensitive(value: unknown, key = ''): unknown {
  if (/password|token|secret|authorization|cookie/i.test(key)) return '••••••••';
  if (Array.isArray(value)) return value.map((item) => maskSensitive(item));
  if (typeof value !== 'object' || value === null) return value;

  const masked: Record<string, unknown> = {};
  Object.entries(value).forEach(([entryKey, entryValue]) => {
    masked[entryKey] = maskSensitive(entryValue, entryKey);
  });
  return masked;
}

function metadataText(log: AuditLog): string {
  if (!log.metadata || Object.keys(log.metadata).length === 0) return 'Metadata mavjud emas';
  return JSON.stringify(maskSensitive(log.metadata), null, 2);
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<AuditAction | ''>('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedId, setSelectedId] = useState<number>();

  const logsQuery = useAuditLogs({
    page,
    limit: 20,
    search: search.trim() || undefined,
    action: action || undefined,
    entityType: entityType.trim() || undefined,
    entityId: entityId.trim() || undefined,
    from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const detailQuery = useAuditLog(selectedId);
  const logs = logsQuery.data?.data ?? [];
  const meta = logsQuery.data?.meta;
  const detail = detailQuery.data;

  const resetFilters = () => {
    setSearch('');
    setAction('');
    setEntityType('');
    setEntityId('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-wide text-foreground">
          <Activity className="h-6 w-6 text-primary" /> Audit log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Backend qayd etgan tizim harakatlari va ularning tafsilotlari
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-primary" /> Filterlar
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Aktyor, amal yoki obyekt bo‘yicha qidirish"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <select
            value={action}
            onChange={(event) => {
              setAction(isAuditAction(event.target.value) ? event.target.value : '');
              setPage(1);
            }}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Barcha amallar</option>
            {AUDIT_ACTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value);
              setPage(1);
            }}
            placeholder="Obyekt turi"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            value={entityId}
            onChange={(event) => {
              setEntityId(event.target.value);
              setPage(1);
            }}
            placeholder="Obyekt ID"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <label className="space-y-1 text-xs text-muted-foreground">
            Boshlanish sanasi
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            Tugash sanasi
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={resetFilters}
            className="self-end rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Tozalash
          </button>
        </div>
      </section>

      {logsQuery.isLoading ? (
        <div className="grid gap-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : logsQuery.isError ? (
        <ErrorState onRetry={() => { void logsQuery.refetch(); }} retrying={logsQuery.isFetching} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Audit yozuvlari topilmadi"
          description="Tanlangan filterlar bo‘yicha backend hech qanday yozuv qaytarmadi."
          isFiltered={Boolean(search || action || entityType || entityId || from || to)}
        />
      ) : (
        <section className="space-y-2">
          {logs.map((log) => (
            <button
              key={log.id}
              type="button"
              onClick={() => setSelectedId(log.id)}
              className="block w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-1 text-[10px] font-bold tracking-wider ${actionStyles[log.action]}`}>
                  {log.action}
                </span>
                <span className="text-xs text-muted-foreground">
                  {log.entityType || 'Tizim'}{log.entityId !== null && log.entityId !== undefined ? ` #${log.entityId}` : ''}
                </span>
                <time className="ml-auto text-xs text-muted-foreground">{formatDate(log.createdAt)}</time>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" /> {log.actor?.fullName || (log.actorId ? `User #${log.actorId}` : 'System')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5" /> {log.ipAddress || 'IP berilmagan'}
                </span>
              </div>
            </button>
          ))}
        </section>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Jami {meta.total} yozuv · {meta.page}/{meta.totalPages} sahifa</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-border p-2 text-foreground disabled:opacity-40"
              aria-label="Oldingi sahifa"
            ><ChevronLeft className="h-4 w-4" /></button>
            <button
              type="button"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-border p-2 text-foreground disabled:opacity-40"
              aria-label="Keyingi sahifa"
            ><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {selectedId !== undefined && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onMouseDown={() => setSelectedId(undefined)}>
          <aside
            className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-background p-5 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary">Audit tafsiloti</p>
                <h2 className="font-heading text-xl font-bold text-foreground">Log #{selectedId}</h2>
              </div>
              <button type="button" onClick={() => setSelectedId(undefined)} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Yopish">
                <X className="h-4 w-4" />
              </button>
            </div>

            {detailQuery.isLoading ? (
              <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
            ) : detailQuery.isError || !detail ? (
              <ErrorState onRetry={() => { void detailQuery.refetch(); }} retrying={detailQuery.isFetching} />
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span className={`rounded px-2 py-1 text-xs font-bold ${actionStyles[detail.action]}`}>{detail.action}</span>
                    <time className="text-xs text-muted-foreground">{formatDate(detail.createdAt)}</time>
                  </div>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-xs text-muted-foreground">Aktyor</dt><dd className="mt-1 text-foreground">{detail.actor?.fullName || (detail.actorId ? `User #${detail.actorId}` : 'System')}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Rol</dt><dd className="mt-1 text-foreground">{detail.actor?.role || '—'}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Obyekt</dt><dd className="mt-1 text-foreground">{detail.entityType || '—'}{detail.entityId !== null && detail.entityId !== undefined ? ` #${detail.entityId}` : ''}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">IP manzil</dt><dd className="mt-1 font-mono text-foreground">{detail.ipAddress || '—'}</dd></div>
                  </dl>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><Monitor className="h-4 w-4 text-primary" /> User agent</h3>
                  <p className="break-words font-mono text-xs leading-5 text-muted-foreground">{detail.userAgent || 'Berilmagan'}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Metadata</h3>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-black/20 p-3 font-mono text-xs leading-5 text-muted-foreground">{metadataText(detail)}</pre>
                  <p className="mt-2 text-[10px] text-muted-foreground">Maxfiy kalitlar interfeysda avtomatik niqoblanadi.</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
