import {
  Controller,
  Get,
  Post,
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
import { B2BService } from './b2b.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { ListOffersDto } from './dto/list-offers.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { B2BVisibilityGuard } from './guards/b2b-visibility.guard';

@ApiTags('b2b')
@Controller('v1/b2b')
@UseGuards(ClerkAuthGuard, B2BVisibilityGuard)
@ApiBearerAuth()
export class B2BController {
  constructor(private readonly b2bService: B2BService) {}

  /**
   * Get all B2B offers (filtered by seller hierarchy)
   */
  @Get('offers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get B2B offers (filtered by seller category)',
    description:
      'Returns offers visible to your seller category based on hierarchy rules',
  })
  @ApiResponse({
    status: 200,
    description: 'Offers retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only sellers can access B2B marketplace',
  })
  async findAll(@Query() query: ListOffersDto, @CurrentUser() user: User) {
    return this.b2bService.findAll(query, user);
  }

  /**
   * Get offer by ID
   */
  @Get('offers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get offer details' })
  @ApiParam({ name: 'id', description: 'Offer UUID' })
  @ApiResponse({
    status: 200,
    description: 'Offer retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You cannot view this offer',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.b2bService.findOne(id, user);
  }

  /**
   * Create new B2B offer (seller only)
   */
  @Post('offers')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  @ApiOperation({
    summary: 'Create B2B offer (seller only)',
    description:
      'Create wholesale offer. Importateurs can sell to all, Grossistes to Fournisseurs only',
  })
  @ApiResponse({
    status: 201,
    description: 'Offer created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or dates',
  })
  @ApiResponse({
    status: 403,
    description: 'Your seller category cannot target this category',
  })
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @CurrentUser() user: User,
  ) {
    return this.b2bService.createOffer(createOfferDto, user);
  }

  /**
   * Submit bid or negotiation
   */
  @Post('offers/:id/respond')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit bid or negotiation',
    description: 'Submit response to an offer (must match target category)',
  })
  @ApiParam({ name: 'id', description: 'Offer UUID' })
  @ApiResponse({
    status: 201,
    description: 'Response submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid quantity or bid amount',
  })
  @ApiResponse({
    status: 403,
    description: 'Your seller category cannot respond to this offer',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async submitResponse(
    @Param('id') id: string,
    @Body() submitResponseDto: SubmitResponseDto,
    @CurrentUser() user: User,
  ) {
    return this.b2bService.submitResponse(id, submitResponseDto, user);
  }

  /**
   * Get my offers (as seller)
   */
  @Get('my-offers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get your created offers' })
  @ApiResponse({
    status: 200,
    description: 'Offers retrieved successfully',
  })
  async getMyOffers(@Query() query: ListOffersDto, @CurrentUser() user: User) {
    return this.b2bService.getMyOffers(user, query);
  }

  /**
   * Get my responses (as buyer)
   */
  @Get('my-responses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get your submitted bids/negotiations' })
  @ApiResponse({
    status: 200,
    description: 'Responses retrieved successfully',
  })
  async getMyResponses(
    @Query() query: ListOffersDto,
    @CurrentUser() user: User,
  ) {
    return this.b2bService.getMyResponses(user, query);
  }
}
