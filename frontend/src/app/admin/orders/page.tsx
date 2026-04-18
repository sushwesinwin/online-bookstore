'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  BookOpen,
  ShoppingCart,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import Link from 'next/link';
export default function AdminOrders() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'totalAmount' | 'orderNumber'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    orderInfo: true,
    customer: true,
    items: true,
    amount: true,
    status: true,
    action: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const { data, isLoading } = useOrders({
    page,
    limit,
    search: search || undefined,
    status: (statusFilter || undefined) as any,
    sortBy,
    sortOrder,
  });

  const updateStatus = useUpdateOrderStatus();

  if (!mounted) return null;

  const pageSize = data?.meta?.limit ?? limit;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle2 className="mr-1 h-3 w-3" />;
      case 'SHIPPED':
        return <Truck className="mr-1 h-3 w-3" />;
      case 'PENDING':
        return <Clock className="mr-1 h-3 w-3" />;
      case 'CANCELLED':
        return <XCircle className="mr-1 h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-[#DFFEF5] text-[#17BD8D] border-[#17BD8D]/20';
      case 'SHIPPED':
        return 'bg-[#E4F4FF] text-[#0066FF] border-[#0066FF]/20';
      case 'PENDING':
        return 'bg-[#FFF5E6] text-[#F9B959] border-[#F9B959]/20';
      case 'CANCELLED':
        return 'bg-[#FFECEB] text-[#FF4E3E] border-[#FF4E3E]/20';
      default:
        return 'bg-[#F3F5F5] text-[#848785] border-[#E4E9E8]';
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status });
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#101313]">
            Orders Management
          </h1>
          <p className="mt-1 text-[#848785]">
            Track, process, and manage customer orders.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/admin/purchases">
            <Button className="h-12 bg-[#0B7C6B] hover:bg-[#096B5B] text-white rounded-xl shadow-lg">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create Purchase
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-[#E4E9E8]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-[#848785]" />
          <Input
            placeholder="Search by order number or customer..."
            className="h-12 md:h-14 rounded-xl md:rounded-2xl border-[#E4E9E8] bg-white pl-10 md:pl-12 pr-4 text-sm md:text-base"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl md:rounded-2xl border border-[#E4E9E8] bg-white px-3 md:px-4 h-12 md:h-14 shadow-sm">
            <Filter className="h-4 w-4 text-[#848785] flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm font-bold text-[#101313] bg-transparent outline-none cursor-pointer pr-2"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl md:rounded-2xl border border-[#E4E9E8] bg-white px-3 md:px-4 h-12 md:h-14 shadow-sm">
            <span className="text-xs font-semibold text-[#848785]">Sort</span>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={e => {
                const [by, order] = e.target.value.split(':');
                setSortBy(by as any);
                setSortOrder(order as any);
                setPage(1);
              }}
              className="text-sm font-bold text-[#101313] bg-transparent outline-none cursor-pointer pr-2"
            >
              <option value="createdAt:desc">Newest first</option>
              <option value="createdAt:asc">Oldest first</option>
              <option value="totalAmount:desc">Amount high → low</option>
              <option value="totalAmount:asc">Amount low → high</option>
              <option value="orderNumber:asc">Order # A → Z</option>
              <option value="orderNumber:desc">Order # Z → A</option>
            </select>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnsOpen(o => !o)}
              className="h-12 md:h-14 rounded-xl md:rounded-2xl border border-[#E4E9E8] bg-white px-4 text-sm font-bold text-[#101313] shadow-sm"
            >
              Columns
            </button>
            {isColumnsOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#E4E9E8] bg-white shadow-lg p-2">
                {[
                  { key: 'orderInfo', label: 'Order Info' },
                  { key: 'customer', label: 'Customer' },
                  { key: 'items', label: 'Items' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'status', label: 'Status' },
                  { key: 'action', label: 'Action' },
                ].map(col => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#101313] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(visibleColumns as any)[col.key]}
                      onChange={() =>
                        setVisibleColumns(prev => ({
                          ...prev,
                          [col.key]: !(prev as any)[col.key],
                        }))
                      }
                      className="h-4 w-4 rounded border-[#E4E9E8] text-[#0B7C6B] focus:ring-[#0B7C6B]/30"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E4E9E8] p-4 animate-pulse"
              >
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-32 bg-[#F3F5F5] rounded" />
                  <div className="h-6 w-20 bg-[#F3F5F5] rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[#F3F5F5] rounded" />
                  <div className="h-4 w-3/4 bg-[#F3F5F5] rounded" />
                </div>
              </div>
            ))
        ) : data?.data && data.data.length > 0 ? (
          data.data.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#E4E9E8] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-bold text-[#101313]">
                    {order.orderNumber}
                  </div>
                  <div className="text-xs text-[#848785] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpenDropdownId(
                      openDropdownId === order.id ? null : order.id
                    );
                  }}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusColor(order.status)}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
              </div>

              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-[#848785]">Customer</span>
                  <span className="font-medium text-[#101313] truncate max-w-[60%] text-right">
                    {order.user?.firstName} {order.user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#848785]">Items</span>
                  <Badge
                    variant="outline"
                    className="border-[#E4E9E8] bg-[#F8FAFB] font-medium text-[#101313]"
                  >
                    {order.items.length}{' '}
                    {order.items.length === 1 ? 'book' : 'books'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#848785]">Total</span>
                  <span className="font-bold text-[#101313]">
                    ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                  </span>
                </div>
              </div>

              {openDropdownId === order.id && (
                <div className="mb-3 space-y-2 p-3 bg-[#F8FAFB] rounded-xl">
                  {[
                    'PENDING',
                    'CONFIRMED',
                    'SHIPPED',
                    'DELIVERED',
                    'CANCELLED',
                  ].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        handleUpdateStatus(order.id, s);
                        setOpenDropdownId(null);
                      }}
                      disabled={updateStatus.isPending || order.status === s}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-bold transition-colors ${
                        order.status === s
                          ? 'bg-white text-[#101313] border-2 border-[#0B7C6B]'
                          : 'text-[#848785] hover:bg-white'
                      } disabled:opacity-50`}
                    >
                      {s}
                      {order.status === s && (
                        <CheckCircle2 className="h-4 w-4 text-[#0B7C6B]" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleViewOrder(order)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F3F5F5] px-4 py-2.5 text-sm font-bold text-[#101313] transition-colors hover:bg-[#E4E9E8]"
              >
                <Eye className="h-4 w-4" /> View Details
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-[#E4E9E8] p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-[#E4E9E8] mx-auto mb-2" />
            <p className="text-[#848785]">No orders found</p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-3xl border border-[#E4E9E8] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E4E9E8] bg-[#F8FAFB]">
                {visibleColumns.orderInfo && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Order Info
                  </th>
                )}
                {visibleColumns.customer && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Customer
                  </th>
                )}
                {visibleColumns.items && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Items
                  </th>
                )}
                {visibleColumns.amount && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Amount
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Status
                  </th>
                )}
                {visibleColumns.action && (
                  <th className="px-4 py-5 text-right text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9E8]">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="h-4 w-full rounded bg-[#F3F5F5]"></div>
                      </td>
                    </tr>
                  ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map(order => (
                  <tr
                    key={order.id}
                    className="group transition-colors hover:bg-[#F8FAFB]/50"
                  >
                    {visibleColumns.orderInfo && (
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#101313]">
                          {order.orderNumber}
                        </div>
                        <div className="mt-1 text-xs text-[#848785]">
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                    )}
                    {visibleColumns.customer && (
                      <td className="px-6 py-5">
                        <div className="font-medium text-[#101313]">
                          {order.user?.firstName} {order.user?.lastName}
                        </div>
                        <div className="text-xs text-[#848785]">
                          {order.user?.email}
                        </div>
                      </td>
                    )}
                    {visibleColumns.items && (
                      <td className="px-6 py-5">
                        <Badge
                          variant="outline"
                          className="border-[#E4E9E8] bg-[#F8FAFB] font-medium text-[#101313]"
                        >
                          {order.items.length}{' '}
                          {order.items.length === 1 ? 'book' : 'books'}
                        </Badge>
                      </td>
                    )}
                    {visibleColumns.amount && (
                      <td className="px-6 py-5 font-bold text-[#101313]">
                        ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-6 py-5">
                        <div
                          className="relative"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === order.id ? null : order.id
                              )
                            }
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:opacity-80 ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                            <ChevronDown className="ml-1.5 h-3 w-3" />
                          </button>

                          {openDropdownId === order.id && (
                            <div className="absolute left-0 top-full mt-2 w-44 z-50 rounded-xl border border-[#E4E9E8] bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                              {[
                                'PENDING',
                                'CONFIRMED',
                                'SHIPPED',
                                'DELIVERED',
                                'CANCELLED',
                              ].map(s => (
                                <button
                                  key={s}
                                  onClick={() => {
                                    handleUpdateStatus(order.id, s);
                                    setOpenDropdownId(null);
                                  }}
                                  disabled={
                                    updateStatus.isPending || order.status === s
                                  }
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                                    order.status === s
                                      ? 'bg-[#F8FAFB] text-[#101313]'
                                      : 'text-[#848785] hover:bg-[#F8FAFB] hover:text-[#101313]'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  {s}
                                  {order.status === s && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#0B7C6B]" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.action && (
                      <td className="px-4 py-5 text-right">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="rounded-lg bg-[#F3F5F5] p-2 text-[#848785] transition-colors hover:text-[#0B7C6B]"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#848785] font-medium bg-[#F8FAFB]/30"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingCart className="h-8 w-8 text-[#E4E9E8]" />
                      <p>No orders found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-[#E4E9E8] bg-[#F8FAFB] px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  className="h-10 w-32 appearance-none rounded-lg border border-[#E4E9E8] bg-white px-3 pr-9 text-sm text-[#101313] focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
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
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6AAA9]" />
              </div>
              <p className="text-xs md:text-sm text-[#848785]">
                <span className="hidden sm:inline">Showing </span>
                <span className="font-semibold text-[#101313]">
                  {data.meta.total === 0 ? 0 : (page - 1) * pageSize + 1}
                </span>{' '}
                -
                <span className="font-semibold text-[#101313]">
                  {Math.min(page * pageSize, data.meta.total)}
                </span>
                <span className="hidden sm:inline">
                  {' '}
                  of{' '}
                  <span className="font-semibold text-[#101313]">
                    {data.meta.total}
                  </span>
                </span>
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-[#E4E9E8]"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.meta.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-9 min-w-[36px] items-center justify-center rounded-lg bg-white px-3 text-sm font-bold text-[#101313] shadow-sm">
                {page}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-[#E4E9E8]"
                onClick={() => setPage(p => p + 1)}
                disabled={!data.meta.hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {data && (
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-[#E4E9E8]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!data.meta.hasPreviousPage}
            className="h-10 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-[#848785]">
            Page {page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!data.meta.hasNextPage}
            className="h-10 rounded-xl"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFB] p-6 border border-[#E4E9E8]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#848785]">
                  Order Status
                </p>
                <div
                  className={`mt-2 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${getStatusColor(selectedOrder.status)}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-[#848785]">
                  Total Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-[#101313]">
                  ${parseFloat(selectedOrder.totalAmount.toString()).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#101313]">
                  Customer Details
                </h3>
                <div className="space-y-3 rounded-2xl border border-[#E4E9E8] p-5">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#848785]">Name</span>
                    <span className="text-sm font-bold text-[#101313]">
                      {selectedOrder.user?.firstName}{' '}
                      {selectedOrder.user?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#848785]">Email</span>
                    <span className="text-sm font-bold text-[#101313]">
                      {selectedOrder.user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#848785]">User ID</span>
                    <span className="text-xs font-mono text-[#848785]">
                      {selectedOrder.userId}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#101313]">
                  Change Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'PENDING',
                    'CONFIRMED',
                    'SHIPPED',
                    'DELIVERED',
                    'CANCELLED',
                  ].map(s => (
                    <Button
                      key={s}
                      variant={
                        selectedOrder.status === s ? 'default' : 'outline'
                      }
                      className={`h-11 rounded-xl text-xs font-bold ${
                        selectedOrder.status === s
                          ? 'bg-[#0B7C6B] text-white shadow-lg'
                          : 'border-[#E4E9E8]'
                      }`}
                      onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                      disabled={
                        updateStatus.isPending || selectedOrder.status === s
                      }
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#101313]">
                Order Items
              </h3>
              <div className="divide-y divide-[#E4E9E8] rounded-2xl border border-[#E4E9E8] bg-white overflow-hidden">
                {selectedOrder.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 hover:bg-[#F8FAFB]/50 transition-colors"
                  >
                    <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#F3F5F5]">
                      {item.book.imageUrl ? (
                        <img
                          src={item.book.imageUrl}
                          alt={item.book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#A6AAA9]">
                          <BookOpen className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#101313] line-clamp-1">
                        {item.book.title}
                      </div>
                      <div className="text-xs text-[#848785]">
                        {item.book.author}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#101313]">
                        ${parseFloat(item.price.toString()).toFixed(2)}
                      </div>
                      <div className="text-xs text-[#848785]">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="h-12 rounded-xl border-[#E4E9E8] px-8"
                variant="outline"
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
