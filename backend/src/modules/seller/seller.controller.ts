import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('seller')
@Controller('v1/seller')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('seller', 'admin')
@ApiBearerAuth()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  /**
   * Get seller dashboard stats
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get seller dashboard stats',
    description: 'Get aggregated stats for seller dashboard (cached 5 min)',
  })
  @ApiResponse({
    status: 200,
    description: 'Stats retrieved successfully',
    schema: {
      example: {
        products: {
          total: 50,
          active: 45,
          outOfStock: 5,
        },
        orders: {
          total: 120,
          pending: 8,
        },
        revenue: {
          total: 2500000,
          monthly: 500000,
          avgOrderValue: 20833,
        },
        reels: {
          total: 15,
          totalViews: 5420,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only sellers can access dashboard',
  })
  async getStats(@CurrentUser() user: User) {
    return this.sellerService.getStats(user.id);
  }

  /**
   * Get revenue analytics over time
   */
  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get revenue analytics',
    description: 'Get daily revenue breakdown for specified period',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    schema: {
      example: {
        period: '30d',
        data: [
          {
            date: '2024-01-01',
            revenue: 50000,
            orderCount: 5,
          },
          {
            date: '2024-01-02',
            revenue: 75000,
            orderCount: 8,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getAnalytics(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.getAnalytics(user.id, query.period);
  }

  /**
   * Get recent orders
   */
  @Get('recent-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get recent orders',
    description: 'Get the 10 most recent orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getRecentOrders(@CurrentUser() user: User) {
    return this.sellerService.getRecentOrders(user.id);
  }

  /**
   * Get top products by revenue
   */
  @Get('top-products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get top selling products',
    description: 'Get top 10 products by revenue',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      example: [
        {
          productId: 'uuid-123',
          productName: 'Premium Perfume',
          totalQuantity: 150,
          totalRevenue: 750000,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getTopProducts(@CurrentUser() user: User) {
    return this.sellerService.getTopProducts(user.id);
  }

  /**
   * Update seller's product (images, video, etc.)
   */
  @Patch('products/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update seller product',
    description: 'Update product images, video, and other fields. Seller must own the product.',
  })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You do not own this product',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async updateProduct(
    @Param('productId') productId: string,
    @Body() dto: UpdateSellerProductDto,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.updateProduct(productId, dto, user.id);
  }
}
