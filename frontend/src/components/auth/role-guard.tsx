'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { User } from '@/lib/api/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Give a brief moment for auth state to settle after navigation
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        router.push('/');
        return;
      }

      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [mounted, isAuthenticated, user, allowedRoles, router]);

  if (
    !mounted ||
    isChecking ||
    !isAuthenticated ||
    !user ||
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B7C6B] border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
