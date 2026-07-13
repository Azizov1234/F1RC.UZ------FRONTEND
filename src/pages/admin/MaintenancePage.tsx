import { useMemo, useState, type FormEvent } from 'react';
import { Wrench, Plus, Search, Car, CalendarClock, ArrowRight, Pencil } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import StatusBadge from '@/components/admin/StatusBadge';
import { toast } from '@/components/ui/use-toast';
import {
  useCreateMaintenance,
  useUpdateMaintenance,
  useVehicleMaintenance,
  useVehicleMaintenances,
} from '@/hooks/api/useVehicleMaintenances';
import { useVehicles } from '@/hooks/api/useVehicles';
import type { VehicleMaintenance, VehicleMaintenanceStatus } from '@/types';

const statuses: Array<'ALL' | VehicleMaintenanceStatus> = [
  'ALL',
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CANCELLED',
];

type MaintenanceForm = {
  vehicleId: string;
  title: string;
  reason: string;
  notes: string;
};

const emptyForm: MaintenanceForm = { vehicleId: '', title: '', reason: '', notes: '' };

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Amalni bajarib bo\'lmadi.';
}

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | VehicleMaintenanceStatus>('ALL');
  const [selectedId, setSelectedId] = useState<number>();
  const [editing, setEditing] = useState<VehicleMaintenance>();
  const [form, setForm] = useState<MaintenanceForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);

  const params = useMemo(
    () => ({
      limit: 100,
      search: search || undefined,
      status: status === 'ALL' ? undefined : status,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    }),
    [search, status],
  );
  const maintenanceQuery = useVehicleMaintenances(params);
  const detailQuery = useVehicleMaintenance(selectedId);
  const vehiclesQuery = useVehicles({ limit: 100 });
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();

  const records = maintenanceQuery.data?.data ?? [];
  const vehicles = vehiclesQuery.data ?? [];
  const selected = detailQuery.data;

  const openCreate = () => {
    setEditing(undefined);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (record: VehicleMaintenance) => {
    setEditing(record);
    setForm({
      vehicleId: String(record.vehicleId),
      title: record.title,
      reason: record.reason ?? '',
      notes: record.notes ?? '',
    });
    setModalOpen(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing && !form.vehicleId) return;

    const data = {
      title: form.title.trim(),
      reason: form.reason.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => {
            setModalOpen(false);
            toast({ title: 'Texnik xizmat yangilandi' });
          },
          onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
        },
      );
      return;
    }

    createMutation.mutate(
      { vehicleId: Number(form.vehicleId), ...data },
      {
        onSuccess: () => {
          setModalOpen(false);
          toast({ title: 'Texnik xizmat ochildi' });
        },
        onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
      },
    );
  };

  const setRecordStatus = (record: VehicleMaintenance, nextStatus: VehicleMaintenanceStatus) => {
    updateMutation.mutate(
      { id: record.id, data: { status: nextStatus } },
      {
        onSuccess: () => toast({ title: 'Holat yangilandi', description: nextStatus }),
        onError: error => toast({ title: 'Xatolik', description: messageOf(error), variant: 'destructive' }),
      },
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Texnik xizmat"
        subtitle="Mashinalar nosozligi va servis tarixini boshqaring"
        icon={Wrench}
        actions={<Button onClick={openCreate}><Plus /> Yangi xizmat</Button>}
      />

      <section className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Sarlavha yoki mashina bo‘yicha qidirish"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statuses.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`h-10 whitespace-nowrap rounded-xl border px-3 text-[11px] font-heading font-semibold transition ${
                  status === item
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {item === 'ALL' ? 'Barchasi' : item.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {maintenanceQuery.isError ? (
        <ErrorState onRetry={() => maintenanceQuery.refetch()} retrying={maintenanceQuery.isRefetching} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          <section className="overflow-hidden rounded-2xl border border-border bg-card/70">
            {maintenanceQuery.isLoading ? (
              <div className="space-y-3 p-4">{Array.from({ length: 5 }, (_, index) => <ListItemSkeleton key={index} />)}</div>
            ) : records.length === 0 ? (
              <EmptyState icon={Wrench} title="Xizmat yozuvlari yo‘q" action={<Button onClick={openCreate}>Birinchi yozuvni ochish</Button>} />
            ) : (
              <div className="divide-y divide-border/70">
                {records.map(record => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => setSelectedId(record.id)}
                    className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/30 ${selectedId === record.id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-heading text-sm font-semibold text-foreground">{record.title}</p>
                        <StatusBadge status={record.status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {record.vehicle?.name ?? `Mashina #${record.vehicleId}`} · {formatDate(record.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-border bg-card/70 p-5 xl:sticky xl:top-20 xl:self-start">
            {!selectedId ? (
              <EmptyState icon={CalendarClock} title="Yozuvni tanlang" description="Tafsilot va status amallari shu yerda ko‘rinadi." size="sm" />
            ) : detailQuery.isLoading ? (
              <ListItemSkeleton />
            ) : detailQuery.isError || !selected ? (
              <ErrorState size="sm" onRetry={() => detailQuery.refetch()} />
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-heading uppercase tracking-[0.2em] text-primary">Xizmat #{selected.id}</p>
                    <h2 className="mt-1 font-heading text-lg font-bold text-foreground">{selected.title}</h2>
                  </div>
                  <button type="button" onClick={() => openEdit(selected)} className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Tahrirlash">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-background p-3"><p className="text-muted-foreground">Mashina</p><p className="mt-1 font-semibold text-foreground">{selected.vehicle?.name ?? `#${selected.vehicleId}`}</p></div>
                  <div className="rounded-xl bg-background p-3"><p className="text-muted-foreground">Holat</p><div className="mt-1"><StatusBadge status={selected.status} /></div></div>
                  <div className="col-span-2 rounded-xl bg-background p-3"><p className="text-muted-foreground">Sabab</p><p className="mt-1 whitespace-pre-wrap text-foreground">{selected.reason || 'Kiritilmagan'}</p></div>
                  <div className="col-span-2 rounded-xl bg-background p-3"><p className="text-muted-foreground">Izohlar</p><p className="mt-1 whitespace-pre-wrap text-foreground">{selected.notes || 'Kiritilmagan'}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selected.status === 'OPEN' && <Button size="sm" onClick={() => setRecordStatus(selected, 'IN_PROGRESS')}>Ishni boshlash</Button>}
                  {selected.status !== 'RESOLVED' && selected.status !== 'CANCELLED' && <Button size="sm" variant="outline" onClick={() => setRecordStatus(selected, 'RESOLVED')}>Yakunlash</Button>}
                  {selected.status !== 'CANCELLED' && selected.status !== 'RESOLVED' && <Button size="sm" variant="destructive" onClick={() => setRecordStatus(selected, 'CANCELLED')}>Bekor qilish</Button>}
                  {(selected.status === 'RESOLVED' || selected.status === 'CANCELLED') && <Button size="sm" variant="outline" onClick={() => setRecordStatus(selected, 'OPEN')}>Qayta ochish</Button>}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Xizmatni tahrirlash' : 'Yangi texnik xizmat'} description="Backend DTO maydonlari bo‘yicha yozuv yarating">
        <form onSubmit={submit} className="space-y-4">
          {!editing && (
            <label className="block text-xs font-heading text-muted-foreground">Mashina
              <select required value={form.vehicleId} onChange={event => setForm(current => ({ ...current, vehicleId: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
                <option value="">Tanlang</option>
                {vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
              </select>
            </label>
          )}
          <label className="block text-xs font-heading text-muted-foreground">Sarlavha
            <input required value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" />
          </label>
          <label className="block text-xs font-heading text-muted-foreground">Sabab
            <textarea value={form.reason} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary" />
          </label>
          <label className="block text-xs font-heading text-muted-foreground">Izohlar
            <textarea value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary" />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? 'Saqlash' : 'Yaratish'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
