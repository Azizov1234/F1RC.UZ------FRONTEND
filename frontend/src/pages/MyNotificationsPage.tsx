import { useState } from 'react';
import { Bell, Check, Inbox, Search } from 'lucide-react';
import { useMarkNotificationAsRead, useMyNotifications } from '@/hooks/api/useNotifications';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/use-toast';
import type { NotificationStatus } from '@/types';

const notificationStatuses: NotificationStatus[] = ['UNREAD', 'READ', 'ARCHIVED'];

function dateTime(value?: string) {
  return value
    ? new Intl.DateTimeFormat('uz-UZ', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—';
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo‘lmadi.';
}

export default function MyNotificationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<NotificationStatus>();
  const [selectedId, setSelectedId] = useState<number>();
  const notificationsQuery = useMyNotifications({
    search: search.trim() || undefined,
    status,
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const markRead = useMarkNotificationAsRead();
  const notifications = notificationsQuery.data?.data ?? [];
  const selected = notifications.find(notification => notification.id === selectedId);

  const handleStatusChange = (value: string) => {
    setStatus(notificationStatuses.find(candidate => candidate === value));
    setSelectedId(undefined);
  };

  const handleMarkAsRead = () => {
    if (!selected || selected.status !== 'UNREAD') return;

    markRead.mutate(selected.id, {
      onSuccess: () => {
        setSelectedId(undefined);
        toast({ title: 'Bildirishnoma o‘qilgan deb belgilandi' });
      },
      onError: error =>
        toast({
          title: 'Xatolik',
          description: messageOf(error),
          variant: 'destructive',
        }),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bildirishnomalar"
        subtitle="Sizga yuborilgan xabarlar va yangilanishlar"
        icon={Bell}
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setSelectedId(undefined);
            }}
            placeholder="Bildirishnomalarni qidirish"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
        <select
          value={status ?? 'ALL'}
          onChange={event => handleStatusChange(event.target.value)}
          aria-label="Bildirishnoma holati"
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
        >
          <option value="ALL">Barcha holatlar</option>
          {notificationStatuses.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </section>

      {notificationsQuery.isError ? (
        <ErrorState onRetry={() => notificationsQuery.refetch()} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
          <section className="overflow-hidden rounded-2xl border border-border bg-card/70">
            {notificationsQuery.isLoading ? (
              <div className="space-y-3 p-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Bildirishnomalar yo‘q"
                description="Tanlangan filtr bo‘yicha xabar topilmadi."
              />
            ) : (
              <div className="divide-y divide-border/70">
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => setSelectedId(notification.id)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/30 ${
                      selectedId === notification.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.status === 'UNREAD'
                          ? 'bg-primary shadow-[0_0_10px_rgba(255,0,0,.8)]'
                          : 'bg-muted-foreground/40'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-heading text-sm font-bold text-foreground">
                          {notification.title}
                        </p>
                        <StatusBadge status={notification.status} />
                        <span className="rounded-full border border-border px-2 py-0.5 text-[9px] text-muted-foreground">
                          {notification.type}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {dateTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-border bg-card/70 p-5 xl:sticky xl:top-20 xl:self-start">
            {!selectedId ? (
              <EmptyState icon={Inbox} title="Xabarni tanlang" size="sm" />
            ) : !selected ? (
              <ErrorState type="notfound" size="sm" />
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary">
                    Shaxsiy bildirishnoma
                  </p>
                  <h2 className="mt-1 font-heading text-lg font-bold text-foreground">
                    {selected.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={selected.status} />
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      {selected.type}
                    </span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {selected.message}
                </p>
                {selected.data && (
                  <pre className="max-h-44 overflow-auto rounded-xl bg-background p-3 text-xs text-foreground">
                    {JSON.stringify(selected.data, null, 2)}
                  </pre>
                )}
                <p className="text-xs text-muted-foreground">{dateTime(selected.createdAt)}</p>
                {selected.status === 'UNREAD' && (
                  <Button size="sm" onClick={handleMarkAsRead} disabled={markRead.isPending}>
                    <Check /> O‘qilgan deb belgilash
                  </Button>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
