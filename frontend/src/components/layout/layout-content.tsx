'use client';

import { useSidebarStore } from '@/lib/stores/sidebar-store';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed: persistedIsCollapsed } = useSidebarStore(); // kept for any child dependencies, though unused here
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCollapsed = mounted ? persistedIsCollapsed : false;

  const hiddenRoutes = [
    '/admin',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];
  const isSidebarHidden = hiddenRoutes.some(route =>
    pathname?.startsWith(route)
  );

  return (
    <div className="flex-1 w-full transition-all duration-300">
      {children}
    </div>
  );
}
