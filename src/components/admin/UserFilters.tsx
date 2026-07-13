import { Search, ChevronDown } from 'lucide-react';

interface UserFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (val: 'asc' | 'desc') => void;
  limit: number;
  onLimitChange: (val: number) => void;
}

const ALL_ROLES = ['ALL', 'SUPERADMIN', 'ADMIN', 'OPERATOR', 'RACER', 'TEAM_MANAGER'];

export default function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  limit,
  onLimitChange,
}: UserFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Primary Filters (Search + Roles) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Ism yoki email bo'yicha qidirish..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_ROLES.map(r => (
            <button
              key={r}
              onClick={() => onRoleFilterChange(r)}
              className={`px-3 py-2 rounded-lg text-xs font-heading font-semibold tracking-wide transition-all ${
                roleFilter === r ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-white hover:border-white/20'
              }`}
            >
              {r === 'ALL' ? 'Barchasi' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Premium custom dropdowns for Status, Sort, Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-card/40 backdrop-blur-md border border-border/80 p-4 rounded-2xl">
        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Holat</label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => onStatusFilterChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-background/50 border border-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-primary cursor-pointer transition-colors"
            >
              <option value="ALL" className="bg-zinc-950">Barchasi</option>
              <option value="ACTIVE" className="bg-zinc-950">Faol (Active)</option>
              <option value="INACTIVE" className="bg-zinc-950">Nofaol (Inactive)</option>
              <option value="BANNED" className="bg-zinc-950">Bloklangan (Banned)</option>
              <option value="DELETED" className="bg-zinc-950">O'chirilgan (Deleted)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Saralash ustuni</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => onSortByChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-background/50 border border-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-primary cursor-pointer transition-colors"
            >
              <option value="createdAt" className="bg-zinc-950">Yaratilgan sana</option>
              <option value="fullName" className="bg-zinc-950">To'liq ism</option>
              <option value="lastLoginAt" className="bg-zinc-950">Oxirgi faollik</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Sort Order */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Yo'nalish</label>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={e => onSortOrderChange(e.target.value as 'asc' | 'desc')}
              className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-background/50 border border-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-primary cursor-pointer transition-colors"
            >
              <option value="desc" className="bg-zinc-950">Kamayish (Desc)</option>
              <option value="asc" className="bg-zinc-950">O'sish (Asc)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Limit */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Limit</label>
          <div className="relative">
            <select
              value={limit}
              onChange={e => onLimitChange(Number(e.target.value))}
              className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-background/50 border border-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-primary cursor-pointer transition-colors"
            >
              <option value={10} className="bg-zinc-950">10 ta</option>
              <option value={20} className="bg-zinc-950">20 ta</option>
              <option value={50} className="bg-zinc-950">50 ta</option>
              <option value={100} className="bg-zinc-950">100 ta</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
