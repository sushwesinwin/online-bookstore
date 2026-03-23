'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const hiddenRoutes = ['/admin'];
  const isHiddenRoute = hiddenRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isHiddenRoute) return null;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-transparent h-16 sm:h-20" />
    );
  }

  const navLinks = [
    { name: 'Books', href: '/books' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Authors', href: '/authors' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-2xl border-b border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-2'
          : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 relative">

          {/* Left: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                    isActive ? 'bg-gray-100 text-black' : 'text-gray-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Center: Brand Name (absolute centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="flex items-center group">
              <span className="font-semibold tracking-tight text-xl text-black hover:opacity-70 transition-opacity">Lumora</span>
            </Link>
          </div>

          {/* Right: Cart & Sign Up */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="group relative h-10 w-10 shrink-0 text-gray-500 hover:text-black hover:bg-black/5 rounded-full transition-all duration-300">
                <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-[10px] text-white flex items-center justify-center font-black ring-2 ring-white shadow-md transform group-hover:scale-110 transition-transform duration-300">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-black hover:bg-gray-800 text-white text-sm font-light px-6 sm:px-8 py-5 shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-300">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
