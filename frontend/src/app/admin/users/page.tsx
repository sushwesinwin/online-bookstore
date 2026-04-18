'use client';

import { useEffect, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  Loader2,
  Mail,
  MoreHorizontal,
  PencilLine,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { adminApi } from '@/lib/api/admin';
import type {
  AdminUser,
  AdminUserDetails,
  UpdateAdminUserData,
} from '@/lib/api/types';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate } from '@/lib/utils';

type UserRole = AdminUser['role'];
type RoleFilter = '' | UserRole;
type SortBy = 'name' | 'role' | 'orders' | 'joined';
type SortOrder = 'asc' | 'desc';
type HeaderTab = 'profiles' | 'roles';
type VisibleColumnKey = 'user' | 'role' | 'orders' | 'joined' | 'actions';
type EditUserFormState = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

const ROLE_OPTIONS: Array<{ label: string; value: RoleFilter }> = [
  { label: 'All Roles', value: '' },
  { label: 'Users', value: 'USER' },
  { label: 'Admins', value: 'ADMIN' },
];

const HEADER_TABS: Array<{ id: HeaderTab; label: string }> = [
  { id: 'profiles', label: 'User List & Profiles' },
  { id: 'roles', label: 'Roles & Permissions' },
];

const COLUMN_OPTIONS: Array<{ key: VisibleColumnKey; label: string }> = [
  { key: 'user', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'orders', label: 'Orders' },
  { key: 'joined', label: 'Joined' },
  { key: 'actions', label: 'Actions' },
];

function getUserName(user: Pick<AdminUser, 'firstName' | 'lastName'>) {
  return `${user.firstName} ${user.lastName}`.trim() || 'Unnamed User';
}

function UserAvatar({
  user,
  size = 'md',
}: {
  user: Pick<AdminUser, 'firstName' | 'lastName' | 'profileImage' | 'role'>;
  size?: 'md' | 'lg';
}) {
  const initials =
    `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
  const isAdmin = user.role === 'ADMIN';
  const sizeClass =
    size === 'lg'
      ? 'h-16 w-16 rounded-2xl text-lg'
      : 'h-10 w-10 rounded-xl text-sm';

  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={getUserName(user)}
        className={`${sizeClass} object-cover flex-shrink-0 ring-1 ring-border`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center text-white font-bold flex-shrink-0 ${isAdmin ? 'bg-gradient-to-br from-secondary to-orange-400' : 'bg-gradient-to-br from-primary to-zinc-500'}`}
    >
      {initials || '?'}
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${role === 'ADMIN' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-primary/10 text-primary border border-primary/20'}`}
    >
      {role === 'ADMIN' ? (
        <ShieldCheck className="h-3 w-3" />
      ) : (
        <UserCircle2 className="h-3 w-3" />
      )}
      {role === 'ADMIN' ? 'Admin' : 'User'}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'neutral' | 'admin' | 'user';
}) {
  const toneClass =
    tone === 'admin'
      ? 'bg-secondary/10 text-secondary'
      : tone === 'user'
        ? 'bg-primary/10 text-primary'
        : 'bg-muted text-foreground';

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div
        className={`mb-3 inline-flex rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${toneClass}`}
      >
        {label}
      </div>
      <p className="text-3xl font-black tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function UserActionsMenu({
  user,
  canDeleteUser,
  isDeletingUser,
  onView,
  onEdit,
  onDelete,
}: {
  user: AdminUser;
  canDeleteUser: boolean;
  isDeletingUser: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Open actions for ${getUserName(user)}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 rounded-2xl border border-border bg-white p-2 shadow-xl"
        >
          <DropdownMenu.Item
            onSelect={() => {
              setOpen(false);
              onView();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted"
          >
            <Eye className="h-4 w-4" />
            View
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted"
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-2 h-px bg-border" />

          <DropdownMenu.Item
            disabled={!canDeleteUser || isDeletingUser}
            onSelect={event => {
              if (!canDeleteUser || isDeletingUser) {
                event.preventDefault();
                return;
              }
              setOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-destructive outline-none transition-colors focus:bg-destructive/10 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const syncCurrentUser = useAuthStore(state => state.updateUser);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('');
  const [headerTab, setHeaderTab] = useState<HeaderTab>('profiles');
  const [sortBy, setSortBy] = useState<SortBy>('joined');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<VisibleColumnKey, boolean>
  >({
    user: true,
    role: true,
    orders: true,
    joined: true,
    actions: true,
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [confirmRole, setConfirmRole] = useState<{
    id: string;
    name: string;
    newRole: UserRole;
  } | null>(null);
  const [editUserForm, setEditUserForm] = useState<EditUserFormState | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const queryKey = ['admin', 'users', page, limit, debouncedSearch, roleFilter];

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
      }),
  });

  const {
    data: selectedUser,
    isLoading: isSelectedUserLoading,
    isError: isSelectedUserError,
    error: selectedUserError,
  } = useQuery({
    queryKey: ['admin', 'users', 'detail', selectedUserId],
    queryFn: () => adminApi.getUserById(selectedUserId!),
    enabled: Boolean(selectedUserId),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: updatedUser => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.setQueryData(
        ['admin', 'users', 'detail', updatedUser.id],
        updatedUser
      );
      setConfirmRole(null);
      toast.success(
        `${getUserName(updatedUser)} is now ${updatedUser.role.toLowerCase()}`
      );
    },
    onError: mutationError => {
      toast.error(
        getApiErrorMessage(mutationError, 'Failed to update user role.')
      );
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminUserData }) =>
      adminApi.updateUser(id, data),
    onSuccess: updatedUser => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.setQueryData(
        ['admin', 'users', 'detail', updatedUser.id],
        updatedUser
      );
      if (currentUser?.id === updatedUser.id) {
        syncCurrentUser({
          ...currentUser,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        });
      }
      setEditUserForm(null);
      toast.success(`${getUserName(updatedUser)} updated successfully`);
    },
    onError: mutationError => {
      toast.error(getApiErrorMessage(mutationError, 'Failed to update user.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: (_, deletedUserId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.removeQueries({
        queryKey: ['admin', 'users', 'detail', deletedUserId],
      });
      if (selectedUserId === deletedUserId) {
        setSelectedUserId(null);
      }
      setConfirmDelete(null);
      toast.success('User deleted successfully');
    },
    onError: mutationError => {
      toast.error(getApiErrorMessage(mutationError, 'Failed to delete user.'));
    },
  });

  const users = data?.data ?? [];
  const meta = data?.meta;
  const pageSize = meta?.limit ?? limit;

  const sortedUsers = [...users].sort((a, b) => {
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'name') {
      return getUserName(a).localeCompare(getUserName(b)) * direction;
    }

    if (sortBy === 'role') {
      return a.role.localeCompare(b.role) * direction;
    }

    if (sortBy === 'orders') {
      return (a.orderCount - b.orderCount) * direction;
    }

    return (
      (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
      direction
    );
  });

  const adminsOnPage = sortedUsers.filter(user => user.role === 'ADMIN').length;
  const readersOnPage = sortedUsers.length - adminsOnPage;

  const isCurrentUser = (userId: string) => currentUser?.id === userId;

  const canChangeRole = (user: AdminUser | AdminUserDetails) =>
    !isCurrentUser(user.id);

  const canDeleteUser = (user: AdminUser | AdminUserDetails) =>
    !isCurrentUser(user.id) && user.orderCount === 0;

  const getRoleActionTitle = (user: AdminUser | AdminUserDetails) => {
    if (isCurrentUser(user.id)) {
      return 'You cannot change your own role';
    }

    return user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin';
  };

  const getDeleteActionTitle = (user: AdminUser | AdminUserDetails) => {
    if (isCurrentUser(user.id)) {
      return 'You cannot delete your own account';
    }

    if (user.orderCount > 0) {
      return 'Cannot delete: user has orders';
    }

    return 'Delete user';
  };

  const handleRoleToggle = (user: AdminUser | AdminUserDetails) => {
    updateRoleMutation.reset();
    setConfirmRole({
      id: user.id,
      name: getUserName(user),
      newRole: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
    });
  };

  const handleDeleteRequest = (user: AdminUser | AdminUserDetails) => {
    deleteMutation.reset();
    setConfirmDelete({
      id: user.id,
      name: getUserName(user),
    });
  };

  const handleEditRequest = (user: AdminUser | AdminUserDetails) => {
    updateUserMutation.reset();
    setEditUserForm({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  };

  const isEditFormValid = Boolean(
    editUserForm?.email.trim() &&
    editUserForm.firstName.trim() &&
    editUserForm.lastName.trim()
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Users className="h-7 w-7 text-primary" />
            </div>
            Users
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {HEADER_TABS.map(tab => {
              const isActive = headerTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHeaderTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-white text-muted-foreground border border-border hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <p className="text-muted-foreground mt-3 font-medium">
            {headerTab === 'profiles'
              ? 'Browse user accounts, profiles, and activity.'
              : 'Review role assignments and permissions.'}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard
          label="Directory"
          value={meta?.total ?? '...'}
          tone="neutral"
        />
        <SummaryCard label="Admins On Page" value={adminsOnPage} tone="admin" />
        <SummaryCard label="Users On Page" value={readersOnPage} tone="user" />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 md:h-12 bg-white rounded-xl"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 h-11 md:h-12">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <select
              value={roleFilter}
              onChange={e => {
                setRoleFilter(e.target.value as RoleFilter);
                setPage(1);
              }}
              className="text-sm font-medium text-foreground bg-transparent outline-none cursor-pointer"
            >
              {ROLE_OPTIONS.map(option => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 h-11 md:h-12">
            <span className="text-xs font-semibold text-muted-foreground">
              Sort
            </span>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={e => {
                const [nextSortBy, nextSortOrder] = e.target.value.split(
                  ':'
                ) as [SortBy, SortOrder];
                setSortBy(nextSortBy);
                setSortOrder(nextSortOrder);
              }}
              className="text-sm font-medium text-foreground bg-transparent outline-none cursor-pointer"
            >
              <option value="joined:desc">Newest first</option>
              <option value="joined:asc">Oldest first</option>
              <option value="name:asc">Name A → Z</option>
              <option value="name:desc">Name Z → A</option>
              <option value="orders:desc">Orders high → low</option>
              <option value="orders:asc">Orders low → high</option>
              <option value="role:asc">Role A → Z</option>
              <option value="role:desc">Role Z → A</option>
            </select>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnsOpen(open => !open)}
              className="h-11 md:h-12 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm"
            >
              Columns
            </button>
            {isColumnsOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-border bg-white shadow-lg p-2">
                {COLUMN_OPTIONS.map(column => (
                  <label
                    key={column.key}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.key]}
                      onChange={() =>
                        setVisibleColumns(previous => ({
                          ...previous,
                          [column.key]: !previous[column.key],
                        }))
                      }
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isError && (
        <div className="rounded-2xl border border-[#FFD8D5] bg-[#FFF4F3] px-5 py-4 text-sm text-[#A53024]">
          {getApiErrorMessage(error, 'Failed to load users.')}
        </div>
      )}

      <div className="block lg:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-border p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-44 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))
        ) : sortedUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <Users className="h-12 w-12 opacity-20 mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold text-muted-foreground">
              No users found
            </p>
            {(debouncedSearch || roleFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                }}
                className="text-sm text-primary hover:underline mt-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          sortedUsers.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-border p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <UserAvatar user={user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">
                        {getUserName(user)}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <RoleBadge role={user.role} />
                      <UserActionsMenu
                        user={user}
                        canDeleteUser={canDeleteUser(user)}
                        isDeletingUser={deleteMutation.isPending}
                        onView={() => setSelectedUserId(user.id)}
                        onEdit={() => handleEditRequest(user)}
                        onDelete={() => handleDeleteRequest(user)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {user.orderCount} orders
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden lg:block bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/70">
                {visibleColumns.user && (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    User
                  </th>
                )}
                {visibleColumns.role && (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Role
                  </th>
                )}
                {visibleColumns.orders && (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Orders
                  </th>
                )}
                {visibleColumns.joined && (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Joined
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-44 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 w-28 bg-muted animate-pulse rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Users className="h-12 w-12 opacity-20" />
                      <p className="font-semibold">No users found</p>
                      {(debouncedSearch || roleFilter) && (
                        <button
                          onClick={() => {
                            setSearch('');
                            setRoleFilter('');
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedUsers.map(user => (
                  <tr
                    key={user.id}
                    className="group hover:bg-muted/60 transition-colors"
                  >
                    {visibleColumns.user && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {getUserName(user)}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}

                    {visibleColumns.role && (
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                    )}

                    {visibleColumns.orders && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span className="font-semibold text-foreground">
                            {user.orderCount}
                          </span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.joined && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                    )}

                    {visibleColumns.actions && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <UserActionsMenu
                            user={user}
                            canDeleteUser={canDeleteUser(user)}
                            isDeletingUser={deleteMutation.isPending}
                            onView={() => setSelectedUserId(user.id)}
                            onEdit={() => handleEditRequest(user)}
                            onDelete={() => handleDeleteRequest(user)}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="h-10 w-32 appearance-none rounded-lg border border-border bg-white px-3 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={limit}
                onChange={e => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            </div>
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              <span className="font-semibold text-foreground">
                {meta.total === 0 ? 0 : (meta.page - 1) * pageSize + 1}
              </span>
              –{Math.min(meta.page * pageSize, meta.total)} of {meta.total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!meta.hasPreviousPage}
              onClick={() =>
                setPage(currentPage => Math.max(1, currentPage - 1))
              }
              className="h-9 w-9 rounded-lg border-border"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-9 min-w-[36px] items-center justify-center rounded-lg bg-white px-3 text-sm font-bold text-foreground shadow-sm">
              {meta.page}
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={!meta.hasNextPage}
              onClick={() => setPage(currentPage => currentPage + 1)}
              className="h-9 w-9 rounded-lg border-border"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                  User Detail
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                  Account Overview
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-90px)] overflow-y-auto px-6 py-6">
              {isSelectedUserLoading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isSelectedUserError ? (
                <div className="rounded-2xl border border-[#FFD8D5] bg-[#FFF4F3] px-5 py-4 text-sm text-[#A53024]">
                  {getApiErrorMessage(
                    selectedUserError,
                    'Failed to load user details.'
                  )}
                </div>
              ) : selectedUser ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <UserAvatar user={selectedUser} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-2xl font-black tracking-tight text-foreground">
                          {getUserName(selectedUser)}
                        </h4>
                        <RoleBadge role={selectedUser.role} />
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground break-all">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-muted p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                        Orders
                      </p>
                      <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
                        {selectedUser.orderCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                        User ID
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground break-all">
                        {selectedUser.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-white p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                        Joined
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                        {formatDate(selectedUser.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      Management Actions
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Button
                        variant="outline"
                        onClick={() => handleEditRequest(selectedUser)}
                        className="border-border"
                      >
                        Edit User
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRoleToggle(selectedUser)}
                        disabled={!canChangeRole(selectedUser)}
                        title={getRoleActionTitle(selectedUser)}
                        className="border-border"
                      >
                        {selectedUser.role === 'ADMIN'
                          ? 'Make User'
                          : 'Make Admin'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteRequest(selectedUser)}
                        disabled={!canDeleteUser(selectedUser)}
                        title={getDeleteActionTitle(selectedUser)}
                        className="border-[#FF4E3E]/20 text-[#FF4E3E] hover:bg-[#FFECEB] hover:text-[#FF4E3E]"
                      >
                        Delete User
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(editUserForm)}
        onClose={() => {
          setEditUserForm(null);
          updateUserMutation.reset();
        }}
        title="Edit User"
      >
        {editUserForm && (
          <form
            className="space-y-5"
            onSubmit={event => {
              event.preventDefault();
              updateUserMutation.mutate({
                id: editUserForm.id,
                data: {
                  email: editUserForm.email.trim(),
                  firstName: editUserForm.firstName.trim(),
                  lastName: editUserForm.lastName.trim(),
                },
              });
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="edit-user-first-name"
                className="text-sm font-semibold text-foreground"
              >
                First name
              </label>
              <Input
                id="edit-user-first-name"
                value={editUserForm.firstName}
                onChange={event =>
                  setEditUserForm(current =>
                    current
                      ? { ...current, firstName: event.target.value }
                      : current
                  )
                }
                placeholder="First name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-user-last-name"
                className="text-sm font-semibold text-foreground"
              >
                Last name
              </label>
              <Input
                id="edit-user-last-name"
                value={editUserForm.lastName}
                onChange={event =>
                  setEditUserForm(current =>
                    current
                      ? { ...current, lastName: event.target.value }
                      : current
                  )
                }
                placeholder="Last name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-user-email"
                className="text-sm font-semibold text-foreground"
              >
                Email
              </label>
              <Input
                id="edit-user-email"
                type="email"
                value={editUserForm.email}
                onChange={event =>
                  setEditUserForm(current =>
                    current
                      ? { ...current, email: event.target.value }
                      : current
                  )
                }
                placeholder="Email address"
              />
            </div>

            {updateUserMutation.isError && (
              <p className="rounded-xl bg-[#FFECEB] p-3 text-sm text-[#FF4E3E]">
                {getApiErrorMessage(
                  updateUserMutation.error,
                  'Failed to update user.'
                )}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={updateUserMutation.isPending}
                onClick={() => {
                  setEditUserForm(null);
                  updateUserMutation.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!isEditFormValid || updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {confirmRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  Change Role
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set <strong>{confirmRole.name}</strong> to{' '}
                  <strong>{confirmRole.newRole}</strong>?
                </p>
              </div>
            </div>
            {updateRoleMutation.isError && (
              <p className="text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-xl p-3">
                {getApiErrorMessage(
                  updateRoleMutation.error,
                  'Failed to update role.'
                )}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setConfirmRole(null);
                  updateRoleMutation.reset();
                }}
                disabled={updateRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={updateRoleMutation.isPending}
                onClick={() =>
                  updateRoleMutation.mutate({
                    id: confirmRole.id,
                    role: confirmRole.newRole,
                  })
                }
              >
                {updateRoleMutation.isPending ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#FFECEB]">
                <AlertCircle className="h-6 w-6 text-[#FF4E3E]" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  Delete User
                </h3>
                <p className="text-sm text-muted-foreground">
                  Delete <strong>{confirmDelete.name}</strong>? This action
                  cannot be undone.
                </p>
              </div>
            </div>
            {deleteMutation.isError && (
              <p className="text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-xl p-3">
                {getApiErrorMessage(
                  deleteMutation.error,
                  'Failed to delete user.'
                )}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setConfirmDelete(null);
                  deleteMutation.reset();
                }}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#FF4E3E] hover:bg-[#E03E2F] text-white"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
