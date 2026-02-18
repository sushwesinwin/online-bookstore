# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack online bookstore system with Next.js 15 frontend and NestJS 10 backend. The architecture follows a monorepo pattern with separate frontend and backend packages managed by pnpm workspaces.

## Essential Commands

This project uses **pnpm** as the package manager. All commands should use `pnpm` instead of `npm`.

### Development

```bash
# Start both frontend and backend in development mode
pnpm dev

# Start individually
pnpm dev:frontend  # Next.js on port 3000
pnpm dev:backend   # NestJS on port 3001

# With Docker (includes PostgreSQL and Redis)
pnpm docker:dev
```

### Building

```bash
# Build both projects
pnpm build

# Build individually
pnpm build:frontend
pnpm build:backend
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests individually
pnpm test:frontend
pnpm test:backend

# Run with coverage
cd frontend && pnpm test:coverage
cd backend && pnpm test:cov

# Watch mode
cd frontend && pnpm test:watch
cd backend && pnpm test:watch
```

### Linting and Formatting

```bash
# Lint all
pnpm lint

# Lint individually
pnpm lint:frontend
pnpm lint:backend

# Format all
pnpm format

# Format individually
pnpm format:frontend
pnpm format:backend
```

### Database Management (Backend)

```bash
cd backend

# Generate Prisma client
pnpm db:generate

# Push schema changes to DB (dev)
pnpm db:push

# Create and run migrations
pnpm db:migrate

# Open Prisma Studio (DB GUI)
pnpm db:studio

# Seed the database
pnpm db:seed
```

## Architecture

### Frontend (Next.js 15)

**Tech Stack**: Next.js 15 App Router, React 19, TypeScript, TailwindCSS v4, shadcn/ui, TanStack Query, Zustand

**Key Patterns**:

- **App Router Structure**: Uses Next.js 15 App Router with route groups
  - `(auth)/` - Auth pages (login, register) with shared layout
  - `books/` - Book browsing and details
  - `authors/` - Author pages

- **State Management**:
  - **TanStack Query**: Server state, data fetching, caching (5min stale time, 10min garbage collection)
  - **Zustand**: Client-side state (auth, cart)
  - Configured in `src/components/providers.tsx` with optimized defaults for retry logic and refetching

- **API Client**: Centralized Axios instance in `src/lib/api/client.ts`
  - Automatic JWT token attachment via request interceptor
  - Automatic token refresh on 401 responses
  - Tokens stored in localStorage

- **API Layer**: Organized API clients in `src/lib/api/`:
  - `auth.ts` - Authentication endpoints
  - `books.ts` - Book management
  - `cart.ts` - Shopping cart
  - `orders.ts` - Order processing
  - `types.ts` - Shared TypeScript types

- **Theme System**: Dark mode support via `next-themes`
  - `theme-provider.tsx` - Theme context provider
  - `theme-toggle.tsx` - Theme switcher component

### Backend (NestJS 10)

**Tech Stack**: NestJS 10, TypeScript, Prisma ORM, PostgreSQL 16, Redis, Stripe, JWT

**Module Architecture**:

The backend follows NestJS module pattern with clear separation of concerns:

- **AuthModule** (`src/auth/`):
  - JWT + Passport authentication strategies
  - Local strategy for login, JWT strategy for protected routes
  - Email service for notifications (Nodemailer)
  - Guards: `JwtAuthGuard`, `RolesGuard`
  - DTOs in `dto/` for request validation

- **BooksModule** (`src/books/`):
  - Book CRUD operations
  - Category filtering
  - Inventory management

- **CartModule** (`src/cart/`):
  - Shopping cart management
  - Per-user cart items

- **OrdersModule** (`src/orders/`):
  - Order processing workflow
  - Stripe payment integration
  - Webhook handling for payment events (requires raw body at `/orders/webhook`)

- **PrismaModule** (`src/prisma/`):
  - Global Prisma service for database access
  - Exported and reused across all modules

**Global Configuration** (`src/main.ts`):
- **Security**: Helmet, compression, cookie-parser
- **CORS**: Configured for frontend URL
- **Validation**: Global ValidationPipe with whitelist and transform
- **Swagger**: Auto-generated API docs at `/api/docs`
- **Stripe Webhook**: Special raw body handling for webhook signature verification

**Rate Limiting**: ThrottlerModule configured in `app.module.ts` (100 req/min)

### Database Schema (Prisma)

Key models in `backend/prisma/schema.prisma`:

- **User**: Authentication, profile, role (USER/ADMIN)
- **Book**: ISBN, title, author, price, inventory, category, imageUrl
- **Order**: Order number, status (PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED), total amount
- **OrderItem**: Line items linking orders to books
- **CartItem**: User's shopping cart with unique constraint on (userId, bookId)
- **Payment**: Stripe payment tracking with status (PENDING/COMPLETED/FAILED/REFUNDED)

**Relationships**:
- User → CartItem[] (one-to-many)
- User → Order[] (one-to-many)
- Order → OrderItem[] (one-to-many)
- Order → Payment (one-to-one)
- Book → CartItem[] and OrderItem[] (one-to-many each)

### Environment Configuration

**Required Environment Variables**:

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Backend (`.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/bookstore_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
STRIPE_SECRET_KEY=sk_test_...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Docker Setup

- `docker-compose.dev.yml`: Development environment with hot reload
- `docker-compose.prod.yml`: Production build with multi-stage Docker images
- Services: PostgreSQL 16, Redis, frontend, backend
- Ports: 3000 (frontend), 3001 (backend), 5432 (postgres), 6379 (redis)

## Development Workflow

1. **Starting a new feature**:
   - Frontend changes go in `frontend/src/`
   - Backend changes typically involve module creation/modification + Prisma schema updates
   - Always run `pnpm db:generate` after schema changes

2. **API Changes**:
   - Update backend controller/service
   - Update Prisma schema if needed → `pnpm db:migrate` in backend/
   - Update frontend API client in `frontend/src/lib/api/`
   - Update TypeScript types in `frontend/src/lib/api/types.ts`

3. **Testing Strategy**:
   - Backend: Unit tests (`.spec.ts`) co-located with modules, use Jest
   - Frontend: Jest + React Testing Library
   - E2E tests: `backend/test/` directory

4. **Authentication Flow**:
   - Login returns `accessToken` and `refreshToken`
   - Tokens stored in localStorage on frontend
   - API client automatically attaches Bearer token
   - 401 responses trigger automatic refresh flow
   - Failed refresh redirects to `/login`

5. **Payment Flow**:
   - Orders module integrates with Stripe
   - Webhook endpoint at `/orders/webhook` requires raw body for signature verification
   - Payment status tracked in Payment model

## Common Patterns

- **NestJS Decorators**: Use `@UseGuards(JwtAuthGuard)` for protected routes, `@Roles()` for role-based access
- **Validation**: Use class-validator decorators in DTOs, global ValidationPipe enforces them
- **Error Handling**: NestJS built-in exception filters, return appropriate HTTP exceptions
- **Frontend Data Fetching**: Use TanStack Query hooks, defined in `src/lib/hooks/`
- **Styling**: TailwindCSS v4 with shadcn/ui components in `src/components/ui/`
