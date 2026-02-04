# Search, Filter, Sort, and Pagination Implementation Summary

## Overview
Added comprehensive search, filtering, sorting, and pagination capabilities to the Books and Orders entities in the bookstore API.

## Changes Made

### 1. Common DTOs Created

#### `backend/src/common/dto/pagination.dto.ts`
- Base pagination DTO with `page` and `limit` parameters
- `PaginatedResult<T>` interface for consistent response format
- Includes metadata: total, page, limit, totalPages, hasNextPage, hasPreviousPage

### 2. Books Module

#### New DTO: `backend/src/books/dto/query-books.dto.ts`
**Search:**
- `search`: Full-text search across title, author, description, and ISBN

**Filters:**
- `category`: Filter by book category
- `author`: Filter by author name
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `inStock`: Filter books with inventory > 0

**Sorting:**
- `sortBy`: Sort field (title, author, price, createdAt, inventory)
- `sortOrder`: Sort direction (asc, desc)

**Pagination:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

#### Updated Files:
- `backend/src/books/books.service.ts`: Implemented search, filter, sort, and pagination logic
- `backend/src/books/books.controller.ts`: Updated to use QueryBooksDto

### 3. Orders Module

#### New DTO: `backend/src/orders/dto/query-orders.dto.ts`
**Search:**
- `search`: Search across order number, user email, first name, and last name

**Filters:**
- `status`: Filter by order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- `startDate`: Filter orders created after this date
- `endDate`: Filter orders created before this date

**Sorting:**
- `sortBy`: Sort field (createdAt, updatedAt, totalAmount, orderNumber)
- `sortOrder`: Sort direction (asc, desc)

**Pagination:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

#### Updated Files:
- `backend/src/orders/orders.service.ts`: Implemented search, filter, sort, and pagination logic
- `backend/src/orders/orders.controller.ts`: Updated endpoints to accept QueryOrdersDto

### 4. Cart Module
Cart does not require pagination as it's user-specific and typically contains a small number of items.

## API Usage Examples

### Books API

**Get all books with pagination:**
```
GET /books?page=1&limit=10
```

**Search books:**
```
GET /books?search=harry potter
```

**Filter by category and price range:**
```
GET /books?category=Fiction&minPrice=10&maxPrice=50
```

**Filter in-stock books only:**
```
GET /books?inStock=true
```

**Sort by price (ascending):**
```
GET /books?sortBy=price&sortOrder=asc
```

**Combined query:**
```
GET /books?search=tolkien&category=Fantasy&minPrice=15&sortBy=price&sortOrder=asc&page=1&limit=20
```

### Orders API

**Get all orders (Admin only):**
```
GET /orders?page=1&limit=10
```

**Get user's orders:**
```
GET /orders/my-orders?page=1&limit=10
```

**Search orders:**
```
GET /orders?search=john@example.com
```

**Filter by status:**
```
GET /orders?status=PENDING
```

**Filter by date range:**
```
GET /orders?startDate=2024-01-01&endDate=2024-12-31
```

**Sort by total amount:**
```
GET /orders?sortBy=totalAmount&sortOrder=desc
```

**Combined query:**
```
GET /orders?status=DELIVERED&startDate=2024-01-01&sortBy=createdAt&sortOrder=desc&page=1&limit=20
```

## Response Format

All paginated endpoints return data in this format:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Validation

All query parameters are validated using class-validator:
- `page`: Must be >= 1
- `limit`: Must be between 1 and 100
- `minPrice`, `maxPrice`: Must be >= 0
- `sortBy`: Must be one of the allowed enum values
- `sortOrder`: Must be 'asc' or 'desc'
- `status`: Must be a valid OrderStatus enum value

## Performance Considerations

1. **Database Indexes**: Ensure indexes exist on frequently queried fields:
   - Books: category, author, price, createdAt
   - Orders: userId, status, createdAt, orderNumber

2. **Case-Insensitive Search**: Uses Prisma's `mode: 'insensitive'` for better UX

3. **Efficient Counting**: Uses `Promise.all()` to run count and data queries in parallel

4. **Limit Protection**: Maximum limit of 100 items per page to prevent performance issues

## Testing

To test the new functionality:

1. Start the development server:
   ```bash
   cd backend
   pnpm dev
   ```

2. Use the API documentation at `http://localhost:3001/api/docs`

3. Test various query combinations for both books and orders endpoints

## Notes

- The `orderNumber` field TypeScript errors in the IDE are due to language server cache. The code compiles successfully.
- To refresh TypeScript types in your IDE: Press `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- All endpoints maintain backward compatibility - query parameters are optional
