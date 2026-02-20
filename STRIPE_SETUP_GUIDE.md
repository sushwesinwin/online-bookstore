# Stripe Setup Guide

This guide describes how to complete the Stripe API setup for your Online Bookstore.

## 1. Get Your Stripe Keys

1. Sign in to your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
2. Ensure you are in **Test Mode** (toggle in the top right).
3. Copy your **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`).

## 2. Configure Environment Variables

Update your `.env` files with your keys.

### Root `.env` (or Frontend `.env`)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### Backend `.env`
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 3. Setup Webhooks (Local Development)

To receive payment confirmations locally, use the Stripe CLI.

1. **Install Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Listen for Webhooks**:
   ```bash
   stripe listen --forward-to localhost:3001/orders/webhook
   ```
   *Note: This command will output a webhook signing secret starting with `whsec_...`. Copy this to your backend `.env` as `STRIPE_WEBHOOK_SECRET`.*

4. **Trigger Test Events** (in another terminal):
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## 4. Implementation Details

### Frontend
- **StripeProvider**: Wrapped in `src/components/providers.tsx`.
- **Hosted Checkout**: The `CartPage` redirects to Stripe's hosted checkout page.
- **Custom Checkout**: A `CheckoutForm` component is available in `src/components/cart/checkout-form.tsx` if you want to implement an embedded checkout experience.

### Backend
- **PaymentService**: Handles all Stripe logic (`backend/src/orders/payment.service.ts`).
- **Webhook Endpoint**: `/orders/webhook` is configured to handle raw body signatures.

## 5. Testing the Flow

1. Add items to your cart.
2. Click "Proceed to Checkout".
3. Use test card: `4242 4242 4242 4242` with any future expiry and any CVC.
4. Verify you are redirected to the success page.
5. Check your email (if Mailtrap is configured) for the order confirmation.
