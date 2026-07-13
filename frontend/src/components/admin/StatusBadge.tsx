type StatusKey =
  | 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  | 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'PAUSED'
  | 'OPEN' | 'FULL' | 'CLOSED' | 'IN_PROGRESS' | 'RESOLVED'
  | 'PAID' | 'FAILED' | 'REFUNDED'
  | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'DISABLED'
  | 'UNREAD' | 'READ' | 'ARCHIVED'
  | 'ACTIVE_USER' | 'INACTIVE_USER' | 'BANNED_USER' | 'DELETED_USER';

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
  PUBLISHED:    { label: 'E’lon qilingan', bg: 'bg-blue-500/5',   text: 'text-blue-400',   dot: 'bg-blue-400', border: 'border-blue-500/20' },
  REGISTRATION_OPEN:   { label: 'Ro‘yxat ochiq', bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400 animate-pulse', border: 'border-green-500/30' },
  REGISTRATION_CLOSED: { label: 'Ro‘yxat yopiq', bg: 'bg-zinc-500/5', text: 'text-zinc-400', dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  ONGOING:      { label: 'Davom etmoqda', bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400 animate-pulse', border: 'border-green-500/30' },
  PAUSED:       { label: 'Pauza',         bg: 'bg-yellow-500/5', text: 'text-yellow-400', dot: 'bg-yellow-400', border: 'border-yellow-500/20' },
  // Slots and maintenance
  OPEN:         { label: 'Ochiq',         bg: 'bg-green-500/5', text: 'text-green-400', dot: 'bg-green-400', border: 'border-green-500/20' },
  FULL:         { label: 'To‘la',         bg: 'bg-orange-500/5', text: 'text-orange-400', dot: 'bg-orange-400', border: 'border-orange-500/20' },
  CLOSED:       { label: 'Yopiq',         bg: 'bg-zinc-500/5', text: 'text-zinc-400', dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  IN_PROGRESS:  { label: 'Jarayonda',     bg: 'bg-blue-500/5', text: 'text-blue-400', dot: 'bg-blue-400', border: 'border-blue-500/20' },
  RESOLVED:     { label: 'Hal qilindi',   bg: 'bg-green-500/5', text: 'text-green-400', dot: 'bg-green-400', border: 'border-green-500/20' },
  // Payment
  PAID:         { label: "To'landi",      bg: 'bg-green-500/5',  text: 'text-green-400',  dot: 'bg-green-400', border: 'border-green-500/20' },
  FAILED:       { label: 'Xato',          bg: 'bg-red-500/5',    text: 'text-red-400',    dot: 'bg-red-400', border: 'border-red-500/20' },
  REFUNDED:     { label: 'Qaytarildi',    bg: 'bg-purple-500/5', text: 'text-purple-400', dot: 'bg-purple-400', border: 'border-purple-500/20' },
  // Streams and notifications
  SCHEDULED:    { label: 'Rejalashtirilgan', bg: 'bg-blue-500/5', text: 'text-blue-400', dot: 'bg-blue-400', border: 'border-blue-500/20' },
  LIVE:         { label: 'Jonli',         bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400 animate-pulse', border: 'border-red-500/30' },
  ENDED:        { label: 'Yakunlangan',   bg: 'bg-zinc-500/5', text: 'text-zinc-400', dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  DISABLED:     { label: 'O‘chirilgan',   bg: 'bg-zinc-500/5', text: 'text-zinc-400', dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  UNREAD:       { label: 'O‘qilmagan',    bg: 'bg-blue-500/5', text: 'text-blue-400', dot: 'bg-blue-400', border: 'border-blue-500/20' },
  READ:         { label: 'O‘qilgan',      bg: 'bg-zinc-500/5', text: 'text-zinc-400', dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  ARCHIVED:     { label: 'Arxivlangan',   bg: 'bg-purple-500/5', text: 'text-purple-400', dot: 'bg-purple-400', border: 'border-purple-500/20' },
  // User
  ACTIVE_USER:   { label: 'Faol',          bg: 'bg-green-500/5',  text: 'text-green-400',  dot: 'bg-green-400', border: 'border-green-500/20' },
  INACTIVE_USER: { label: 'Nofaol',        bg: 'bg-zinc-500/5',   text: 'text-zinc-400',   dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  BANNED_USER:   { label: 'Bloklangan',    bg: 'bg-red-500/5',    text: 'text-red-400',    dot: 'bg-red-400', border: 'border-red-500/20' },
  DELETED_USER:  { label: "O'chirilgan",   bg: 'bg-orange-500/5', text: 'text-orange-400', dot: 'bg-orange-400', border: 'border-orange-500/20' },
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
