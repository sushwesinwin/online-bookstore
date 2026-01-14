# Database Setup

This directory contains the database schema, migrations, and seeding scripts for the Online Bookstore System.

## Files

- `schema.prisma` - Prisma schema definition with all models and relationships
- `seed.ts` - Database seeding script with sample data
- `init.sql` - Initial database setup script (run by Docker)
- `migrations/` - Database migration files

## Setup Instructions

### 1. Start the Database

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose -f docker-compose.dev.yml up postgres redis -d
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Run Migrations

```bash
# Apply all pending migrations
npm run db:migrate

# Or for development (creates migration if schema changed)
npm run db:push
```

### 4. Seed the Database

```bash
npm run db:seed
```

## Sample Data

The seed script creates:

### Users
- **Admin User**: admin@bookstore.com (password: admin123)
- **Test User**: user@bookstore.com (password: user123)

### Books
- 15 sample books across different categories:
  - Fiction (The Great Gatsby, To Kill a Mockingbird, etc.)
  - Science Fiction (1984, Brave New World, Dune)
  - Fantasy (The Hobbit, A Game of Thrones, Narnia)
  - Romance (Pride and Prejudice, Jane Eyre)
  - Mystery (Sherlock Holmes)

## Database Schema

### Core Models
- **User** - User accounts with authentication
- **Book** - Book catalog with inventory management
- **Order** - Purchase orders with status tracking
- **OrderItem** - Individual items within orders
- **CartItem** - Shopping cart items for users
- **Payment** - Payment processing records

### Relationships
- Users can have multiple orders and cart items
- Orders contain multiple order items
- Books can be in multiple orders and carts
- Each order can have one payment record

## Environment Variables

Required environment variables:
```
DATABASE_URL="postgresql://bookstore_user:bookstore_password@localhost:5432/bookstore_dev"
```

## Troubleshooting

### Reset Database
```bash
# WARNING: This will delete all data
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up postgres redis -d
npm run db:migrate
npm run db:seed
```

### View Database
```bash
# Open Prisma Studio
npm run db:studio
```