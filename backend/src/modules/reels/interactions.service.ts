import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReel } from './entities/product-reel.entity';
import { ReelLike } from './entities/reel-like.entity';
import { ReelComment } from './entities/reel-comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RealtimeService } from '../realtime/realtime.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(ProductReel)
    private reelsRepository: Repository<ProductReel>,
    @InjectRepository(ReelLike)
    private likesRepository: Repository<ReelLike>,
    @InjectRepository(ReelComment)
    private commentsRepository: Repository<ReelComment>,
    private realtimeService: RealtimeService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  // ============================
  // LIKES
  // ============================

  /**
   * Like a reel
   */
  async likeReel(reelId: string, user: User) {
    // Check rate limiting
    const allowed = await this.realtimeService.checkLikeRateLimit(user.id);
    if (!allowed) {
      throw new BadRequestException('Too many likes. Please slow down.');
    }

    // Check if reel exists
    const reel = await this.reelsRepository.findOne({ where: { id: reelId } });
    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    // Check if already liked
    const existingLike = await this.likesRepository.findOne({
      where: { reel_id: reelId, user_id: user.id },
    });

    if (existingLike) {
      throw new BadRequestException('You have already liked this reel');
    }

    // Create like
    const like = this.likesRepository.create({
      reel_id: reelId,
      user_id: user.id,
    });

    await this.likesRepository.save(like);

    // Increment Redis counter
    const likesCount = await this.realtimeService.incrementReelLikes(reelId);

    // Broadcast real-time event
    this.realtimeGateway.broadcastReelLike(reelId, {
      userId: user.id,
      likesCount,
    });

    return {
      message: 'Reel liked successfully',
      reelId,
      likesCount,
    };
  }

  /**
   * Unlike a reel
   */
  async unlikeReel(reelId: string, user: User) {
    // Check if reel exists
    const reel = await this.reelsRepository.findOne({ where: { id: reelId } });
    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    // Find existing like
    const like = await this.likesRepository.findOne({
      where: { reel_id: reelId, user_id: user.id },
    });

    if (!like) {
      throw new BadRequestException('You have not liked this reel');
    }

    // Remove like
    await this.likesRepository.remove(like);

    // Decrement Redis counter
    const likesCount = await this.realtimeService.decrementReelLikes(reelId);

    // Broadcast real-time event
    this.realtimeGateway.broadcastReelUnlike(reelId, {
      userId: user.id,
      likesCount,
    });

    return {
      message: 'Reel unliked successfully',
      reelId,
      likesCount,
    };
  }

  /**
   * Check if user liked a reel
   */
  async checkIfLiked(reelId: string, userId: string): Promise<boolean> {
    const like = await this.likesRepository.findOne({
      where: { reel_id: reelId, user_id: userId },
    });

    return !!like;
  }

  /**
   * Get users who liked a reel
   */
  async getReelLikes(reelId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [likes, total] = await this.likesRepository.findAndCount({
      where: { reel_id: reelId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: likes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================
  // COMMENTS
  // ============================

  /**
   * Add a comment to a reel
   */
  async addComment(reelId: string, createCommentDto: CreateCommentDto, user: User) {
    // Check rate limiting
    const allowed = await this.realtimeService.checkCommentRateLimit(user.id);
    if (!allowed) {
      throw new BadRequestException('Too many comments. Please slow down.');
    }

    // Check if reel exists
    const reel = await this.reelsRepository.findOne({ where: { id: reelId } });
    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    // Create comment
    const comment = this.commentsRepository.create({
      reel_id: reelId,
      user_id: user.id,
      content: createCommentDto.content,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Increment Redis counter
    const commentsCount = await this.realtimeService.incrementReelComments(reelId);

    // Fetch complete comment with user data
    const completeComment = await this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });

    // Broadcast real-time event
    this.realtimeGateway.broadcastReelComment(reelId, {
      ...completeComment,
      commentsCount,
    });

    return {
      message: 'Comment added successfully',
      comment: completeComment,
      commentsCount,
    };
  }

  /**
   * Get comments for a reel
   */
  async getComments(reelId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { reel_id: reelId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, user: User) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Verify ownership or admin
    if (comment.user_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const reelId = comment.reel_id;

    // Remove comment
    await this.commentsRepository.remove(comment);

    // Decrement Redis counter
    const commentsCount = await this.realtimeService.decrementReelComments(reelId);

    // Broadcast real-time event
    this.realtimeGateway.broadcastReelCommentDeleted(reelId, commentId);

    return {
      message: 'Comment deleted successfully',
      commentId,
      reelId,
      commentsCount,
    };
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    content: string,
    user: User,
  ) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Verify ownership
    if (comment.user_id !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Comment cannot be empty');
    }

    if (content.length > 500) {
      throw new BadRequestException('Comment must not exceed 500 characters');
    }

    // Update comment
    comment.content = content.trim();
    await this.commentsRepository.save(comment);

    return {
      message: 'Comment updated successfully',
      comment,
    };
  }
}
