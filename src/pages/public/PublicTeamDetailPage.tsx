import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PublicTeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const label = id ? ` #${id}` : '';
  return (
    <div className='mx-auto max-w-4xl space-y-8 px-4 py-8'>
      <Link to='/teams' className='inline-flex min-h-11 items-center gap-2 text-sm text-primary'>
        <ArrowLeft className='h-4 w-4' /> Jamoalarga qaytish
      </Link>
      <section className='rounded-3xl border border-border bg-card/70 shadow-xl'>
        <EmptyState
          icon={Users}
          size='lg'
          title='Jamoa tafsiloti guest rejimida ochiq emas'
          description={`Jamoa${label} ma’lumoti faqat TEAM_MANAGER uchun himoyalangan. Public endpoint yo‘q, shu sabab /teams so‘rovi yuborilmaydi.`}
          action={<Link to='/login' className='inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white'>Tizimga kirish</Link>}
        />
      </section>
    </div>
  );
}
