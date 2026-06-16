type StatusKey =
  | 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  | 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'FINISHED'
  | 'WAITING' | 'RUNNING'
  | 'PAID' | 'UNPAID' | 'FAILED' | 'REFUNDED'
  | 'ACTIVE_USER' | 'INACTIVE_USER';

const statusConfig: Record<StatusKey, { label: string; bg: string; text: string; dot: string; border: string }> = {
  // Booking
  PENDING:      { label: 'Kutilmoqda',    bg: 'bg-yellow-500/5', text: 'text-yellow-400', dot: 'bg-yellow-400', border: 'border-yellow-500/20' },
  CONFIRMED:    { label: 'Tasdiqlandi',   bg: 'bg-green-500/5',  text: 'text-green-400',  dot: 'bg-green-400', border: 'border-green-500/20' },
  CHECKED_IN:   { label: 'Check-In',      bg: 'bg-blue-500/5',   text: 'text-blue-400',   dot: 'bg-blue-400', border: 'border-blue-500/20' },
  COMPLETED:    { label: 'Tugadi',        bg: 'bg-zinc-500/5',   text: 'text-zinc-400',   dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  CANCELLED:    { label: 'Bekor',         bg: 'bg-red-500/5',    text: 'text-red-400',    dot: 'bg-red-400', border: 'border-red-500/20' },
  NO_SHOW:      { label: 'Kelmadi',       bg: 'bg-orange-500/5', text: 'text-orange-400', dot: 'bg-orange-400', border: 'border-orange-500/20' },
  // Event
  DRAFT:        { label: 'Qoralama',      bg: 'bg-zinc-500/5',   text: 'text-zinc-400',   dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  UPCOMING:     { label: 'Rejalashgan',   bg: 'bg-blue-500/5',   text: 'text-blue-400',   dot: 'bg-blue-400', border: 'border-blue-500/20' },
  ACTIVE:       { label: 'Faol',          bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse', border: 'border-green-500/30' },
  FINISHED:     { label: 'Tugagan',       bg: 'bg-zinc-500/5',   text: 'text-zinc-400',   dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  // Race session
  WAITING:      { label: 'Kutmoqda',      bg: 'bg-yellow-500/5', text: 'text-yellow-400', dot: 'bg-yellow-400', border: 'border-yellow-500/20' },
  RUNNING:      { label: 'Poyga',         bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse', border: 'border-green-500/30' },
  // Payment
  PAID:         { label: "To'landi",      bg: 'bg-green-500/5',  text: 'text-green-400',  dot: 'bg-green-400', border: 'border-green-500/20' },
  UNPAID:       { label: "To'lanmagan",   bg: 'bg-red-500/5',    text: 'text-red-400',    dot: 'bg-red-400', border: 'border-red-500/20' },
  FAILED:       { label: 'Xato',          bg: 'bg-red-500/5',    text: 'text-red-400',    dot: 'bg-red-400', border: 'border-red-500/20' },
  REFUNDED:     { label: 'Qaytarildi',    bg: 'bg-purple-500/5', text: 'text-purple-400', dot: 'bg-purple-400', border: 'border-purple-500/20' },
  // User
  ACTIVE_USER:  { label: 'Faol',          bg: 'bg-green-500/5',  text: 'text-green-400',  dot: 'bg-green-400', border: 'border-green-500/20' },
  INACTIVE_USER:{ label: 'Bloklangan',    bg: 'bg-red-500/5',    text: 'text-red-400',    dot: 'bg-red-400', border: 'border-red-500/20' },
};

const fallback = { label: 'Noma\'lum', bg: 'bg-zinc-500/5', text: 'text-zinc-400', dot: 'bg-zinc-400', border: 'border-zinc-500/20' };

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as StatusKey] ?? { ...fallback, label: status };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-heading font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${config.bg} ${config.border} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
      {config.label}
    </span>
  );
}