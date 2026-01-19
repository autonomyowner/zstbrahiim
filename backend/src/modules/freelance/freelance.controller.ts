import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FreelanceService } from './freelance.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ListServicesDto } from './dto/list-services.dto';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { CreateFreelancerOrderDto } from './dto/create-order.dto';
import { UpdateFreelancerOrderDto, DeliverOrderDto, ReviewOrderDto } from './dto/update-order.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

// ============================
// PUBLIC SERVICE BROWSING
// ============================

@ApiTags('freelance')
@Controller('v1/freelance/services')
export class FreelanceServicesController {
  constructor(private readonly freelanceService: FreelanceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Browse all freelancer services' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  async findAll(@Query() query: ListServicesDto) {
    return this.freelanceService.findAllServices(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('id') id: string) {
    return this.freelanceService.findServiceById(id);
  }

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get service by slug' })
  @ApiParam({ name: 'slug', description: 'Service slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.freelanceService.findServiceBySlug(slug);
  }

  @Get('freelancer/:freelancerId/portfolio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get freelancer portfolio' })
  @ApiParam({ name: 'freelancerId', description: 'Freelancer UUID' })
  async getPortfolio(@Param('freelancerId') freelancerId: string) {
    return this.freelanceService.getPortfolio(freelancerId);
  }
}

// ============================
// FREELANCER SERVICE MANAGEMENT
// ============================

@ApiTags('freelance')
@Controller('v1/freelancer/services')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('freelancer', 'admin')
@ApiBearerAuth()
export class FreelancerServicesController {
  constructor(private readonly freelanceService: FreelanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  async create(@Body() dto: CreateServiceDto, @CurrentUser() user: User) {
    return this.freelanceService.createService(dto, user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.updateService(id, dto, user);
  }

  @Post(':id/cover')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload service cover image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.uploadServiceMedia(id, file, 'cover', user);
  }

  @Post(':id/video')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload service intro video' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadVideo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.uploadServiceMedia(id, file, 'video', user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service (soft delete)' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.freelanceService.deleteService(id, user);
  }
}

// ============================
// FREELANCER PORTFOLIO MANAGEMENT
// ============================

@ApiTags('freelance')
@Controller('v1/freelancer/portfolio')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('freelancer', 'admin')
@ApiBearerAuth()
export class FreelancerPortfolioController {
  constructor(private readonly freelanceService: FreelanceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my portfolio' })
  async getMyPortfolio(@CurrentUser() user: User) {
    return this.freelanceService.getPortfolio(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add portfolio item (image or video)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', enum: ['image', 'video'] },
        title: { type: 'string' },
        description: { type: 'string' },
        service_id: { type: 'string' },
        display_order: { type: 'number' },
      },
      required: ['file', 'type'],
    },
  })
  async addItem(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePortfolioDto,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.addPortfolioItem(dto, file, user);
  }

  @Post(':id/thumbnail')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload thumbnail for video portfolio item' })
  async uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.uploadPortfolioThumbnail(id, file, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete portfolio item' })
  async deleteItem(@Param('id') id: string, @CurrentUser() user: User) {
    await this.freelanceService.deletePortfolioItem(id, user);
  }
}

// ============================
// CLIENT ORDERS
// ============================

@ApiTags('freelance')
@Controller('v1/freelance/orders')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class FreelanceOrdersController {
  constructor(private readonly freelanceService: FreelanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place an order for a service' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(
    @Body() dto: CreateFreelancerOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.createOrder(dto, user);
  }

  @Get('my-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my orders (as client)' })
  async getMyOrders(@CurrentUser() user: User) {
    return this.freelanceService.getClientOrders(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get order details' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async getOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return this.freelanceService.getOrderById(id, user);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status (cancel, complete, request revision)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFreelancerOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.updateOrderStatus(id, dto, user);
  }

  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Review completed order' })
  async reviewOrder(
    @Param('id') id: string,
    @Body() dto: ReviewOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.reviewOrder(id, dto, user);
  }
}

// ============================
// FREELANCER ORDER MANAGEMENT
// ============================

@ApiTags('freelance')
@Controller('v1/freelancer/orders')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('freelancer', 'admin')
@ApiBearerAuth()
export class FreelancerOrdersController {
  constructor(private readonly freelanceService: FreelanceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my orders (as freelancer)' })
  async getMyOrders(@CurrentUser() user: User) {
    return this.freelanceService.getFreelancerOrders(user.id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status (accept, start, deliver)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFreelancerOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.updateOrderStatus(id, dto, user);
  }

  @Post(':id/deliver')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Deliver order with files' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        message: { type: 'string' },
      },
    },
  })
  async deliverOrder(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: DeliverOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.freelanceService.deliverOrder(id, files || [], dto.message, user);
  }
}
