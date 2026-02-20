'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp,
    BookOpen,
    ShoppingCart,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    MoreHorizontal
} from 'lucide-react';

export default function AdminDashboard() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Mock data for the dashboard
    const stats = [
        {
            name: 'Total Revenue',
            value: '$24,562.00',
            change: '+12.5%',
            trend: 'up',
            icon: TrendingUp,
            color: '#17BD8D'
        },
        {
            name: 'Books in Catalog',
            value: '1,284',
            change: '+24 new',
            trend: 'up',
            icon: BookOpen,
            color: '#0B7C6B'
        },
        {
            name: 'Total Orders',
            value: '456',
            change: '-2.4%',
            trend: 'down',
            icon: ShoppingCart,
            color: '#F9B959'
        },
        {
            name: 'Active Customers',
            value: '892',
            change: '+5.2%',
            trend: 'up',
            icon: Users,
            color: '#101313'
        },
    ];

    const recentOrders = [
        { id: 'ORD-20240218-A1B2', customer: 'John Doe', amount: '$124.50', status: 'Delivered', date: '2 hours ago' },
        { id: 'ORD-20240218-C3D4', customer: 'Sarah Miller', amount: '$45.00', status: 'Pending', date: '4 hours ago' },
        { id: 'ORD-20240218-E5F6', customer: 'Robert Chen', amount: '$210.20', status: 'Shipped', date: '6 hours ago' },
        { id: 'ORD-20240217-G7H8', customer: 'Emma Wilson', amount: '$89.99', status: 'Delivered', date: '1 day ago' },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#101313]">Dashboard Overview</h1>
                <p className="mt-2 text-[#848785]">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="group relative overflow-hidden rounded-2xl border border-[#E4E9E8] bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                            >
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-[#17BD8D]' : 'text-[#FF4E3E]'}`}>
                                {stat.change}
                                {stat.trend === 'up' ? <TrendingUp className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-[#848785]">{stat.name}</p>
                            <h3 className="text-2xl font-bold text-[#101313]">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Orders */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#101313]">Recent Orders</h2>
                        <button className="text-sm font-semibold text-[#0B7C6B] hover:underline">View all</button>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-[#E4E9E8] bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#E4E9E8] bg-[#F8FAFB]">
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#848785]">Order ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#848785]">Customer</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#848785]">Amount</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#848785]">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#848785]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E9E8]">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="transition-colors hover:bg-[#F8FAFB]/50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="font-medium text-[#101313]">{order.id}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="text-[#848785]">{order.customer}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-[#101313]">
                                                {order.amount}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === 'Delivered' ? 'bg-[#DFFEF5] text-[#17BD8D]' :
                                                    order.status === 'Shipped' ? 'bg-[#E4F4FF] text-[#0066FF]' :
                                                        'bg-[#FFF5E6] text-[#F9B959]'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 focus-within:relative">
                                                <button className="text-[#848785] hover:text-[#101313]">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Notifications/Tasks */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#101313]">Notifications</h2>
                    <div className="space-y-4">
                        {[
                            { title: 'Inventory Alert', desc: '5 books are low in stock', time: '10 mins ago', color: '#FF4E3E' },
                            { title: 'New Customer', desc: 'Alice Johnson joined BookStore', time: '1 hour ago', color: '#17BD8D' },
                            { title: 'Review Received', desc: 'New 5-star review for "The Hobbit"', time: '3 hours ago', color: '#F9B959' },
                            { title: 'System Update', desc: 'Database maintenance scheduled', time: '5 hours ago', color: '#101313' },
                        ].map((notif, i) => (
                            <div key={i} className="flex space-x-4 rounded-2xl border border-[#E4E9E8] bg-white p-4 shadow-sm transition-all hover:translate-x-1">
                                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: notif.color }}></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-bold text-[#101313]">{notif.title}</p>
                                    <p className="text-xs text-[#848785]">{notif.desc}</p>
                                    <div className="flex items-center pt-1 text-[10px] text-[#A6AAA9]">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {notif.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
