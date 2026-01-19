import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductReel } from '../reels/entities/product-reel.entity';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto';
import { User } from '../users/entities/user.entity';
import { RedisConfig } from '../../config/redis.config';
import { AnalyticsPeriod } from './dto/analytics-query.dto';
import Redis from 'ioredis';

@Injectable()
export class SellerService {
  private readonly redis: Redis;
  private readonly CACHE_PREFIX = 'seller:stats';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductReel)
    private reelsRepository: Repository<ProductReel>,
    private redisConfig: RedisConfig,
  ) {
    this.redis = this.redisConfig.getClient();
  }

  /**
   * Get seller dashboard stats
   */
  async getStats(sellerId: string) {
    // Check cache
    const cacheKey = `${this.CACHE_PREFIX}:${sellerId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Total products
    const totalProducts = await this.productsRepository.count({
      where: { seller_id: sellerId },
    });

    // Active products (in stock)
    const activeProducts = await this.productsRepository.count({
      where: { seller_id: sellerId, in_stock: true },
    });

    // Total orders
    const totalOrders = await this.ordersRepository.count({
      where: { seller_id: sellerId },
    });

    // Pending orders
    const pendingOrders = await this.ordersRepository.count({
      where: { seller_id: sellerId, status: OrderStatus.PENDING },
    });

    // Total revenue
    const revenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.seller_id = :sellerId', { sellerId })
      .andWhere('order.payment_status = :paymentStatus', {
        paymentStatus: PaymentStatus.PAID,
      })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || 0);

    // Monthly revenue (last 30 days)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const monthlyRevenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.seller_id = :sellerId', { sellerId })
      .andWhere('order.payment_status = :paymentStatus', {
        paymentStatus: PaymentStatus.PAID,
      })
      .andWhere('order.created_at >= :monthAgo', { monthAgo })
      .getRawOne();

    const monthlyRevenue = parseFloat(monthlyRevenueResult?.total || 0);

    // Average order value
    const avgOrderValue =
      totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Total reels
    const totalReels = await this.reelsRepository.count({
      where: { seller_id: sellerId },
    });

    // Total reel views (sum of views_count)
    const reelViewsResult = await this.reelsRepository
      .createQueryBuilder('reel')
      .select('SUM(reel.views_count)', 'total')
      .where('reel.seller_id = :sellerId', { sellerId })
      .getRawOne();

    const totalReelViews = parseInt(reelViewsResult?.total || 0);

    const stats = {
      products: {
        total: totalProducts,
        active: activeProducts,
        outOfStock: totalProducts - activeProducts,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        avgOrderValue,
      },
      reels: {
        total: totalReels,
        totalViews: totalReelViews,
      },
    };

    // Cache result
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(stats));

    return stats;
  }

  /**
   * Get revenue analytics over time
   */
  async getAnalytics(sellerId: string, period: AnalyticsPeriod) {
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily revenue for the period
    const dailyRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('DATE(order.created_at)', 'date')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('COUNT(order.id)', 'orderCount')
      .where('order.seller_id = :sellerId', { sellerId })
      .andWhere('order.created_at >= :startDate', { startDate })
      .andWhere('order.payment_status = :paymentStatus', {
        paymentStatus: PaymentStatus.PAID,
      })
      .groupBy('DATE(order.created_at)')
      .orderBy('DATE(order.created_at)', 'ASC')
      .getRawMany();

    return {
      period,
      data: dailyRevenue.map((item) => ({
        date: item.date,
        revenue: parseFloat(item.revenue || 0),
        orderCount: parseInt(item.orderCount || 0),
      })),
    };
  }

  /**
   * Get recent orders (last 10)
   */
  async getRecentOrders(sellerId: string, limit: number = 10) {
    const orders = await this.ordersRepository.find({
      where: { seller_id: sellerId },
      relations: ['items', 'user'],
      order: { created_at: 'DESC' },
      take: limit,
    });

    return orders;
  }

  /**
   * Get top products by revenue
   */
  async getTopProducts(sellerId: string, limit: number = 10) {
    const topProducts = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .select('item.product_id', 'productId')
      .addSelect('item.product_name', 'productName')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.subtotal)', 'totalRevenue')
      .where('order.seller_id = :sellerId', { sellerId })
      .andWhere('order.payment_status = :paymentStatus', {
        paymentStatus: PaymentStatus.PAID,
      })
      .groupBy('item.product_id, item.product_name')
      .orderBy('SUM(item.subtotal)', 'DESC')
      .limit(limit)
      .getRawMany();

    return topProducts.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantity: parseInt(item.totalQuantity),
      totalRevenue: parseFloat(item.totalRevenue),
    }));
  }

  /**
   * Update seller's product
   */
  async updateProduct(productId: string, dto: UpdateSellerProductDto, sellerId: string) {
    console.log('[SellerService] updateProduct called:', { productId, sellerId, dto });

    // Find the product
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['images', 'seller'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify ownership
    if (product.seller_id !== sellerId) {
      throw new ForbiddenException('You do not own this product');
    }

    // Extract images array from DTO (handled separately)
    const { images, ...productData } = dto;

    // Update product fields
    Object.assign(product, productData);

    // Handle images array if provided
    if (images && images.length > 0) {
      console.log('[SellerService] Processing images:', { imageCount: images.length, productId });

      // Delete existing images
      await this.productImagesRepository.delete({ product_id: productId });
      console.log('[SellerService] Deleted existing images');

      // Create new images using raw SQL to bypass TypeORM's relation mapping issues
      for (let index = 0; index < images.length; index++) {
        const url = images[index];
        const isPrimary = index === 0 || url === dto.primary_image;
        await this.productImagesRepository.query(
          `INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES ($1, $2, $3, $4)`,
          [productId, url, index, isPrimary]
        );
      }
      console.log('[SellerService] Images inserted successfully');

      // Auto-set primary_image on product if not explicitly provided
      if (!dto.primary_image) {
        product.primary_image = images[0];
      }

      // Clear the stale images array to prevent TypeORM cascade issues
      product.images = [];
    }

    // Save updated product (without cascading images since we handled them manually)
    const updatedProduct = await this.productsRepository.save(product);

    // If video_url is set, create/update a ProductReel entry
    if (dto.video_url) {
      // Check if reel already exists for this product
      let reel = await this.reelsRepository.findOne({
        where: { product_id: productId },
      });

      if (reel) {
        // Update existing reel
        reel.video_url = dto.video_url;
        reel.thumbnail_url = dto.primary_image || product.primary_image;
        await this.reelsRepository.save(reel);
      } else {
        // Create new reel
        reel = this.reelsRepository.create({
          product_id: productId,
          seller_id: sellerId,
          video_url: dto.video_url,
          thumbnail_url: dto.primary_image || product.primary_image,
          caption: product.name,
        });
        await this.reelsRepository.save(reel);
      }
    }

    // Reload with relations
    return this.productsRepository.findOne({
      where: { id: productId },
      relations: ['images', 'seller'],
    });
  }
}
