'use client';

import { useSidebarStore } from '@/lib/stores/sidebar-store';
import { useState, useEffect } from 'react';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed: persistedIsCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCollapsed = mounted ? persistedIsCollapsed : false;

  return (
    <div
      className={`flex-1 w-full transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
    >
      {children}
    </div>
  );
}
