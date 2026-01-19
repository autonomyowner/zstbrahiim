import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('cart')
@Controller('v1/cart')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user cart with all items' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    schema: {
      example: {
        items: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            product_id: '456e4567-e89b-12d3-a456-426614174000',
            quantity: 2,
            product_name: 'Chanel No. 5',
            product_price: 25000,
            product_image: 'https://cdn.example.com/image.jpg',
            created_at: '2024-01-15T10:00:00Z',
          },
        ],
        summary: {
          subtotal: 50000,
          total_items: 2,
          items_count: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getCart(
    @CurrentUser() user: User,
  ) {
    return this.cartService.getCart(user.id);
  }

  @Get('count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get cart item count' })
  @ApiResponse({
    status: 200,
    description: 'Cart count retrieved successfully',
    schema: {
      example: {
        count: 5,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getCartCount(
    @CurrentUser() user: User,
  ) {
    const count = await this.cartService.getCartCount(user.id);
    return { count };
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to cart',
    description: 'Adds item to cart or updates quantity if already exists',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Product out of stock or insufficient quantity',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async addItem(
    @Body() addToCartDto: AddToCartDto,
    @CurrentUser() user: User,
  ) {
    return this.cartService.addItem(user.id, addToCartDto);
  }

  @Patch('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock',
  })
  async updateItem(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @CurrentUser() user: User,
  ) {
    return this.cartService.updateItem(user.id, id, updateCartItemDto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.cartService.removeItem(user.id, id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
  })
  async clearCart(
    @CurrentUser() user: User,
  ) {
    return this.cartService.clearCart(user.id);
  }
}
