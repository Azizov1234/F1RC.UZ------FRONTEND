import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PublicTeamsPage() {
  return (
    <div className='mx-auto max-w-7xl space-y-8 px-4 py-8'>
      <h1 className='flex items-center gap-2 font-display text-3xl font-black text-foreground'>
        <Users className='h-8 w-8 text-primary' /> Jamoalar
      </h1>
      <section className='rounded-3xl border border-border bg-card/70 shadow-xl'>
        <EmptyState
          icon={Users}
          size='lg'
          title='Ochiq jamoalar katalogi hozircha mavjud emas'
          description='Backend jamoa ma’lumotlarini faqat TEAM_MANAGER akkauntlariga beradi. Guest rejimida himoyalangan /teams endpointiga so‘rov yuborilmaydi.'
          action={<Link to='/login' className='inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white'>Tizimga kirish</Link>}
        />
      </section>
    </div>
  );
}
