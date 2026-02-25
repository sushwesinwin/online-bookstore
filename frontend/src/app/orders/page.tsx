'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyOrders } from '@/lib/hooks/use-orders';
import { formatPrice, formatDate } from '@/lib/utils';
import {
    Package,
    ChevronRight,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ShoppingBag,
    ArrowRight
} from 'lucide-react';

const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
    CONFIRMED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
    SHIPPED: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck, label: 'Shipped' },
    DELIVERED: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Delivered' },
    CANCELLED: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
};

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const { data: ordersData, isLoading } = useMyOrders({
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const orders = ordersData?.data || [];
    const meta = ordersData?.meta;

    return (
        <div className="min-h-screen bg-[#F9FCFB]">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-[#101313] mb-2">My Orders</h1>
                            <p className="text-[#848785]">Track and manage your book purchases</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#848785]" />
                                <input
                                    type="text"
                                    placeholder="Order number..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#E4E9E8] rounded-lg outline-none focus:ring-2 focus:ring-[#0B7C6B]/20 transition-all text-sm"
                                />
                            </div>
                            <Button variant="outline" size="sm" className="h-10">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-[#E4E9E8] p-6 animate-pulse">
                                    <div className="flex justify-between mb-6">
                                        <div className="h-6 bg-[#F4F8F8] rounded w-48"></div>
                                        <div className="h-6 bg-[#F4F8F8] rounded w-24"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-20 bg-[#F4F8F8] rounded-xl"></div>
                                        <div className="h-20 bg-[#F4F8F8] rounded-xl"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-[#E4E9E8] p-20 text-center shadow-sm">
                            <div className="w-24 h-24 bg-[#E4FFFB] rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="h-12 w-12 text-[#0B7C6B]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#101313] mb-3">No orders yet</h2>
                            <p className="text-[#848785] mb-8 max-w-sm mx-auto">
                                You haven't made any purchases yet. Your future orders will appear here.
                            </p>
                            <Link href="/books">
                                <Button size="lg" className="bg-[#0B7C6B] hover:bg-[#0D8F7A] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                                    Browse Books
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
                                const StatusIcon = status.icon;

                                return (
                                    <div
                                        key={order.id}
                                        className="group bg-white rounded-2xl border border-[#E4E9E8] hover:border-[#0B7C6B]/50 transition-all hover:shadow-xl overflow-hidden"
                                    >
                                        {/* Order Header */}
                                        <div className="bg-[#F4F8F8]/50 p-6 border-b border-[#E4E9E8] flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white rounded-xl border border-[#E4E9E8] shadow-sm">
                                                    <Package className="h-6 w-6 text-[#0B7C6B]" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-[#848785] font-medium">Order Number</div>
                                                    <div className="font-bold text-[#101313] tracking-wide">{order.orderNumber}</div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="text-right">
                                                    <div className="text-sm text-[#848785] font-medium">Date Placed</div>
                                                    <div className="font-semibold text-[#101313]">{formatDate(order.createdAt)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-[#848785] font-medium">Total Amount</div>
                                                    <div className="font-bold text-[#0B7C6B] text-lg">{formatPrice(order.totalAmount)}</div>
                                                </div>
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status.color}`}>
                                                    <StatusIcon className="h-4 w-4" />
                                                    <span className="text-sm font-bold uppercase tracking-wider">{status.label}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Preview Items */}
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {order.items.slice(0, 2).map((item) => (
                                                    <div key={item.id} className="flex items-center gap-4">
                                                        <div className="w-16 h-20 bg-[#F4F8F8] rounded-lg overflow-hidden border border-[#E4E9E8] flex-shrink-0">
                                                            {item.book.imageUrl ? (
                                                                <img
                                                                    src={item.book.imageUrl}
                                                                    alt={item.book.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[#848785]">
                                                                    <Package className="h-6 w-6 opacity-20" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-[#101313] line-clamp-1 group-hover:text-[#0B7C6B] transition-colors">
                                                                {item.book.title}
                                                            </h4>
                                                            <p className="text-sm text-[#848785]">by {item.book.author} • {item.quantity} copy</p>
                                                        </div>
                                                        <div className="text-right font-medium text-[#101313]">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </div>
                                                    </div>
                                                ))}

                                                {order.items.length > 2 && (
                                                    <p className="text-sm text-[#0B7C6B] font-semibold pl-20">
                                                        + {order.items.length - 2} more items
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-8 flex items-center justify-between border-t border-[#E4E9E8] pt-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-[#848785]">Tracking Number:</span>
                                                    <span className="text-sm font-mono font-medium text-[#101313]">
                                                        {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'TRK-98231012' : 'Not available yet'}
                                                    </span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Link href={`/orders/${order.id}`}>
                                                        <Button variant="outline" className="h-11 px-6 shadow-sm hover:bg-[#F4F8F8] font-semibold">
                                                            Order Details
                                                            <ChevronRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {order.status === 'DELIVERED' && (
                                                        <Button className="bg-[#FF6320] hover:bg-[#FF4E3E] h-11 px-6 shadow-xl hover:shadow-2xl transition-all font-semibold">
                                                            Buy Again
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Pagination */}
                            {meta && meta.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-8">
                                    <Button
                                        variant="outline"
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    {[...Array(meta.totalPages)].map((_, i) => (
                                        <Button
                                            key={i}
                                            variant={page === i + 1 ? 'default' : 'outline'}
                                            onClick={() => setPage(i + 1)}
                                            className={page === i + 1 ? 'bg-[#0B7C6B]' : ''}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        disabled={page === meta.totalPages}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
