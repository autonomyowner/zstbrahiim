import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

class DevLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

class DevRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  full_name: string;
}

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  wilaya?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

/**
 * Development authentication controller
 * Provides simple email/password auth for development and testing
 * DO NOT use in production - use Clerk authentication instead
 */
@ApiTags('dev-auth')
@Controller('v1/dev-auth')
export class DevAuthController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Generate a simple JWT-like token for development
   * Format: header.payload.signature (base64 encoded)
   */
  private generateDevToken(user: User): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: user.clerk_id,
      email: user.email,
      name: user.full_name,
      iat: now,
      exp: now + 7 * 24 * 60 * 60, // 7 days
    };

    // Simple base64 encoding (not cryptographically secure - dev only)
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = Buffer.from('dev_signature').toString('base64url');

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Development login - creates user if not exists' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: DevLoginDto) {
    const { email, password } = dto;

    // Simple password validation (just check it's not empty for dev)
    if (!password || password.length < 6) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find user by email
    let user = await this.usersRepository.findOne({
      where: { email },
    });

    // If user doesn't exist, auto-create for development
    if (!user) {
      const devClerkId = `dev_${email}`;

      user = this.usersRepository.create({
        clerk_id: devClerkId,
        email,
        full_name: email.split('@')[0], // Use email prefix as name
        role: UserRole.CUSTOMER,
        is_active: true,
      });

      await this.usersRepository.save(user);
    }

    // Generate token
    const access_token = this.generateDevToken(user);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        seller_category: user.seller_category,
        avatar_url: user.avatar_url,
        phone: user.phone,
        wilaya: user.wilaya,
        bio: user.bio,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Development registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'User already exists' })
  async register(@Body() dto: DevRegisterDto) {
    const { email, password, full_name } = dto;

    // Simple password validation
    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create new user
    const devClerkId = `dev_${email}`;

    const user = this.usersRepository.create({
      clerk_id: devClerkId,
      email,
      full_name,
      role: UserRole.CUSTOMER,
      is_active: true,
    });

    await this.usersRepository.save(user);

    // Generate token
    const access_token = this.generateDevToken(user);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        seller_category: user.seller_category,
        avatar_url: user.avatar_url,
        phone: user.phone,
        wilaya: user.wilaya,
        bio: user.bio,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    };
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      seller_category: user.seller_category,
      avatar_url: user.avatar_url,
      phone: user.phone,
      wilaya: user.wilaya,
      bio: user.bio,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  @Patch('me')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    const { full_name, phone, wilaya, bio } = dto;

    // Update only provided fields
    if (full_name !== undefined) {
      user.full_name = full_name;
    }
    if (phone !== undefined) {
      user.phone = phone;
    }
    if (wilaya !== undefined) {
      user.wilaya = wilaya;
    }
    if (bio !== undefined) {
      user.bio = bio;
    }

    user.updated_at = new Date();
    await this.usersRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      seller_category: user.seller_category,
      avatar_url: user.avatar_url,
      phone: user.phone,
      wilaya: user.wilaya,
      bio: user.bio,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
