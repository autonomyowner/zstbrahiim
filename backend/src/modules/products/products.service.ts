import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindManyOptions } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto, SortBy, SortOrder } from './dto/list-products.dto';
import { RedisConfig } from '../../config/redis.config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly CACHE_TTL = 60; // 1 minute cache
  private readonly CACHE_PREFIX = 'products';

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly redisConfig: RedisConfig,
  ) {}

  /**
   * Find all products with filtering, pagination, and caching
   */
  async findAll(query: ListProductsDto) {
    const { page, limit, search, category, seller_category, seller_id, min_price, max_price, in_stock, sort_by, sort_order, brand } = query;

    // Generate cache key based on query parameters
    const cacheKey = `${this.CACHE_PREFIX}:list:${JSON.stringify(query)}`;

    // Check Redis cache first
    const redis = this.redisConfig.getClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build query
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.seller', 'seller');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.brand) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (seller_category) {
      queryBuilder.andWhere('product.seller_category = :seller_category', { seller_category });
    }

    if (seller_id) {
      queryBuilder.andWhere('product.seller_id = :seller_id', { seller_id });
    }

    if (min_price !== undefined) {
      queryBuilder.andWhere('product.price >= :min_price', { min_price });
    }

    if (max_price !== undefined) {
      queryBuilder.andWhere('product.price <= :max_price', { max_price });
    }

    if (in_stock !== undefined) {
      queryBuilder.andWhere('product.in_stock = :in_stock', { in_stock });
    }

    if (brand) {
      queryBuilder.andWhere('LOWER(product.brand) = LOWER(:brand)', { brand });
    }

    // Apply sorting
    const sortField = sort_by === SortBy.CREATED_AT ? 'product.created_at' :
                      sort_by === SortBy.PRICE ? 'product.price' :
                      sort_by === SortBy.NAME ? 'product.name' :
                      sort_by === SortBy.RATING ? 'product.rating' :
                      'product.created_at';

    queryBuilder.orderBy(sortField, sort_order || SortOrder.DESC);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [products, total] = await queryBuilder.getManyAndCount();

    const result = {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache result for 1 minute
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

    return result;
  }

  /**
   * Find product by ID with caching
   */
  async findOne(id: string, userId?: string) {
    const cacheKey = `${this.CACHE_PREFIX}:${id}`;

    // Check Redis cache
    const redis = this.redisConfig.getClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      const product = JSON.parse(cached);

      // If user is provided, check if they liked this product
      if (userId) {
        // This would integrate with wishlist in the future
        product.is_liked = false; // Placeholder
      }

      return product;
    }

    // Fetch from database
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['images', 'seller'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Cache for 1 minute
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(product));

    return product;
  }

  /**
   * Create a new product (seller only)
   */
  async create(createProductDto: CreateProductDto, user: User) {
    // Verify user is a seller
    if (user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can create products');
    }

    // Extract images from DTO
    const { images, ...productData } = createProductDto;

    // Auto-fill seller_category from user profile if not provided
    if (!productData.seller_category && user.seller_category) {
      productData.seller_category = user.seller_category;
    }

    // Auto-generate slug from name
    const baseSlug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now()}`;
    productData['slug'] = uniqueSlug;

    // Auto-set in_stock based on stock quantity if not provided
    if (createProductDto.in_stock === undefined) {
      productData['in_stock'] = createProductDto.stock > 0;
    }

    // Create product entity
    const product = this.productsRepository.create({
      ...productData,
      seller_id: user.id,
    });

    // Save product
    const savedProduct = await this.productsRepository.save(product);

    // Save images if provided
    if (images && images.length > 0) {
      const imageEntities = images.map((url, index) =>
        this.productImagesRepository.create({
          product_id: savedProduct.id,
          image_url: url,
          display_order: index,
        })
      );
      await this.productImagesRepository.save(imageEntities);
    }

    // Invalidate cache
    await this.invalidateListCache();

    // Fetch and return complete product with relations
    return this.findOne(savedProduct.id);
  }

  /**
   * Update product (seller only, must own product)
   */
  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Verify ownership
    if (product.seller_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own products');
    }

    // Extract images from DTO
    const { images, ...productData } = updateProductDto;

    // Update product fields
    Object.assign(product, productData);

    // Auto-update in_stock based on stock if stock is being updated
    if (updateProductDto.stock !== undefined) {
      product.in_stock = updateProductDto.stock > 0;
    }

    // Save updated product
    const updatedProduct = await this.productsRepository.save(product);

    // Update images if provided
    if (images) {
      // Delete existing images
      await this.productImagesRepository.delete({ product_id: id });

      // Create new images
      if (images.length > 0) {
        const imageEntities = images.map((url, index) =>
          this.productImagesRepository.create({
            product_id: id,
            image_url: url,
            display_order: index,
          })
        );
        await this.productImagesRepository.save(imageEntities);
      }
    }

    // Invalidate caches
    await this.invalidateCache(id);
    await this.invalidateListCache();

    // Fetch and return complete product
    return this.findOne(id);
  }

  /**
   * Delete product (seller only, must own product)
   */
  async remove(id: string, user: User) {
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Verify ownership
    if (product.seller_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own products');
    }

    // Delete product (cascade will handle images)
    await this.productsRepository.remove(product);

    // Invalidate caches
    await this.invalidateCache(id);
    await this.invalidateListCache();

    return {
      message: 'Product deleted successfully',
      id,
    };
  }

  /**
   * Get products by seller ID
   */
  async findBySeller(sellerId: string, query: ListProductsDto) {
    return this.findAll({
      ...query,
      seller_id: sellerId,
    });
  }

  /**
   * Invalidate product cache
   */
  private async invalidateCache(productId: string) {
    const redis = this.redisConfig.getClient();
    const cacheKey = `${this.CACHE_PREFIX}:${productId}`;
    await redis.del(cacheKey);
  }

  /**
   * Invalidate all list caches (called after create/update/delete)
   */
  private async invalidateListCache() {
    const redis = this.redisConfig.getClient();
    const pattern = `${this.CACHE_PREFIX}:list:*`;

    // Get all matching keys
    const keys = await redis.keys(pattern);

    // Delete all matching keys
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
