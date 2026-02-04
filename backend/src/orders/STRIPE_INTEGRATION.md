# Stripe Payment Integration

This document describes the Stripe payment integration for the Online Bookstore System.

## Overview

The payment system uses Stripe for secure payment processing. It includes:
- Payment intent creation
- Webhook handling for payment events
- Payment failure handling with cart preservation
- Secure payment processing with database integration

## Architecture

### Components

1. **PaymentService** (`payment.service.ts`)
   - Handles all Stripe API interactions
   - Manages payment records in the database
   - Processes webhook events
   - Clears cart after successful payment

2. **OrdersController** (`orders.controller.ts`)
   - Exposes payment endpoints
   - Handles webhook endpoint with raw body parsing

3. **Payment Model** (Prisma schema)
   - Stores payment records
   - Links payments to orders
   - Tracks payment status

## Payment Flow

### 1. Create Order
```
POST /orders
- User creates an order with cart items
- Order is created with PENDING status
- Inventory is validated and reserved
```

### 2. Create Payment Intent
```
POST /orders/:id/payment
- Creates a Stripe payment intent
- Returns client secret for frontend
- Creates payment record in database with PENDING status
```

### 3. Process Payment (Frontend)
```
- Frontend uses Stripe.js with client secret
- User enters payment information
- Stripe processes payment securely
```

### 4. Webhook Notification
```
POST /orders/webhook
- Stripe sends webhook event
- System verifies webhook signature
- Updates payment and order status
- Clears cart on successful payment
```

## API Endpoints

### Create Payment Intent
```http
POST /orders/:id/payment
Authorization: Bearer <token>

Response:
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Get Payment Information
```http
GET /orders/:id/payment
Authorization: Bearer <token>

Response:
{
  "id": "payment-id",
  "orderId": "order-id",
  "stripePaymentId": "pi_xxx",
  "amount": 99.99,
  "status": "COMPLETED",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Webhook Endpoint
```http
POST /orders/webhook
Stripe-Signature: <signature>

Body: Raw Stripe event payload
```

## Payment Status Flow

```
PENDING → COMPLETED (on successful payment)
        → FAILED (on payment failure)
        → REFUNDED (on refund)
```

## Order Status Flow

```
PENDING → CONFIRMED (on successful payment)
        → CANCELLED (on order cancellation)
```

## Cart Preservation

### On Payment Success
- Payment status: PENDING → COMPLETED
- Order status: PENDING → CONFIRMED
- **Cart is cleared** for the user

### On Payment Failure
- Payment status: PENDING → FAILED
- Order status: **remains PENDING**
- **Cart is preserved** - user can retry payment
- User can modify cart and create a new order

## Webhook Events Handled

1. **payment_intent.succeeded**
   - Updates payment status to COMPLETED
   - Updates order status to CONFIRMED
   - Clears user's cart

2. **payment_intent.payment_failed**
   - Updates payment status to FAILED
   - Keeps order in PENDING status
   - Preserves cart contents

3. **payment_intent.canceled**
   - Updates payment status to FAILED
   - Keeps order in PENDING status
   - Preserves cart contents

## Environment Variables

Required environment variables in `.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Getting Stripe Keys

1. **Secret Key**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Copy the "Secret key" (starts with `sk_test_` for test mode)

2. **Webhook Secret**:
   - Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
   - Create a new webhook endpoint pointing to: `https://your-domain.com/orders/webhook`
   - Add events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Copy the "Signing secret" (starts with `whsec_`)

## Security Features

### 1. Webhook Signature Verification
- All webhook events are verified using Stripe signature
- Prevents unauthorized webhook calls
- Uses raw body for signature verification

### 2. Raw Body Parsing
- Configured in `main.ts` for `/orders/webhook` endpoint
- Required for webhook signature verification
- Preserves original request body

### 3. Payment Intent Metadata
- Order ID is stored in payment intent metadata
- Links Stripe payment to internal order

### 4. Secure Payment Processing
- Payment information never touches our servers
- Stripe handles all sensitive payment data
- PCI compliance handled by Stripe

## Error Handling

### Payment Creation Errors
```typescript
try {
  const paymentIntent = await paymentService.createPaymentIntent(orderId, amount);
} catch (error) {
  // Returns BadRequestException
  // User can retry payment
}
```

### Webhook Processing Errors
```typescript
try {
  await paymentService.handleWebhookEvent(event);
} catch (error) {
  // Logged but doesn't fail webhook response
  // Stripe will retry webhook delivery
}
```

### Cart Clearing Errors
```typescript
// Cart clearing errors are logged but don't fail payment success
// Payment is still marked as successful
// User can manually clear cart if needed
```

## Testing

### Unit Tests
See `payment.service.spec.ts` for comprehensive unit tests covering:
- Payment intent creation
- Payment success handling
- Payment failure handling
- Webhook event processing
- Error scenarios

### Testing with Stripe CLI

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3001/orders/webhook
```

4. Trigger test events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

### Test Cards

Use these test card numbers in test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Expired card**: `4000 0000 0000 0069`

Any future expiry date and any 3-digit CVC will work.

## Database Schema

```prisma
model Payment {
  id              String        @id @default(cuid())
  orderId         String        @unique
  stripePaymentId String        @unique
  amount          Decimal       @db.Decimal(10, 2)
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  
  order           Order         @relation(fields: [orderId], references: [id])
  
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

## Monitoring and Logging

The payment service includes comprehensive logging:

- Payment intent creation
- Payment success/failure
- Webhook event processing
- Cart clearing operations
- Error conditions

All logs include:
- Payment intent ID
- Order ID
- User ID (where applicable)
- Timestamp
- Error details (for failures)

## Production Considerations

### 1. Switch to Live Mode
- Replace test keys with live keys
- Update webhook endpoint to production URL
- Test thoroughly in test mode first

### 2. Webhook Endpoint
- Must be publicly accessible
- Should use HTTPS
- Configure in Stripe Dashboard

### 3. Error Monitoring
- Monitor webhook delivery failures in Stripe Dashboard
- Set up alerts for payment failures
- Track cart clearing errors

### 4. Idempotency
- Webhook events may be delivered multiple times
- Payment status updates are idempotent
- Cart clearing is safe to retry

### 5. Rate Limiting
- Webhook endpoint should have appropriate rate limiting
- Consider Stripe's webhook retry behavior

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is publicly accessible
2. Verify webhook secret is correct
3. Check Stripe Dashboard for delivery attempts
4. Ensure raw body parsing is configured

### Payment Intent Creation Fails
1. Verify STRIPE_SECRET_KEY is set
2. Check Stripe API key is valid
3. Verify amount is positive
4. Check Stripe Dashboard for errors

### Cart Not Clearing
1. Check logs for cart clearing errors
2. Verify CartService is properly injected
3. Ensure user ID is correct in order
4. Cart clearing errors don't fail payment

### Payment Status Not Updating
1. Verify webhook is receiving events
2. Check webhook signature verification
3. Ensure payment record exists in database
4. Check logs for processing errors

## Future Enhancements

Potential improvements for the payment system:

1. **Refund Support**
   - Add refund endpoint
   - Handle refund webhooks
   - Update order status on refund

2. **Payment Methods**
   - Support multiple payment methods
   - Add saved payment methods
   - Implement payment method management

3. **Retry Logic**
   - Automatic retry for failed payments
   - Payment retry UI for users
   - Smart retry strategies

4. **Analytics**
   - Payment success/failure rates
   - Revenue tracking
   - Payment method analytics

5. **Notifications**
   - Email notifications for payment events
   - SMS notifications for important events
   - Real-time payment status updates

## References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
