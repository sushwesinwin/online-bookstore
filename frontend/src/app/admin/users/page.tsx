'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminUser } from '@/lib/api/types';
import {
  Search,
  Users,
  ShieldCheck,
  UserCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  Calendar,
  Filter,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { label: 'All Roles', value: '' },
  { label: 'Users', value: 'USER' },
  { label: 'Admins', value: 'ADMIN' },
];

function UserAvatar({ user }: { user: AdminUser }) {
  const initials =
    `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
  const isAdmin = user.role === 'ADMIN';
  return (
    <div
      className={`h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${isAdmin ? 'bg-gradient-to-br from-[#FF6320] to-[#FF8F6B]' : 'bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D]'}`}
    >
      {initials || '?'}
    </div>
  );
}

function RoleBadge({ role }: { role: 'USER' | 'ADMIN' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${role === 'ADMIN' ? 'bg-[#FFF4ED] text-[#FF6320] border border-[#FF6320]/20' : 'bg-[#E4FFFB] text-[#0B7C6B] border border-[#0B7C6B]/20'}`}
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

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | 'USER' | 'ADMIN'>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmRole, setConfirmRole] = useState<{
    id: string;
    newRole: 'USER' | 'ADMIN';
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const queryKey = ['admin', 'users', page, debouncedSearch, roleFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmRole(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmDelete(null);
    },
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  const handleRoleToggle = (user: AdminUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setConfirmRole({ id: user.id, newRole });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#101313] flex items-center gap-3">
            <div className="p-2.5 bg-[#E4FFFB] rounded-xl">
              <Users className="h-7 w-7 text-[#0B7C6B]" />
            </div>
            User Management
          </h1>
          <p className="text-[#848785] mt-2 font-medium">
            {meta ? `${meta.total} total users` : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#848785]" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E4E9E8] rounded-xl px-3 h-11">
          <Filter className="h-4 w-4 text-[#848785] flex-shrink-0" />
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value as any);
              setPage(1);
            }}
            className="text-sm font-medium text-[#101313] bg-transparent outline-none cursor-pointer"
          >
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E4E9E8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E4E9E8] bg-[#F8FAFB]">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#848785]">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#848785]">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#848785]">
                  Orders
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#848785]">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#848785] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9E8]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#F3F5F5] animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-[#F3F5F5] animate-pulse rounded" />
                          <div className="h-3 w-44 bg-[#F3F5F5] animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-[#F3F5F5] animate-pulse rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-8 bg-[#F3F5F5] animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-[#F3F5F5] animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 w-20 bg-[#F3F5F5] animate-pulse rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#848785]">
                      <Users className="h-12 w-12 opacity-20" />
                      <p className="font-semibold">No users found</p>
                      {(debouncedSearch || roleFilter) && (
                        <button
                          onClick={() => {
                            setSearch('');
                            setRoleFilter('');
                          }}
                          className="text-sm text-[#0B7C6B] hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr
                    key={user.id}
                    className="group hover:bg-[#F8FAFB]/50 transition-colors"
                  >
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div className="min-w-0">
                          <p className="font-bold text-[#101313] truncate group-hover:text-[#0B7C6B] transition-colors">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-[#848785] truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Orders */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-[#848785]">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span className="font-semibold text-[#101313]">
                          {user.orderCount}
                        </span>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-[#848785]">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle role */}
                        <button
                          onClick={() => handleRoleToggle(user)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            user.role === 'ADMIN'
                              ? 'border-[#E4E9E8] text-[#848785] hover:border-[#0B7C6B]/40 hover:text-[#0B7C6B] hover:bg-[#E4FFFB]'
                              : 'border-[#E4E9E8] text-[#848785] hover:border-[#FF6320]/40 hover:text-[#FF6320] hover:bg-[#FFF4ED]'
                          }`}
                          title={
                            user.role === 'ADMIN'
                              ? 'Demote to User'
                              : 'Promote to Admin'
                          }
                        >
                          {user.role === 'ADMIN' ? (
                            <>
                              <UserCircle2 className="h-3.5 w-3.5" /> Make User
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" /> Make Admin
                            </>
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          disabled={user.orderCount > 0}
                          className="p-2 rounded-xl text-[#848785] hover:text-[#FF4E3E] hover:bg-[#FFECEB] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            user.orderCount > 0
                              ? 'Cannot delete: user has orders'
                              : 'Delete user'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E4E9E8] bg-[#F8FAFB]">
            <p className="text-sm text-[#848785]">
              Showing {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage(p => p - 1)}
                className="h-9 w-9 p-0 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: meta.totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={meta.page === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                  className={`h-9 w-9 p-0 rounded-xl ${meta.page === i + 1 ? 'bg-[#0B7C6B]' : ''}`}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => setPage(p => p + 1)}
                className="h-9 w-9 p-0 rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Role Change Modal */}
      {confirmRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#FFF4ED]">
                <ShieldCheck className="h-6 w-6 text-[#FF6320]" />
              </div>
              <div>
                <h3 className="font-bold text-[#101313] text-lg">
                  Change Role
                </h3>
                <p className="text-sm text-[#848785]">
                  Set role to <strong>{confirmRole.newRole}</strong>?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmRole(null)}
                disabled={updateRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#0B7C6B] hover:bg-[#096B5B]"
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

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#FFECEB]">
                <AlertCircle className="h-6 w-6 text-[#FF4E3E]" />
              </div>
              <div>
                <h3 className="font-bold text-[#101313] text-lg">
                  Delete User
                </h3>
                <p className="text-sm text-[#848785]">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            {deleteMutation.isError && (
              <p className="text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-xl p-3">
                {(deleteMutation.error as any)?.response?.data?.message ??
                  'Failed to delete user.'}
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
                onClick={() => deleteMutation.mutate(confirmDelete)}
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
