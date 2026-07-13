import type { UserRole } from '@/api/base44Client';

type RoleKey = Uppercase<UserRole>;

const roleConfig: Record<RoleKey, { label: string; bg: string; text: string; border: string }> = {
  SUPERADMIN:   { label: 'SUPERADMIN', bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  ADMIN:        { label: 'ADMIN',       bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30'    },
  OPERATOR:     { label: 'OPERATOR',    bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30'   },
  RACER:        { label: 'RACER',       bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30'  },
  TEAM_MANAGER: { label: 'MANAGER',     bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
};

const unknownRole = {
  label: 'NOMA’LUM',
  bg: 'bg-gray-500/15',
  text: 'text-gray-400',
  border: 'border-gray-500/30',
};

interface RoleBadgeProps {
  role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const key = role.toUpperCase() as RoleKey;
  const config = roleConfig[key] ?? { ...unknownRole, label: role.toUpperCase() };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
