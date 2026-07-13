interface TablePaginationProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
  showingCount: number;
}

export default function TablePagination({
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  isLoading,
  showingCount,
}: TablePaginationProps) {
  const fromIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const toIndex = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/30 backdrop-blur-md border border-border/80 px-5 py-3.5 rounded-2xl shadow-md">
      <span className="text-xs text-muted-foreground font-heading">
        {total > 0
          ? `${total} tadan ${fromIndex} - ${toIndex} ko'rsatilmoqda`
          : `${showingCount} ta foydalanuvchi`}
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1 || isLoading}
          className="px-4 py-2 bg-background/50 border border-border hover:border-primary/50 disabled:opacity-40 disabled:hover:border-border text-xs font-heading font-bold uppercase tracking-wider text-white rounded-xl transition-all active:scale-[0.98]"
        >
          Oldingi
        </button>
        <span className="text-xs font-heading font-bold text-white px-2">
          {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(Math.min(page + 1, totalPages || 1))}
          disabled={page >= (totalPages || 1) || isLoading}
          className="px-4 py-2 bg-background/50 border border-border hover:border-primary/50 disabled:opacity-40 disabled:hover:border-border text-xs font-heading font-bold uppercase tracking-wider text-white rounded-xl transition-all active:scale-[0.98]"
        >
          Keyingi
        </button>
      </div>
    </div>
  );
}
