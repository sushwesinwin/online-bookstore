'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Books', icon: BookOpen, href: '/admin/books' },
        { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
        { name: 'Users', icon: Users, href: '/admin/users' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <div className="flex min-h-screen bg-[#F8FAFB]">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-[#E4E9E8] bg-white lg:block">
                    <div className="flex h-full flex-col">
                        <div className="p-8">
                            <Link href="/" className="flex items-center space-x-2">
                                <span className="text-2xl">📚</span>
                                <span className="text-xl font-bold tracking-tight text-[#101313]">BookStore</span>
                                <span className="rounded bg-[#DFFEF5] px-2 py-0.5 text-[10px] font-bold text-[#17BD8D]">ADMIN</span>
                            </Link>
                        </div>

                        <nav className="flex-1 space-y-1 px-4">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-[#0B7C6B] text-white'
                                                : 'text-[#848785] hover:bg-[#F3F5F5] hover:text-[#101313]'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-[#848785] group-hover:text-[#101313]'}`} />
                                            {item.name}
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="border-t border-[#E4E9E8] p-4">
                            <button
                                onClick={() => logout()}
                                className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-[#FF4E3E] transition-all hover:bg-[#FFECEB]"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:pl-72">
                    <div className="min-h-screen p-8 lg:p-12">
                        {children}
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
