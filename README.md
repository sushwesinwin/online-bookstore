# Online Bookstore System

A comprehensive online bookstore system built with Next.js 15 frontend and NestJS 10 backend, featuring modern UI components, secure authentication, payment processing, and containerized deployment.

## 🚀 Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **TailwindCSS v4** for styling
- **shadcn/ui** component library
- **Stripe** for payment processing
- **React Query** for state management
- **Zustand** for client state

### Backend
- **NestJS 10** with TypeScript
- **PostgreSQL 16** database
- **Prisma ORM 5.x** for database management
- **JWT** authentication
- **Redis** for caching
- **Stripe** payment integration
- **Nodemailer** for email services

### Infrastructure
- **Docker** containerization
- **GitHub Actions** CI/CD
- **Multi-stage** Docker builds
- **Health checks** and monitoring

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 16 (if running locally)
- Redis (if running locally)

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd online-bookstore-system
```

### 2. Environment Configuration

```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit the .env files with your configuration
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 4. Development with Docker (Recommended)

```bash
# Start all services with Docker Compose
npm run docker:dev

# Or start individual services
docker-compose -f docker-compose.dev.yml up postgres redis
npm run dev
```

### 5. Local Development (Alternative)

```bash
# Start PostgreSQL and Redis locally
# Then run both frontend and backend
npm run dev

# Or run individually
npm run dev:frontend
npm run dev:backend
```

## 🐳 Docker Commands

```bash
# Development environment
npm run docker:dev

# Production environment
npm run docker:prod

# Stop all containers
npm run docker:down

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend

# Run tests with coverage
cd frontend && npm run test:coverage
cd backend && npm run test:cov
```

## 🔧 Development Scripts

```bash
# Linting
npm run lint              # Lint all projects
npm run lint:frontend     # Lint frontend only
npm run lint:backend      # Lint backend only

# Formatting
npm run format            # Format all projects
npm run format:frontend   # Format frontend only
npm run format:backend    # Format backend only

# Building
npm run build             # Build all projects
npm run build:frontend    # Build frontend only
npm run build:backend     # Build backend only
```

## 📁 Project Structure

```
online-bookstore-system/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js 15 App Router
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── books/          # Book management module
│   │   ├── orders/         # Order processing module
│   │   ├── cart/           # Shopping cart module
│   │   ├── users/          # User management module
│   │   └── common/         # Shared utilities
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── docker-compose.dev.yml   # Development Docker configuration
├── docker-compose.prod.yml  # Production Docker configuration
└── package.json            # Root package.json for workspace
```

## 🔐 Environment Variables

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bookstore_dev"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 🚀 Deployment

### Production Deployment with Docker

```bash
# Build and start production containers
npm run docker:prod

# Or manually
docker-compose -f docker-compose.prod.yml up --build -d
```

### Manual Deployment

```bash
# Build applications
npm run build

# Start production servers
cd backend && npm run start:prod
cd frontend && npm start
```

## 📊 Monitoring and Health Checks

- Backend health check: `http://localhost:3001/health`
- Frontend health check: `http://localhost:3000/api/health`
- Database monitoring via Prisma Studio: `npm run db:studio`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 5432, and 6379 are available
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **Environment variables**: Double-check all required environment variables are set
4. **Docker issues**: Try `docker system prune` to clean up Docker resources

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Documentation](https://github.com/your-repo/wiki)
- Contact the development team

---

Built with ❤️ using modern web technologies