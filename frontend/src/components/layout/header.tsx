'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart,
  User,
  LogOut,
  Search,
  Bell,
  PenLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCartStore } from '@/lib/stores/cart-store';
import { useState, useEffect } from 'react';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Hide on admin and auth pages
  const hiddenRoutes = ['/admin', '/login', '/register', '/forgot-password', '/reset-password'];
  const isHiddenRoute = hiddenRoutes.some((route) => pathname?.startsWith(route));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isHiddenRoute) return null;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E4E9E8]">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="w-[300px]" />
          <div className="flex items-center gap-3" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E4E9E8]">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative group/search">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#848785] group-focus-within/search:text-[#0B7C6B] transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="What do you want to read?"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-[280px] sm:w-[350px] lg:w-[420px] rounded-full bg-[#F4F8F8] border-transparent focus:bg-white focus:border-[#0B7C6B]/30 focus:ring-2 focus:ring-[#0B7C6B]/20 transition-all text-sm"
          />
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Write / Sell a Book (for admins) */}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/books"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-[#848785] hover:text-[#101313] transition-colors"
                >
                  <PenLine className="h-4 w-4" />
                  <span>Write</span>
                </Link>
              )}

              {/* Notifications placeholder */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#848785] hover:text-[#101313]"
              >
                <Bell className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 text-[#848785] hover:text-[#101313]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FF6320] text-[10px] text-white flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Avatar / Profile */}
              <Link href="/profile">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-[#848785] hover:text-[#101313]"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full bg-[#0B7C6B] hover:bg-[#096B5B] text-white text-sm font-semibold px-5 shadow-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
