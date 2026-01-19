import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
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
  ApiQuery,
} from '@nestjs/swagger';
import { InteractionsService } from './interactions.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('reels')
@Controller('v1/reels')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  // ============================
  // LIKES
  // ============================

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a reel' })
  @ApiParam({ name: 'id', description: 'Reel UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reel liked successfully (real-time event broadcasted)',
  })
  @ApiResponse({
    status: 400,
    description: 'Already liked or rate limited',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Reel not found',
  })
  async likeReel(
    @Param('id') reelId: string,
    @CurrentUser() user: User,
  ) {
    return this.interactionsService.likeReel(reelId, user);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a reel' })
  @ApiParam({ name: 'id', description: 'Reel UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reel unliked successfully (real-time event broadcasted)',
  })
  @ApiResponse({
    status: 400,
    description: 'Not liked yet',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Reel not found',
  })
  async unlikeReel(
    @Param('id') reelId: string,
    @CurrentUser() user: User,
  ) {
    return this.interactionsService.unlikeReel(reelId, user);
  }

  @Get(':id/likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get users who liked a reel' })
  @ApiParam({ name: 'id', description: 'Reel UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Likes retrieved successfully',
  })
  async getReelLikes(
    @Param('id') reelId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.interactionsService.getReelLikes(reelId, page, limit);
  }

  // ============================
  // COMMENTS
  // ============================

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a reel' })
  @ApiParam({ name: 'id', description: 'Reel UUID' })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully (real-time event broadcasted)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid content or rate limited',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Reel not found',
  })
  async addComment(
    @Param('id') reelId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.interactionsService.addComment(reelId, createCommentDto, user);
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get comments for a reel' })
  @ApiParam({ name: 'id', description: 'Reel UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
  })
  async getComments(
    @Param('id') reelId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.interactionsService.getComments(reelId, page, limit);
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a comment (own comments or admin)' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully (real-time event broadcasted)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own comments',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return this.interactionsService.deleteComment(commentId, user);
  }

  @Patch('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a comment (own comments only)' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only edit your own comments',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: { content: string },
    @CurrentUser() user: User,
  ) {
    return this.interactionsService.updateComment(commentId, body.content, user);
  }
}
