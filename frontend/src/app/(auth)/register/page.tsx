'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { AuthLayout } from '@/components/auth/auth-layout';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            Create an account
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Sign up to start your reading journey
          </p>
        </div>

        <RegisterForm 
          onSuccess={() => router.push('/')}
          onLoginClick={() => router.push('/login')} 
        />
      </div>
    </AuthLayout>
  );
}
