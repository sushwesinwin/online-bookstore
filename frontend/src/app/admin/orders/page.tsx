'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function AdminOrders() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useOrders({
    page,
    limit: 10,
    search,
    status: statusFilter as any,
  });

  const updateStatus = useUpdateOrderStatus();

  if (!mounted) return null;

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
          <Button
            variant="outline"
            className="h-12 rounded-xl border-[#E4E9E8]"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Export
          </Button>
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#848785]" />
          <Input
            placeholder="Search by order number or customer..."
            className="h-14 rounded-2xl border-[#E4E9E8] bg-white pl-12 pr-4 text-base"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center rounded-2xl border border-[#E4E9E8] bg-white p-1 shadow-sm">
            {[
              '',
              'PENDING',
              'CONFIRMED',
              'SHIPPED',
              'DELIVERED',
              'CANCELLED',
            ].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${statusFilter === status
                    ? 'bg-[#0B7C6B] text-white shadow-md'
                    : 'text-[#848785] hover:bg-[#F3F5F5] hover:text-[#101313]'
                  }`}
              >
                {status || 'ALL'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-[#E4E9E8] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E4E9E8] bg-[#F8FAFB]">
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Order Info
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Customer
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Items
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Amount
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Status
                </th>
                <th className="px-4 py-5 text-right text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9E8]">
              {isLoading
                ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="h-4 w-full rounded bg-[#F3F5F5]"></div>
                      </td>
                    </tr>
                  ))
                : data?.data.map(order => (
                  <tr
                    key={order.id}
                    className="group transition-colors hover:bg-[#F8FAFB]/50"
                  >
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
                    <td className="px-6 py-5">
                      <div className="font-medium text-[#101313]">
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                      <div className="text-xs text-[#848785]">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        variant="outline"
                        className="border-[#E4E9E8] bg-[#F8FAFB] font-medium text-[#101313]"
                      >
                        {order.items.length}{' '}
                        {order.items.length === 1 ? 'book' : 'books'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 font-bold text-[#101313]">
                      ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                    </td>
                    <td className="px-6 py-5">
                      <div
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="rounded-lg bg-[#F3F5F5] p-2 text-[#848785] transition-colors hover:text-[#0B7C6B]"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E4E9E8] bg-[#F8FAFB] px-6 py-4">
            <p className="text-sm text-[#848785]">
              Showing{' '}
              <span className="font-semibold text-[#101313]">
                {(page - 1) * 10 + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-[#101313]">
                {Math.min(page * 10, data.meta.total)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-[#101313]">
                {data.meta.total}
              </span>{' '}
              orders
            </p>
            <div className="flex items-center space-x-2">
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

            <div className="grid gap-8 md:grid-cols-2">
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
                <div className="grid grid-cols-2 gap-3">
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
                      className={`h-11 rounded-xl text-xs font-bold ${selectedOrder.status === s
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
