import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('products')
@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all products with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Chanel No. 5',
            description: 'Classic perfume',
            price: 25000,
            category: 'perfume',
            seller_category: 'importateur',
            brand: 'Chanel',
            stock: 50,
            in_stock: true,
            rating: 4.5,
            images: [],
            created_at: '2024-01-15T10:00:00Z',
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      },
    },
  })
  async findAll(@Query() query: ListProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id') id: string) {
    // TODO: Extract user ID from auth token when auth is implemented
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (seller only)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only sellers can create products',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (seller only, must own product)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update your own products',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (seller only, must own product)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own products',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.productsService.remove(id, user);
  }
}

/**
 * Seller-specific products controller
 */
@ApiTags('seller')
@Controller('v1/seller/products')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('seller', 'admin')
@ApiBearerAuth()
export class SellerProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all products for authenticated seller' })
  @ApiResponse({
    status: 200,
    description: 'Seller products retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only sellers can access this endpoint',
  })
  async findMy(
    @Query() query: ListProductsDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.findBySeller(user.id, query);
  }
}
