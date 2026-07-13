import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { useUsersQuery } from '@/hooks/api/useUsers';
import InviteUserModal from '@/components/admin/InviteUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import ViewUserModal from '@/components/admin/ViewUserModal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import UserFilters from '@/components/admin/UserFilters';
import UsersTable from '@/components/admin/UsersTable';
import TablePagination from '@/components/admin/TablePagination';
import {
  usersApi,
  type CreateUserDto,
  type GetUsersParams,
  type UpdateUserDto,
} from '@/api/users.api';
import type { User, UserRole, UserStatus } from '@/types';

type UserRoleFilter = UserRole | 'ALL';
type UserStatusFilter = UserStatus | 'ALL';
type UserSortField = NonNullable<GetUsersParams['sortBy']>;

const userRoles: readonly UserRole[] = ['SUPERADMIN', 'ADMIN', 'OPERATOR', 'RACER', 'TEAM_MANAGER'];
const userStatuses: readonly UserStatus[] = ['ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'];
const userSortFields: readonly UserSortField[] = ['createdAt', 'fullName', 'lastLoginAt'];

function isUserRoleFilter(value: string): value is UserRoleFilter {
  return value === 'ALL' || userRoles.some(role => role === value);
}

function isUserStatusFilter(value: string): value is UserStatusFilter {
  return value === 'ALL' || userStatuses.some(status => status === value);
}

function isUserSortField(value: string): value is UserSortField {
  return userSortFields.some(field => field === value);
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('ACTIVE');
  const [sortBy, setSortBy] = useState<UserSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);

  // View, Edit, Delete states
  const [selectedUserIdForView, setSelectedUserIdForView] = useState<string | number | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // React Query Hook with all Swagger parameters
  const { data, isLoading, refetch } = useUsersQuery({
    search,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    page,
    limit,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    sortBy,
    sortOrder
  });

  const usersList = data?.data || [];

  const handleCreateUser = async (payload: CreateUserDto) => {
    setInviting(true);
    try {
      await usersApi.createUser(payload);
      refetch();
      setShowInvite(false);
    } catch (error: unknown) {
      console.error('User creation failed', error);
      throw error;
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateUser = async (payload: UpdateUserDto) => {
    if (!selectedUserForEdit) return;
    setUpdating(true);
    try {
      await usersApi.updateUser(selectedUserForEdit.id, payload);
      refetch();
      setSelectedUserForEdit(null);
    } catch (error: unknown) {
      console.error('User update failed', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    setDeleting(true);
    try {
      await usersApi.deleteUser(selectedUserForDelete.id);
      refetch();
      setSelectedUserForDelete(null);
    } catch (error: unknown) {
      console.error('User deletion failed', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Foydalanuvchilar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.meta?.total ?? usersList.length} ta foydalanuvchi
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Yaratish</span>
        </button>
      </div>

      {/* Invite modal */}
      <InviteUserModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onCreate={handleCreateUser}
        inviting={inviting}
      />

      {/* Filters */}
      <UserFilters
        search={search}
        onSearchChange={val => { setSearch(val); setPage(1); }}
        roleFilter={roleFilter}
        onRoleFilterChange={val => {
          if (isUserRoleFilter(val)) setRoleFilter(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={val => {
          if (isUserStatusFilter(val)) setStatusFilter(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={val => {
          if (isUserSortField(val)) setSortBy(val);
        }}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        limit={limit}
        onLimitChange={val => { setLimit(val); setPage(1); }}
      />

      {/* Table */}
      <UsersTable
        usersList={usersList}
        isLoading={isLoading}
        onView={user => setSelectedUserIdForView(user.id)}
        onEdit={user => setSelectedUserForEdit(user)}
        onDelete={user => setSelectedUserForDelete(user)}
      />

      {/* Pagination Controls */}
      <TablePagination
        total={data?.meta?.total ?? 0}
        page={page}
        limit={limit}
        totalPages={data?.meta?.totalPages || 1}
        onPageChange={setPage}
        isLoading={isLoading}
        showingCount={usersList.length}
      />

      {/* View Modal */}
      <ViewUserModal
        isOpen={selectedUserIdForView !== null}
        onClose={() => setSelectedUserIdForView(null)}
        userId={selectedUserIdForView}
      />

      {/* Edit Modal */}
      <EditUserModal
        isOpen={selectedUserForEdit !== null}
        onClose={() => setSelectedUserForEdit(null)}
        user={selectedUserForEdit}
        onUpdate={handleUpdateUser}
        updating={updating}
      />

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={selectedUserForDelete !== null}
        onClose={() => setSelectedUserForDelete(null)}
        onConfirm={handleDeleteUser}
        deleting={deleting}
        title="Foydalanuvchini o'chirish"
        message={`Haqiqatan ham "${selectedUserForDelete?.fullName || selectedUserForDelete?.email}" foydalanuvchisini o'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.`}
      />
    </div>
  );
}
