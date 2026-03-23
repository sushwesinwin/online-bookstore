'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            Welcome back
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Login to access your account
          </p>
        </div>

        <LoginForm 
          onSuccess={() => router.push('/')}
          onRegisterClick={() => router.push('/register')} 
        />
      </div>
    </AuthLayout>
  );
}
