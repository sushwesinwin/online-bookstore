'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/lib/stores/auth-modal-store';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    useAuthModalStore
      .getState()
      .openModal('login', 'Please sign in to continue');
    router.replace('/');
  }, [router]);

  return null;
}
