import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

class SyncRoleDto {
  @IsString()
  @IsIn(['customer', 'seller', 'freelancer'])
  role: 'customer' | 'seller' | 'freelancer';

  @IsOptional()
  @IsString()
  sellerCategory?: string;

  @IsOptional()
  @IsString()
  seller_category?: string; // Support both naming conventions
}

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly clerkService: ClerkService) {}

  @Post('sync-role')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync user role with backend and Clerk' })
  @ApiResponse({ status: 200, description: 'Role synced successfully' })
  @ApiResponse({ status: 400, description: 'Invalid role' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async syncRole(
    @Body() dto: SyncRoleDto,
    @CurrentUser() user: User,
  ) {
    const { role, sellerCategory, seller_category } = dto;
    const category = sellerCategory || seller_category;

    // Validate seller category if role is seller
    if (role === 'seller' && !category) {
      throw new BadRequestException('Seller category is required for seller role');
    }

    const validCategories = ['fournisseur', 'importateur', 'grossiste'];
    if (role === 'seller' && !validCategories.includes(category)) {
      throw new BadRequestException(`Invalid seller category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Update role in database and Clerk
    const updatedUser = await this.clerkService.updateUserRole(user, role, category);

    return {
      success: true,
      message: 'Role synced successfully',
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        seller_category: updatedUser.seller_category,
      },
    };
  }

  @Post('register')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register user with role (alias for sync-role)' })
  async register(
    @Body() dto: SyncRoleDto,
    @CurrentUser() user: User,
  ) {
    return this.syncRole(dto, user);
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      seller_category: user.seller_category,
      avatar_url: user.avatar_url,
      phone: user.phone,
      is_verified: user.is_verified,
      created_at: user.created_at,
    };
  }
}
