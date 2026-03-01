'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  BookMarked,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Books Catalog', icon: BookOpen, href: '/admin/books' },
    { name: 'Order Management', icon: ShoppingCart, href: '/admin/orders' },
    { name: 'User Management', icon: Users, href: '/admin/users' },
    { name: 'Store Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="flex min-h-screen bg-[#F8FAFB]">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E4E9E8] lg:hidden">
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] rounded-lg">
                <BookMarked className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-[#101313]">
                BookStore
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-[#F3F5F5] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-[#101313]" />
              ) : (
                <Menu className="h-6 w-6 text-[#101313]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <aside
              className="fixed left-0 top-0 h-screen w-72 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full flex-col pt-20">
                <div className="flex-1 px-4 space-y-8">
                  <div>
                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-[#A6AAA9] mb-4">
                      Management
                    </p>
                    <nav className="space-y-1.5">
                      {menuItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                              isActive
                                ? 'bg-[#0B7C6B] text-white shadow-lg shadow-[#0B7C6B]/20'
                                : 'text-[#848785] hover:bg-[#F3F5F5] hover:text-[#101313]'
                            }`}
                          >
                            <div className="flex items-center">
                              <item.icon
                                className={`mr-3 h-5 w-5 transition-colors ${
                                  isActive ? 'text-white' : 'text-[#848785] group-hover:text-[#101313]'
                                }`}
                              />
                              {item.name}
                            </div>
                            {isActive && (
                              <ChevronRight className="h-4 w-4 text-white/70" />
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>

                <div className="p-4 mt-auto">
                  <div className="bg-[#F8FAFB] rounded-3xl p-4 mb-4 border border-[#E4E9E8]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] flex items-center justify-center text-white font-bold text-sm">
                        {user?.firstName?.charAt(0) || 'A'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-[#101313] truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[10px] text-[#848785] truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center justify-center rounded-2xl bg-white border border-[#E4E9E8] px-4 py-3 text-sm font-bold text-[#FF4E3E] transition-all hover:bg-[#FFECEB] hover:border-[#FF4E3E]/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout Session
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-[#E4E9E8] bg-white lg:block shadow-sm">
          <div className="flex h-full flex-col">
            <div className="p-8">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="p-2.5 bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-[#0B7C6B]/20">
                  <BookMarked className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-[#101313]">
                    BookStore
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#17BD8D] bg-[#DFFEF5] px-2 py-0.5 rounded-full w-fit mt-0.5">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex-1 px-4 space-y-8">
              <div>
                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-[#A6AAA9] mb-4">
                  Management
                </p>
                <nav className="space-y-1.5">
                  {menuItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${isActive
                            ? 'bg-[#0B7C6B] text-white shadow-lg shadow-[#0B7C6B]/20'
                            : 'text-[#848785] hover:bg-[#F3F5F5] hover:text-[#101313]'
                          }`}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-[#848785] group-hover:text-[#101313]'}`}
                          />
                          {item.name}
                        </div>
                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-white/70 animate-in fade-in slide-in-from-left-2" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="p-4 mt-auto">
              <div className="bg-[#F8FAFB] rounded-3xl p-4 mb-4 border border-[#E4E9E8]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] flex items-center justify-center text-white font-bold text-sm">
                    {user?.firstName?.charAt(0) || 'A'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold text-[#101313] truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] text-[#848785] truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="flex w-full items-center justify-center rounded-2xl bg-white border border-[#E4E9E8] px-4 py-3 text-sm font-bold text-[#FF4E3E] transition-all hover:bg-[#FFECEB] hover:border-[#FF4E3E]/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout Session
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-72 min-h-screen pt-16 lg:pt-0">
          <div className="p-6 lg:p-14 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
