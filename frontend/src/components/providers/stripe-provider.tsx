'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode, useMemo } from 'react';

// Initialize Stripe outside of the component to avoid multiple instances
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface StripeProviderProps {
    children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
    // If no public key is provided, we can still render the children
    // but Stripe Elements will not work.
    if (!stripePublicKey) {
        console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured. Stripe integration will not work.');
        return <>{children}</>;
    }

    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
}
