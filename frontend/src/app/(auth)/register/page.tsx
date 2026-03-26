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
        <RegisterForm 
          onSuccess={() => router.push('/')}
          onLoginClick={() => router.push('/login')} 
        />
      </div>
    </AuthLayout>
  );
}
