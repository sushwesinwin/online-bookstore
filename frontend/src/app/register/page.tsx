'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/lib/stores/auth-modal-store';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    useAuthModalStore
      .getState()
      .openModal('register', 'Create an account to continue');
    router.replace('/');
  }, [router]);

  return null;
}
