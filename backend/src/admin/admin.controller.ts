import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateOrderDto } from '../orders/dto/create-order.dto';

interface AuthenticatedAdminRequest {
  user: {
    id: string;
  };
}

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create a new order for a user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  createOrder(
    @Query('userId') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, createOrderDto);
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/recent-orders')
  @ApiOperation({ summary: 'Get recent orders for dashboard (Admin only)' })
  @ApiResponse({ status: 200, description: 'Recent orders retrieved' })
  getRecentOrders(@Query('limit') limit?: string) {
    return this.adminService.getRecentOrders(limit ? parseInt(limit, 10) : 10);
  }

  @Get('dashboard/activities')
  @ApiOperation({ summary: 'Get recent activities for dashboard (Admin only)' })
  @ApiResponse({ status: 200, description: 'Recent activities retrieved' })
  getRecentActivities(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivities(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // ── User Management ───────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiResponse({ status: 200, description: 'Users list retrieved' })
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ) {
    return this.adminService.getUsers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      role,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Request() req: AuthenticatedAdminRequest,
  ) {
    return this.adminService.updateUserRole(id, dto, req.user.id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (only if no orders)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'User has orders — cannot delete' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(
    @Param('id') id: string,
    @Request() req: AuthenticatedAdminRequest,
  ) {
    return this.adminService.deleteUser(id, req.user.id);
  }
}
