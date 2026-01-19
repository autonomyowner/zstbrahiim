import { Injectable, NotFoundException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReel } from './entities/product-reel.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReelDto } from './dto/create-reel.dto';
import { ListReelsDto } from './dto/list-reels.dto';
import { RealtimeService } from '../realtime/realtime.service';
import { User } from '../users/entities/user.entity';
import { InteractionsService } from './interactions.service';

@Injectable()
export class ReelsService {
  constructor(
    @InjectRepository(ProductReel)
    private reelsRepository: Repository<ProductReel>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private realtimeService: RealtimeService,
    @Inject(forwardRef(() => InteractionsService))
    private interactionsService: InteractionsService,
  ) {}

  /**
   * Create a new reel (seller only)
   */
  async create(createReelDto: CreateReelDto, user: User) {
    // Verify user is a seller
    if (user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can create reels');
    }

    // Verify product exists and belongs to seller
    const product = await this.productsRepository.findOne({
      where: { id: createReelDto.product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.seller_id !== user.id) {
      throw new ForbiddenException('You can only create reels for your own products');
    }

    // Create reel
    const reel = this.reelsRepository.create({
      ...createReelDto,
      seller_id: user.id,
    });

    const savedReel = await this.reelsRepository.save(reel);

    // Initialize Redis counters
    await this.realtimeService.initializeReelCounters(savedReel.id, 0, 0, 0);

    return this.findOne(savedReel.id, user.id);
  }

  /**
   * Find all reels with pagination
   */
  async findAll(query: ListReelsDto, userId?: string) {
    const { page, limit, product_id, seller_id } = query;

    const queryBuilder = this.reelsRepository
      .createQueryBuilder('reel')
      .leftJoinAndSelect('reel.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('reel.seller', 'seller');

    // Apply filters
    if (product_id) {
      queryBuilder.andWhere('reel.product_id = :product_id', { product_id });
    }

    if (seller_id) {
      queryBuilder.andWhere('reel.seller_id = :seller_id', { seller_id });
    }

    // Order by created date (newest first)
    queryBuilder.orderBy('reel.created_at', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [reels, total] = await queryBuilder.getManyAndCount();

    // Enrich with Redis counters and user-specific data
    const enrichedReels = await Promise.all(
      reels.map(async (reel) => {
        const counters = await this.realtimeService.getReelCounters(reel.id);

        // Sync counters back to database (eventual consistency)
        if (
          counters.likes !== reel.likes_count ||
          counters.comments !== reel.comments_count ||
          counters.views !== reel.views_count
        ) {
          await this.reelsRepository.update(reel.id, {
            likes_count: counters.likes,
            comments_count: counters.comments,
            views_count: counters.views,
          });
        }

        const enriched: any = {
          ...reel,
          likes_count: counters.likes,
          comments_count: counters.comments,
          views_count: counters.views,
        };

        // Add user-specific data if authenticated
        if (userId) {
          enriched.is_liked = await this.checkIfUserLiked(reel.id, userId);
        }

        return enriched;
      }),
    );

    return {
      data: enrichedReels,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find reel by ID
   */
  async findOne(id: string, userId?: string) {
    const reel = await this.reelsRepository.findOne({
      where: { id },
      relations: ['product', 'product.images', 'seller'],
    });

    if (!reel) {
      throw new NotFoundException(`Reel with ID ${id} not found`);
    }

    // Get counters from Redis
    const counters = await this.realtimeService.getReelCounters(id);

    // Sync to database
    if (
      counters.likes !== reel.likes_count ||
      counters.comments !== reel.comments_count ||
      counters.views !== reel.views_count
    ) {
      await this.reelsRepository.update(id, {
        likes_count: counters.likes,
        comments_count: counters.comments,
        views_count: counters.views,
      });
    }

    const enriched: any = {
      ...reel,
      likes_count: counters.likes,
      comments_count: counters.comments,
      views_count: counters.views,
    };

    // Add user-specific data
    if (userId) {
      enriched.is_liked = await this.checkIfUserLiked(id, userId);
    }

    return enriched;
  }

  /**
   * Increment view count
   */
  async incrementView(id: string) {
    // Check if reel exists
    const reel = await this.reelsRepository.findOne({ where: { id } });

    if (!reel) {
      throw new NotFoundException(`Reel with ID ${id} not found`);
    }

    // Increment in Redis
    const viewCount = await this.realtimeService.incrementReelViews(id);

    return {
      reelId: id,
      viewCount,
    };
  }

  /**
   * Delete reel (seller only, must own)
   */
  async remove(id: string, user: User) {
    const reel = await this.reelsRepository.findOne({ where: { id } });

    if (!reel) {
      throw new NotFoundException(`Reel with ID ${id} not found`);
    }

    // Verify ownership
    if (reel.seller_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own reels');
    }

    await this.reelsRepository.remove(reel);

    return {
      message: 'Reel deleted successfully',
      id,
    };
  }

  /**
   * Check if user liked a reel (helper method)
   */
  private async checkIfUserLiked(reelId: string, userId: string): Promise<boolean> {
    return this.interactionsService.checkIfLiked(reelId, userId);
  }
}
