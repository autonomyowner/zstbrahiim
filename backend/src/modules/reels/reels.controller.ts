import {
  Controller,
  Get,
  Post,
  Delete,
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
} from '@nestjs/swagger';
import { ReelsService } from './reels.service';
import { CreateReelDto } from './dto/create-reel.dto';
import { ListReelsDto } from './dto/list-reels.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('reels')
@Controller('v1/reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all reels (TikTok-style feed)' })
  @ApiResponse({
    status: 200,
    description: 'Reels retrieved successfully',
  })
  async findAll(
    @Query() query: ListReelsDto,
    @CurrentUser() user?: User, // Optional for guest access
  ) {
    return this.reelsService.findAll(query, user?.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get reel by ID with stats' })
  @ApiParam({ name: 'id', description: 'Reel UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reel retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reel not found',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: User, // Optional for guest access
  ) {
    return this.reelsService.findOne(id, user?.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new reel (seller only)' })
  @ApiResponse({
    status: 201,
    description: 'Reel created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only sellers can create reels',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async create(
    @Body() createReelDto: CreateReelDto,
    @CurrentUser() user: User,
  ) {
    return this.reelsService.create(createReelDto, user);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Increment view count' })
  @ApiParam({ name: 'id', description: 'Reel UUID' })
  @ApiResponse({
    status: 200,
    description: 'View count incremented',
  })
  @ApiResponse({
    status: 404,
    description: 'Reel not found',
  })
  async incrementView(@Param('id') id: string) {
    return this.reelsService.incrementView(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete reel (seller only, must own)' })
  @ApiParam({ name: 'id', description: 'Reel UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reel deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own reels',
  })
  @ApiResponse({
    status: 404,
    description: 'Reel not found',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.reelsService.remove(id, user);
  }
}
