import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('orders')
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates an order with guest checkout support. If authenticated, user_id is attached. Supports multiple sellers (creates separate orders).',
  })
  @ApiResponse({
    status: 201,
    description: 'Order(s) created successfully',
    schema: {
      example: {
        message: 'Order(s) created successfully',
        orders: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            order_number: 'ZST-1705315200000-1234',
            customer_name: 'Ahmed Benali',
            customer_phone: '0555123456',
            customer_wilaya: 'Alger',
            subtotal: 50000,
            shipping_cost: 500,
            total: 50500,
            status: 'pending',
            payment_status: 'pending',
            items: [],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or insufficient stock',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user?: User, // Optional - for guest checkout
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You do not have access to this order',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User orders retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async findMyOrders(
    @Query() query: ListOrdersDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.findUserOrders(user.id, query);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel order (customer or seller)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Order cannot be cancelled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'You cannot cancel this order',
  })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.cancel(id, user);
  }
}

/**
 * Seller-specific orders controller
 */
@ApiTags('seller')
@Controller('v1/seller/orders')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('seller', 'admin')
@ApiBearerAuth()
export class SellerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all orders for authenticated seller' })
  @ApiResponse({
    status: 200,
    description: 'Seller orders retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only sellers can access this endpoint',
  })
  async findMyOrders(
    @Query() query: ListOrdersDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.findSellerOrders(user.id, query);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status (seller only)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update your own orders',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto, user);
  }
}

/**
 * Guest order tracking controller
 */
@ApiTags('guest')
@Controller('v1/guest/orders')
export class GuestOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('track/:phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track orders by phone number (for guest checkout)',
    description: 'Allows guests to track their orders using phone number',
  })
  @ApiParam({ name: 'phone', description: 'Customer phone number' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  async trackByPhone(
    @Param('phone') phone: string,
    @Query() query: ListOrdersDto,
  ) {
    return this.ordersService.findByPhone(phone, query);
  }
}
