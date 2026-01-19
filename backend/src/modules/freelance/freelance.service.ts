import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  FreelancerService,
  ServiceStatus,
} from './entities/freelancer-service.entity';
import {
  FreelancerPortfolio,
  PortfolioItemType,
} from './entities/freelancer-portfolio.entity';
import {
  FreelancerOrder,
  FreelancerOrderStatus,
  PricingTier,
} from './entities/freelancer-order.entity';
import { User } from '../users/entities/user.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ListServicesDto } from './dto/list-services.dto';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { CreateFreelancerOrderDto } from './dto/create-order.dto';
import { UpdateFreelancerOrderDto, ReviewOrderDto } from './dto/update-order.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FreelanceService {
  constructor(
    @InjectRepository(FreelancerService)
    private servicesRepository: Repository<FreelancerService>,
    @InjectRepository(FreelancerPortfolio)
    private portfolioRepository: Repository<FreelancerPortfolio>,
    @InjectRepository(FreelancerOrder)
    private ordersRepository: Repository<FreelancerOrder>,
    private storageService: StorageService,
  ) {}

  // ============================
  // SERVICE METHODS
  // ============================

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36)
    );
  }

  async createService(
    dto: CreateServiceDto,
    user: User,
  ): Promise<FreelancerService> {
    if (user.role !== 'freelancer' && user.role !== 'admin') {
      throw new ForbiddenException('Only freelancers can create services');
    }

    const service = this.servicesRepository.create({
      ...dto,
      freelancer_id: user.id,
      slug: this.generateSlug(dto.title),
    });

    return this.servicesRepository.save(service);
  }

  async updateService(
    id: string,
    dto: UpdateServiceDto,
    user: User,
  ): Promise<FreelancerService> {
    const service = await this.servicesRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.freelancer_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only edit your own services');
    }

    // Update slug if title changed
    if (dto.title && dto.title !== service.title) {
      dto['slug'] = this.generateSlug(dto.title);
    }

    Object.assign(service, dto);
    return this.servicesRepository.save(service);
  }

  async uploadServiceMedia(
    serviceId: string,
    file: Express.Multer.File,
    type: 'cover' | 'video',
    user: User,
  ): Promise<FreelancerService> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.freelancer_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only edit your own services');
    }

    const folder = type === 'cover' ? 'freelance/covers' : 'freelance/videos';
    const result = await this.storageService.uploadFile(file, folder);

    if (type === 'cover') {
      // Delete old cover if exists
      if (service.cover_image_storage_path) {
        await this.storageService.deleteFile(service.cover_image_storage_path);
      }
      service.cover_image_url = result.url;
      service.cover_image_storage_path = result.key;
    } else {
      // Delete old video if exists
      if (service.intro_video_storage_path) {
        await this.storageService.deleteFile(service.intro_video_storage_path);
      }
      service.intro_video_url = result.url;
      service.intro_video_storage_path = result.key;
    }

    return this.servicesRepository.save(service);
  }

  async findAllServices(query: ListServicesDto) {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      freelancer_id,
      min_price,
      max_price,
      sort = 'newest',
    } = query;

    const queryBuilder = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.freelancer', 'freelancer')
      .leftJoinAndSelect('service.portfolio_items', 'portfolio')
      .where('service.status = :status', { status: ServiceStatus.ACTIVE });

    // Filters
    if (category) {
      queryBuilder.andWhere('service.category = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere(
        '(service.title ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (freelancer_id) {
      queryBuilder.andWhere('service.freelancer_id = :freelancer_id', {
        freelancer_id,
      });
    }

    if (min_price !== undefined) {
      queryBuilder.andWhere('service.price_basic >= :min_price', { min_price });
    }

    if (max_price !== undefined) {
      queryBuilder.andWhere('service.price_basic <= :max_price', { max_price });
    }

    // Sorting
    switch (sort) {
      case 'popular':
        queryBuilder.orderBy('service.orders_count', 'DESC');
        break;
      case 'rating':
        queryBuilder.orderBy('service.rating', 'DESC');
        break;
      case 'price_low':
        queryBuilder.orderBy('service.price_basic', 'ASC');
        break;
      case 'price_high':
        queryBuilder.orderBy('service.price_basic', 'DESC');
        break;
      default:
        queryBuilder.orderBy('service.created_at', 'DESC');
    }

    const total = await queryBuilder.getCount();
    const services = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: services,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findServiceById(id: string): Promise<FreelancerService> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['freelancer', 'portfolio_items'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Increment views
    service.views_count++;
    await this.servicesRepository.save(service);

    return service;
  }

  async findServiceBySlug(slug: string): Promise<FreelancerService> {
    const service = await this.servicesRepository.findOne({
      where: { slug },
      relations: ['freelancer', 'portfolio_items'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.views_count++;
    await this.servicesRepository.save(service);

    return service;
  }

  async deleteService(id: string, user: User): Promise<void> {
    const service = await this.servicesRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.freelancer_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own services');
    }

    service.status = ServiceStatus.DELETED;
    await this.servicesRepository.save(service);
  }

  // ============================
  // PORTFOLIO METHODS
  // ============================

  async addPortfolioItem(
    dto: CreatePortfolioDto,
    file: Express.Multer.File,
    user: User,
  ): Promise<FreelancerPortfolio> {
    if (user.role !== 'freelancer' && user.role !== 'admin') {
      throw new ForbiddenException('Only freelancers can add portfolio items');
    }

    // Verify service belongs to user if provided
    if (dto.service_id) {
      const service = await this.servicesRepository.findOne({
        where: { id: dto.service_id },
      });
      if (!service || service.freelancer_id !== user.id) {
        throw new BadRequestException('Invalid service ID');
      }
    }

    // Upload file
    const folder =
      dto.type === PortfolioItemType.VIDEO
        ? 'freelance/portfolio/videos'
        : 'freelance/portfolio/images';
    const result = await this.storageService.uploadFile(file, folder);

    const portfolio = this.portfolioRepository.create({
      ...dto,
      freelancer_id: user.id,
      media_url: result.url,
      storage_path: result.key,
      file_size_bytes: file.size,
    });

    return this.portfolioRepository.save(portfolio);
  }

  async uploadPortfolioThumbnail(
    portfolioId: string,
    file: Express.Multer.File,
    user: User,
  ): Promise<FreelancerPortfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (portfolio.freelancer_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only edit your own portfolio');
    }

    const result = await this.storageService.uploadFile(
      file,
      'freelance/portfolio/thumbnails',
    );

    if (portfolio.thumbnail_storage_path) {
      await this.storageService.deleteFile(portfolio.thumbnail_storage_path);
    }

    portfolio.thumbnail_url = result.url;
    portfolio.thumbnail_storage_path = result.key;

    return this.portfolioRepository.save(portfolio);
  }

  async getPortfolio(freelancerId: string): Promise<FreelancerPortfolio[]> {
    return this.portfolioRepository.find({
      where: { freelancer_id: freelancerId },
      order: { display_order: 'ASC', created_at: 'DESC' },
    });
  }

  async deletePortfolioItem(id: string, user: User): Promise<void> {
    const item = await this.portfolioRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (item.freelancer_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own portfolio');
    }

    // Delete files from storage
    await this.storageService.deleteFile(item.storage_path);
    if (item.thumbnail_storage_path) {
      await this.storageService.deleteFile(item.thumbnail_storage_path);
    }

    await this.portfolioRepository.remove(item);
  }

  // ============================
  // ORDER METHODS
  // ============================

  async createOrder(
    dto: CreateFreelancerOrderDto,
    user: User,
  ): Promise<FreelancerOrder> {
    const service = await this.servicesRepository.findOne({
      where: { id: dto.service_id, status: ServiceStatus.ACTIVE },
    });

    if (!service) {
      throw new NotFoundException('Service not found or not available');
    }

    if (service.freelancer_id === user.id) {
      throw new BadRequestException('You cannot order your own service');
    }

    // Determine price based on tier
    let amount: number;
    let deliveryDays: number;

    switch (dto.pricing_tier) {
      case PricingTier.STANDARD:
        if (!service.price_standard) {
          throw new BadRequestException('Standard tier not available');
        }
        amount = service.price_standard;
        deliveryDays = service.standard_delivery_days;
        break;
      case PricingTier.PREMIUM:
        if (!service.price_premium) {
          throw new BadRequestException('Premium tier not available');
        }
        amount = service.price_premium;
        deliveryDays = service.premium_delivery_days;
        break;
      default:
        amount = service.price_basic;
        deliveryDays = service.basic_delivery_days;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + deliveryDays);

    const order = this.ordersRepository.create({
      service_id: service.id,
      freelancer_id: service.freelancer_id,
      client_id: user.id,
      pricing_tier: dto.pricing_tier,
      amount,
      requirements: dto.requirements,
      due_date: dueDate,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Increment service orders count
    service.orders_count++;
    await this.servicesRepository.save(service);

    return savedOrder;
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateFreelancerOrderDto,
    user: User,
  ): Promise<FreelancerOrder> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['service'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isFreelancer = order.freelancer_id === user.id;
    const isClient = order.client_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isFreelancer && !isClient && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    // Validate status transitions
    if (dto.status) {
      this.validateStatusTransition(order.status, dto.status, isFreelancer);
    }

    if (dto.status === FreelancerOrderStatus.DELIVERED) {
      order.delivered_at = new Date();
    }

    if (dto.status === FreelancerOrderStatus.COMPLETED) {
      order.completed_at = new Date();
    }

    Object.assign(order, dto);
    return this.ordersRepository.save(order);
  }

  private validateStatusTransition(
    current: FreelancerOrderStatus,
    next: FreelancerOrderStatus,
    isFreelancer: boolean,
  ) {
    const freelancerTransitions = {
      [FreelancerOrderStatus.PENDING]: [
        FreelancerOrderStatus.ACCEPTED,
        FreelancerOrderStatus.CANCELLED,
      ],
      [FreelancerOrderStatus.ACCEPTED]: [FreelancerOrderStatus.IN_PROGRESS],
      [FreelancerOrderStatus.IN_PROGRESS]: [FreelancerOrderStatus.DELIVERED],
      [FreelancerOrderStatus.REVISION_REQUESTED]: [
        FreelancerOrderStatus.DELIVERED,
      ],
    };

    const clientTransitions = {
      [FreelancerOrderStatus.PENDING]: [FreelancerOrderStatus.CANCELLED],
      [FreelancerOrderStatus.DELIVERED]: [
        FreelancerOrderStatus.COMPLETED,
        FreelancerOrderStatus.REVISION_REQUESTED,
      ],
    };

    const allowed = isFreelancer
      ? freelancerTransitions[current]
      : clientTransitions[current];

    if (!allowed || !allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from ${current} to ${next}`,
      );
    }
  }

  async deliverOrder(
    orderId: string,
    files: Express.Multer.File[],
    message: string,
    user: User,
  ): Promise<FreelancerOrder> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.freelancer_id !== user.id) {
      throw new ForbiddenException('Only the freelancer can deliver');
    }

    if (
      order.status !== FreelancerOrderStatus.IN_PROGRESS &&
      order.status !== FreelancerOrderStatus.REVISION_REQUESTED
    ) {
      throw new BadRequestException('Order is not in progress');
    }

    // Upload delivery files
    const deliveryFiles = [];
    for (const file of files) {
      const result = await this.storageService.uploadFile(
        file,
        'freelance/deliveries',
      );
      deliveryFiles.push({
        url: result.url,
        name: file.originalname,
        type: file.mimetype,
      });
    }

    order.delivery_files = deliveryFiles;
    order.freelancer_notes = message;
    order.status = FreelancerOrderStatus.DELIVERED;
    order.delivered_at = new Date();

    return this.ordersRepository.save(order);
  }

  async reviewOrder(
    orderId: string,
    dto: ReviewOrderDto,
    user: User,
  ): Promise<FreelancerOrder> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['service'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.client_id !== user.id) {
      throw new ForbiddenException('Only the client can review');
    }

    if (order.status !== FreelancerOrderStatus.COMPLETED) {
      throw new BadRequestException('Order must be completed to review');
    }

    if (order.rating) {
      throw new BadRequestException('Order already reviewed');
    }

    order.rating = dto.rating;
    order.review = dto.review;
    await this.ordersRepository.save(order);

    // Update service rating
    const reviews = await this.ordersRepository.find({
      where: {
        service_id: order.service_id,
        rating: MoreThanOrEqual(1),
      },
    });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    order.service.rating = Math.round(avgRating * 100) / 100;
    order.service.reviews_count = reviews.length;
    await this.servicesRepository.save(order.service);

    return order;
  }

  async getClientOrders(userId: string): Promise<FreelancerOrder[]> {
    return this.ordersRepository.find({
      where: { client_id: userId },
      relations: ['service', 'freelancer'],
      order: { created_at: 'DESC' },
    });
  }

  async getFreelancerOrders(userId: string): Promise<FreelancerOrder[]> {
    return this.ordersRepository.find({
      where: { freelancer_id: userId },
      relations: ['service', 'client'],
      order: { created_at: 'DESC' },
    });
  }

  async getOrderById(orderId: string, user: User): Promise<FreelancerOrder> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['service', 'freelancer', 'client'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      order.freelancer_id !== user.id &&
      order.client_id !== user.id &&
      user.role !== 'admin'
    ) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }
}
