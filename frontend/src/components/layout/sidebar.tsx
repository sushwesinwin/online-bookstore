'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  PenTool,
  TrendingUp,
  Award,
  BookMarked,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCartStore } from '@/lib/stores/cart-store';
import { useSidebarStore } from '@/lib/stores/sidebar-store';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCartStore();
  const { isCollapsed: persistedIsCollapsed, toggleSidebar } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a default state for server-side rendering to avoid hydration mismatch
  const isCollapsed = mounted ? persistedIsCollapsed : false;

  // Hide sidebar on admin and auth routes
  const hiddenRoutes = ['/admin', '/login', '/register', '/forgot-password', '/reset-password'];
  if (hiddenRoutes.some((route) => pathname?.startsWith(route))) {
    return null;
  }

  const menuItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'All Books', icon: BookOpen, href: '/books' },
    { name: 'Trending', icon: TrendingUp, href: '/books/trending' },
    { name: 'Bestsellers', icon: Award, href: '/books/bestsellers' },
    { name: 'Authors', icon: PenTool, href: '/authors' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 hidden h-screen flex-col border-r border-[#E4E9E8] bg-white lg:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo Area */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        {!isCollapsed ? (
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] rounded-lg group-hover:scale-110 transition-transform">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-[#0B7C6B] to-[#17BD8D] bg-clip-text text-transparent">
              Bookstore
            </span>
          </Link>
        ) : (
          <Link href="/" className="flex items-center group mx-auto">
            <div className="p-2 bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] rounded-lg group-hover:scale-110 transition-transform">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 hover:bg-[#F4F8F8] ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 space-y-6">
        {/* Main Navigation */}
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : ''}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? 'bg-[#F4F8F8] text-[#0B7C6B]'
                  : 'text-[#848785] hover:bg-[#F9FCFB] hover:text-[#101313]'
                  } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#0B7C6B]' : 'text-[#848785]'
                    } ${isCollapsed ? '' : 'mr-3'}`}
                />
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Area */}
        <div className="space-y-4 pt-4 border-t border-[#E4E9E8]">
          {isAuthenticated ? (
            <div className="space-y-1">
              <Link
                href="/cart"
                title={isCollapsed ? 'Cart' : ''}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/cart'
                  ? 'bg-[#F4F8F8] text-[#0B7C6B]'
                  : 'text-[#848785] hover:bg-[#F9FCFB] hover:text-[#101313]'
                  }`}
              >
                <div
                  className={`flex items-center ${isCollapsed ? 'relative' : ''}`}
                >
                  <ShoppingCart
                    className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}
                  />
                  {!isCollapsed && 'Cart'}
                  {itemCount > 0 && isCollapsed && (
                    <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6320] text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </div>
                {itemCount > 0 && !isCollapsed && (
                  <span className="inline-flex items-center justify-center rounded-full bg-[#FF6320] px-2 py-0.5 text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link
                href="/orders"
                title={isCollapsed ? 'My Orders' : ''}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/orders'
                  ? 'bg-[#F4F8F8] text-[#0B7C6B]'
                  : 'text-[#848785] hover:bg-[#F9FCFB] hover:text-[#101313]'
                  } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <BookOpen
                  className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}
                />
                {!isCollapsed && 'My Orders'}
              </Link>

              <Link
                href="/profile"
                title={isCollapsed ? 'Profile' : ''}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/profile'
                  ? 'bg-[#F4F8F8] text-[#0B7C6B]'
                  : 'text-[#848785] hover:bg-[#F9FCFB] hover:text-[#101313]'
                  } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <User
                  className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}
                />
                {!isCollapsed && 'Profile'}
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  title={isCollapsed ? 'Admin Panel' : ''}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium text-[#848785] hover:bg-[#F9FCFB] hover:text-[#101313] transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Settings
                    className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}
                  />
                  {!isCollapsed && 'Admin Panel'}
                </Link>
              )}

              <button
                onClick={() => logout()}
                title={isCollapsed ? 'Sign Out' : ''}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-[#FF4E3E] hover:bg-[#FFECEB] transition-colors ${isCollapsed ? 'justify-center' : ''}`}
              >
                <LogOut
                  className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}
                />
                {!isCollapsed && 'Sign Out'}
              </button>
            </div>
          ) : (
            <div className={`${isCollapsed ? 'px-2' : 'px-3'} space-y-3`}>
              {!isCollapsed && (
                <p className="text-xs text-[#848785] px-1">
                  Sign in to save your progress and see recommendations.
                </p>
              )}
              <Link
                href="/login"
                title={isCollapsed ? 'Sign In' : ''}
                className={`flex w-full items-center justify-center rounded-full bg-[#0B7C6B] ${isCollapsed ? 'p-2' : 'px-4 py-2'} text-sm font-semibold text-white hover:bg-[#096B5B] transition-colors`}
              >
                {isCollapsed ? <User className="h-4 w-4" /> : 'Sign In'}
              </Link>
              {!isCollapsed && (
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-full border border-[#0B7C6B] bg-transparent px-4 py-2 text-sm font-semibold text-[#0B7C6B] hover:bg-[#F4F8F8] transition-colors"
                >
                  Create Account
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
