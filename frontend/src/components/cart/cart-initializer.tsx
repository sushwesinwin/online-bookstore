'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useCart } from '@/lib/hooks/use-cart';

/**
 * Component that automatically fetches cart data when user is authenticated
 * Should be placed in the root layout to ensure cart is loaded on app init
 */
export function CartInitializer() {
  const { isAuthenticated } = useAuth();

  // Fetch cart when authenticated
  useCart(isAuthenticated);

  return null;
}
