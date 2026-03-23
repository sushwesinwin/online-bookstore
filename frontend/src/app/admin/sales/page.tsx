'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useOrders } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function AdminSales() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'>(
    'DELIVERED'
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'totalAmount' | 'orderNumber'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    saleRefDate: true,
    customer: true,
    items: true,
    status: true,
    amount: true,
    action: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch only DELIVERED orders for the sales page
  const { data, isLoading } = useOrders({
    page,
    limit,
    search: search || undefined,
    status: status === 'ALL' ? undefined : status,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
  });

  const pageSize = useMemo(() => data?.meta?.limit ?? limit, [data?.meta?.limit, limit]);

  if (!mounted) return null;

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Extract totals for summary metrics
  const totalSalesCount = data?.meta?.total || 0;

  const handleSort = (
    column: 'createdAt' | 'updatedAt' | 'totalAmount' | 'orderNumber'
  ) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const renderSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return <ArrowUpDown className="h-3.5 w-3.5 text-[#A6AAA9]" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-[#0B7C6B]" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-[#0B7C6B]" />
    );
  };

  const resetFilters = () => {
    setStatus('DELIVERED');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setLimit(10);
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#101313] flex items-center gap-3">
            <div className="p-2.5 bg-[#E4FFFB] rounded-xl">
              <TrendingUp className="h-7 w-7 text-[#0B7C6B]" />
            </div>
            Completed Sales
          </h1>
          <p className="mt-2 text-[#848785]">
            View and manage all delivered orders and completed sales.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-[#E4E9E8]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Sales
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-[#848785]" />
            <Input
              placeholder="Search sales by order number or customer..."
              className="h-12 md:h-14 rounded-xl md:rounded-2xl border-[#E4E9E8] bg-white pl-10 md:pl-12 pr-4 text-sm md:text-base"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center justify-center rounded-xl md:rounded-2xl bg-[#DFFEF5] border-2 border-[#17BD8D]/20 px-6 h-12 md:h-14 shadow-sm text-[#17BD8D] font-bold text-sm">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {totalSalesCount} {status === 'DELIVERED' ? 'Delivered ' : ''}
            {totalSalesCount === 1 ? 'Order' : 'Orders'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#848785]">Status</span>
            <select
              className="h-12 rounded-xl border border-[#E4E9E8] bg-white px-3 text-sm text-[#101313] focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
              value={status}
              onChange={e => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="ALL">All</option>
              <option value="DELIVERED">Delivered</option>
              <option value="SHIPPED">Shipped</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#848785]">Sort</span>
            <div className="relative">
              <select
                className="h-12 w-full appearance-none rounded-xl border border-[#E4E9E8] bg-white px-3 pr-10 text-sm text-[#101313] focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
                value={`${sortBy}:${sortOrder}`}
                onChange={e => {
                  const [by, order] = e.target.value.split(':');
                  setSortBy(by as any);
                  setSortOrder(order as any);
                  setPage(1);
                }}
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="totalAmount:desc">Amount high → low</option>
                <option value="totalAmount:asc">Amount low → high</option>
                <option value="orderNumber:asc">Order # A → Z</option>
                <option value="orderNumber:desc">Order # Z → A</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6AAA9]" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#848785]">From date</span>
            <Input
              type="date"
              className="h-12 rounded-xl border-[#E4E9E8]"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#848785]">To date</span>
            <Input
              type="date"
              className="h-12 rounded-xl border-[#E4E9E8]"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#848785]">Columns</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnsOpen(o => !o)}
                className="h-12 w-full rounded-xl border border-[#E4E9E8] bg-white px-3 pr-10 text-sm text-[#101313] text-left focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
              >
                Choose columns
              </button>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6AAA9]" />
              {isColumnsOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#E4E9E8] bg-white shadow-lg p-2">
                  {[
                    { key: 'saleRefDate', label: 'Sale Ref / Date' },
                    { key: 'customer', label: 'Customer' },
                    { key: 'items', label: 'Items' },
                    { key: 'status', label: 'Status' },
                    { key: 'amount', label: 'Amount' },
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

        <div className="flex items-center gap-3 text-sm text-[#848785]">
          <span>Custom date search filters orders server-side.</span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[#0B7C6B] font-semibold hover:underline"
          >
            Reset
          </button>
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
                  <div className="h-6 w-24 bg-[#F3F5F5] rounded-full" />
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
                <div className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold bg-[#DFFEF5] text-[#17BD8D] border-[#17BD8D]/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {order.status}
                </div>
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
                <div className="flex justify-between items-center rounded-lg bg-[#F8FAFB] p-2 mt-2">
                  <span className="text-[#848785] font-medium">Sale Total</span>
                  <span className="font-black text-lg text-[#0B7C6B]">
                    ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleViewOrder(order)}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#F3F5F5] px-4 py-2.5 text-sm font-bold text-[#101313] transition-colors hover:bg-[#E4E9E8]"
              >
                <Eye className="h-4 w-4" /> View Details
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-[#E4E9E8] p-8 text-center flex flex-col items-center">
            <TrendingUp className="h-12 w-12 text-[#E4E9E8] mb-3" />
            <p className="font-bold text-[#101313]">No sales found</p>
            <p className="text-[#848785] text-sm mt-1">
              There are no delivered orders matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-3xl border border-[#E4E9E8] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E4E9E8] bg-[#F8FAFB]">
                {visibleColumns.saleRefDate && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    <button
                      type="button"
                      onClick={() => handleSort('createdAt')}
                      className="inline-flex items-center gap-2 font-semibold text-[#848785] hover:text-[#0B7C6B]"
                    >
                      Sale Ref / Date
                      {renderSortIcon('createdAt')}
                    </button>
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
                {visibleColumns.status && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Status
                  </th>
                )}
                {visibleColumns.amount && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    <button
                      type="button"
                      onClick={() => handleSort('totalAmount')}
                      className="inline-flex items-center gap-2 font-semibold text-[#848785] hover:text-[#0B7C6B]"
                    >
                      Amount
                      {renderSortIcon('totalAmount')}
                    </button>
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
                    {visibleColumns.saleRefDate && (
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
                    {visibleColumns.status && (
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold bg-[#DFFEF5] text-[#17BD8D] border-[#17BD8D]/20">
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          {order.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.amount && (
                      <td className="px-6 py-5 font-black text-[#0B7C6B]">
                        ${parseFloat(order.totalAmount.toString()).toFixed(2)}
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
                      <TrendingUp className="h-8 w-8 text-[#E4E9E8]" />
                      <p>No completed sales found matching your search.</p>
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
        title={`Sale Details: ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFB] p-6 border border-[#E4E9E8]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#848785]">
                  Status
                </p>
                <div className="mt-2 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold bg-[#DFFEF5] text-[#17BD8D] border-[#17BD8D]/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {selectedOrder.status}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-[#848785]">
                  Total Received
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0B7C6B]">
                  ${parseFloat(selectedOrder.totalAmount.toString()).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#101313]">
                  Customer Details
                </h3>
                <div className="space-y-3 rounded-2xl border border-[#E4E9E8] p-5 h-[120px]">
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
                  Order Context
                </h3>
                <div className="space-y-3 rounded-2xl border border-[#E4E9E8] p-5 h-[120px]">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#848785]">Placed On</span>
                    <span className="text-sm font-bold text-[#101313]">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#848785]">Total Items</span>
                    <span className="text-sm font-bold text-[#101313]">
                      {selectedOrder.items.reduce(
                        (acc: number, item: any) => acc + item.quantity,
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#848785]">
                      Checkout Type
                    </span>
                    <span className="text-sm font-bold text-[#101313]">
                      Stripe Standard
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#101313]">
                Items Sold
              </h3>
              <div className="divide-y divide-[#E4E9E8] rounded-2xl border border-[#E4E9E8] bg-white overflow-hidden max-h-[300px] overflow-y-auto w-full">
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

            <div className="flex justify-between pt-4 gap-3">
              <Button
                onClick={() => window.print()}
                className="h-12 rounded-xl text-[#848785] px-6 shadow-sm border border-[#E4E9E8] bg-white hover:bg-[#F8FAFB] transition-colors"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button
                onClick={() => setIsModalOpen(false)}
                className="h-12 rounded-xl border-[#E4E9E8] px-8 bg-[#101313] text-white hover:bg-black"
                variant="outline"
              >
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
