'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrder, useCancelOrder } from '@/lib/hooks/use-orders';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
    Package,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    MapPin,
    CreditCard,
    Receipt,
    Download,
    AlertCircle,
    Calendar,
    Hash
} from 'lucide-react';

const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
    CONFIRMED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
    SHIPPED: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck, label: 'Shipped' },
    DELIVERED: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Delivered' },
    CANCELLED: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: order, isLoading, error } = useOrder(id as string);
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

    const handleCancelOrder = () => {
        if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            cancelOrder(id as string, {
                onSuccess: () => {
                    toast.success('Order cancelled successfully');
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'Failed to cancel order');
                }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9FCFB]">
                <Header />
                <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B7C6B]"></div>
                    <p className="mt-4 text-[#848785]">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#F9FCFB]">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#101313] mb-4">Order Not Found</h1>
                    <p className="text-[#848785] mb-8 max-w-md mx-auto">
                        Sorry, we couldn't find the order you're looking for. It may have been deleted or the link is invalid.
                    </p>
                    <Link href="/orders">
                        <Button className="bg-[#0B7C6B] hover:bg-[#0D8F7A]">
                            Back to My Orders
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-[#F9FCFB]">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumbs / Back Button */}
                    <div className="mb-8">
                        <Link href="/orders" className="inline-flex items-center text-sm font-semibold text-[#848785] hover:text-[#0B7C6B] transition-colors group">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to My Orders
                        </Link>
                    </div>

                    {/* Header Info */}
                    <div className="bg-white rounded-3xl border border-[#E4E9E8] shadow-sm overflow-hidden mb-8">
                        <div className="p-8 border-b border-[#E4E9E8] flex flex-wrap items-center justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-[#101313]">Order {order.orderNumber}</h1>
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${status.color}`}>
                                        <StatusIcon className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{status.label}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-[#848785]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Placed on {formatDate(order.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4" />
                                        Order ID: {order.id}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="h-11 shadow-sm font-semibold">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Invoice
                                </Button>
                                {order.status === 'PENDING' && (
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelOrder}
                                        disabled={isCancelling}
                                        className="h-11 border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Order Progress / Status Timeline (Simplified for Detail) */}
                        <div className="bg-[#F4F8F8]/50 p-8 border-b border-[#E4E9E8]">
                            <div className="grid md:grid-cols-4 gap-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${order.status !== 'CANCELLED' ? 'bg-[#0B7C6B] text-white shadow-lg' : 'bg-red-100 text-red-600'}`}>
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-[#848785] uppercase tracking-wider">Placed</div>
                                        <div className="font-semibold text-[#101313]">{formatDate(order.createdAt)}</div>
                                    </div>
                                </div>
                                {(order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#0B7C6B] text-white flex items-center justify-center shrink-0 shadow-lg">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#848785] uppercase tracking-wider">Confirmed</div>
                                            <div className="font-semibold text-[#101313]">Ready for Shipment</div>
                                        </div>
                                    </div>
                                )}
                                {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#0B7C6B] text-white flex items-center justify-center shrink-0 shadow-lg">
                                            <Truck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#848785] uppercase tracking-wider">Shipped</div>
                                            <div className="font-semibold text-[#101313]">On its way</div>
                                        </div>
                                    </div>
                                )}
                                {order.status === 'DELIVERED' && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#0B7C6B] text-white flex items-center justify-center shrink-0 shadow-lg">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#848785] uppercase tracking-wider">Delivered</div>
                                            <div className="font-semibold text-[#101313]">Package Received</div>
                                        </div>
                                    </div>
                                )}
                                {order.status === 'CANCELLED' && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                                            <XCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#848785] uppercase tracking-wider">Cancelled</div>
                                            <div className="font-semibold text-[#101313]">Order Voided</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Grid (Items + Summary) */}
                        <div className="grid lg:grid-cols-3">
                            <div className="lg:col-span-2 p-8 border-r border-[#E4E9E8]">
                                <h3 className="text-lg font-bold text-[#101313] mb-6 flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-[#0B7C6B]" />
                                    Order Items
                                </h3>
                                <div className="space-y-6">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-6 pb-6 border-b border-[#F4F8F8] last:border-0 last:pb-0">
                                            <div className="w-24 h-32 bg-[#F4F8F8] rounded-xl overflow-hidden border border-[#E4E9E8] flex-shrink-0 shadow-sm">
                                                {item.book.imageUrl ? (
                                                    <img
                                                        src={item.book.imageUrl}
                                                        alt={item.book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#848785]">
                                                        <Package className="h-8 w-8 opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Link href={`/books/${item.book.id}`} className="inline-block">
                                                    <h4 className="font-bold text-[#101313] text-lg hover:text-[#0B7C6B] transition-colors leading-tight">
                                                        {item.book.title}
                                                    </h4>
                                                </Link>
                                                <p className="text-sm text-[#848785] font-medium">by {item.book.author}</p>
                                                <div className="flex items-center gap-4 pt-2">
                                                    <Badge variant="secondary" className="bg-[#F4F8F8] text-[#101313] border-none">
                                                        Qty: {item.quantity}
                                                    </Badge>
                                                    <span className="text-sm font-bold text-[#0B7C6B]">
                                                        {formatPrice(item.price)} each
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col justify-center">
                                                <div className="text-lg font-bold text-[#101313]">
                                                    {formatPrice(item.price * item.quantity)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#F4F8F8]/30 p-8 space-y-8">
                                {/* Summary */}
                                <div>
                                    <h3 className="text-lg font-bold text-[#101313] mb-6">Payment Summary</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[#848785]">
                                            <span>Subtotal</span>
                                            <span className="font-semibold text-[#101313]">{formatPrice(order.totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-[#848785]">
                                            <span>Shipping</span>
                                            <span className="font-bold text-green-600">FREE</span>
                                        </div>
                                        <div className="flex justify-between text-[#848785]">
                                            <span>Tax</span>
                                            <span className="font-semibold text-[#101313]">{formatPrice(0)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-[#E4E9E8] flex justify-between items-center">
                                            <span className="text-lg font-bold text-[#101313]">Total</span>
                                            <span className="text-2xl font-bold text-[#0B7C6B]">{formatPrice(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Cards */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl p-6 border border-[#E4E9E8] shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 text-[#0B7C6B] font-bold text-sm uppercase tracking-wider">
                                            <MapPin className="h-4 w-4" />
                                            Shipping Address
                                        </div>
                                        <div className="text-sm text-[#848785] leading-relaxed">
                                            <div className="font-bold text-[#101313] mb-1">
                                                {order.user?.firstName} {order.user?.lastName}
                                            </div>
                                            123 Bookworm Lane<br />
                                            Library District<br />
                                            Reading City, 54321
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 border border-[#E4E9E8] shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 text-[#0B7C6B] font-bold text-sm uppercase tracking-wider">
                                            <CreditCard className="h-4 w-4" />
                                            Payment Method
                                        </div>
                                        <div className="text-sm text-[#101313] flex items-center gap-3">
                                            <div className="w-10 h-6 bg-linear-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center text-[8px] text-white font-bold">
                                                VISA
                                            </div>
                                            <span className="font-medium">•••• 4242</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Box */}
                    <div className="bg-[#E4FFFB] rounded-2xl p-6 flex items-center justify-between gap-6 border border-[#0B7C6B]/10">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm">
                                <AlertCircle className="h-6 w-6 text-[#0B7C6B]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#101313]">Need help with your order?</h4>
                                <p className="text-sm text-[#848785]">Our support team is available 24/7 to assist you.</p>
                            </div>
                        </div>
                        <Button className="bg-[#0B7C6B] hover:bg-[#0D8F7A] shadow-md font-semibold">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
