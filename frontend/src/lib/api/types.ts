export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  description?: string;
  price: number | string; // Decimal from backend, can be string or number
  inventory: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  bookId: string;
  quantity: number;
  book: Book;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  quantity: number;
  price: number;
  book: Book;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: Partial<User>;
  payment?: Payment;
}

export interface Payment {
  id: string;
  orderId: string;
  stripePaymentId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface BookQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'title' | 'author' | 'price' | 'createdAt' | 'inventory';
  sortOrder?: 'asc' | 'desc';
  inStock?: boolean;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Order['status'];
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

// Admin Dashboard Types
export interface DashboardStat {
  value: number;
  change: number;
  trend: 'up' | 'down';
}

export interface DashboardStats {
  totalRevenue: DashboardStat;
  booksInCatalog: DashboardStat;
  totalOrders: DashboardStat;
  activeCustomers: DashboardStat;
}

export interface RecentOrder {
  id: string;
  customer: string;
  customerEmail: string;
  amount: number;
  status: Order['status'];
  createdAt: string;
}

export interface RecentActivity {
  type: 'inventory_alert' | 'new_user' | 'new_order' | 'system';
  title: string;
  description: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
}
