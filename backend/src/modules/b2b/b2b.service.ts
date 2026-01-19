import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { B2BOffer, B2BOfferStatus, B2BOfferType } from './entities/b2b-offer.entity';
import { B2BResponse, B2BResponseStatus, B2BResponseType } from './entities/b2b-response.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { ListOffersDto } from './dto/list-offers.dto';
import { User } from '../users/entities/user.entity';
import { B2BVisibilityGuard } from './guards/b2b-visibility.guard';

@Injectable()
export class B2BService {
  constructor(
    @InjectRepository(B2BOffer)
    private offersRepository: Repository<B2BOffer>,
    @InjectRepository(B2BResponse)
    private responsesRepository: Repository<B2BResponse>,
  ) {}

  /**
   * Create a new B2B offer (with hierarchy validation)
   */
  async createOffer(createOfferDto: CreateOfferDto, user: User) {
    // Validate user is a seller
    if (!user.seller_category) {
      throw new ForbiddenException('Only sellers can create B2B offers');
    }

    // Validate seller can target this category
    if (
      !B2BVisibilityGuard.canTargetCategory(
        user.seller_category,
        createOfferDto.target_category,
      )
    ) {
      throw new ForbiddenException(
        `Your seller category (${user.seller_category}) cannot create offers for ${createOfferDto.target_category}`,
      );
    }

    // Validate auction dates if offer type is auction
    if (createOfferDto.offer_type === B2BOfferType.AUCTION) {
      if (!createOfferDto.starts_at || !createOfferDto.ends_at) {
        throw new BadRequestException(
          'Auction offers must have start and end dates',
        );
      }

      const now = new Date();
      const startsAt = new Date(createOfferDto.starts_at);
      const endsAt = new Date(createOfferDto.ends_at);

      if (startsAt >= endsAt) {
        throw new BadRequestException('End date must be after start date');
      }

      if (endsAt <= now) {
        throw new BadRequestException('End date must be in the future');
      }
    }

    // Create offer
    const offer = this.offersRepository.create({
      ...createOfferDto,
      seller_id: user.id,
      status: B2BOfferStatus.ACTIVE,
      starts_at: createOfferDto.starts_at
        ? new Date(createOfferDto.starts_at)
        : null,
      ends_at: createOfferDto.ends_at ? new Date(createOfferDto.ends_at) : null,
    });

    const savedOffer = await this.offersRepository.save(offer);

    return this.findOne(savedOffer.id, user);
  }

  /**
   * Find all offers (filtered by seller hierarchy)
   */
  async findAll(query: ListOffersDto, user: User) {
    const { page, limit, offer_type, status, target_category } = query;

    // Validate user is a seller
    if (!user.seller_category) {
      throw new ForbiddenException('Only sellers can access B2B marketplace');
    }

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.seller', 'seller')
      .leftJoinAndSelect('offer.responses', 'responses');

    // Apply hierarchy filter - only show offers user can see
    if (target_category) {
      // User explicitly filtering by category
      if (
        !B2BVisibilityGuard.canSeeTargetCategory(
          user.seller_category,
          target_category,
        )
      ) {
        throw new ForbiddenException(
          `Your seller category cannot view offers for ${target_category}`,
        );
      }
      queryBuilder.andWhere('offer.target_category = :target_category', {
        target_category,
      });
    } else {
      // Show all offers visible to user's category
      const visibleCategories = this.getVisibleCategoriesForSeller(
        user.seller_category,
      );
      if (visibleCategories.length > 0) {
        queryBuilder.andWhere('offer.target_category IN (:...categories)', {
          categories: visibleCategories,
        });
      }
    }

    // Apply other filters
    if (offer_type) {
      queryBuilder.andWhere('offer.offer_type = :offer_type', { offer_type });
    }

    if (status) {
      queryBuilder.andWhere('offer.status = :status', { status });
    } else {
      // Default: only show active offers
      queryBuilder.andWhere('offer.status = :status', {
        status: B2BOfferStatus.ACTIVE,
      });
    }

    // Order by created date
    queryBuilder.orderBy('offer.created_at', 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [offers, total] = await queryBuilder.getManyAndCount();

    return {
      data: offers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find offer by ID
   */
  async findOne(id: string, user: User) {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: ['seller', 'responses', 'responses.buyer', 'highest_bidder'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Check if user can see this offer
    if (
      user.seller_category &&
      !B2BVisibilityGuard.canSeeTargetCategory(
        user.seller_category,
        offer.target_category,
      ) &&
      offer.seller_id !== user.id
    ) {
      throw new ForbiddenException('You cannot view this offer');
    }

    return offer;
  }

  /**
   * Submit bid/negotiation response
   */
  async submitResponse(
    offerId: string,
    submitResponseDto: SubmitResponseDto,
    user: User,
  ) {
    // Validate user is a seller
    if (!user.seller_category) {
      throw new ForbiddenException('Only sellers can respond to offers');
    }

    const offer = await this.findOne(offerId, user);

    // Check if offer is still active
    if (offer.status !== B2BOfferStatus.ACTIVE) {
      throw new BadRequestException('This offer is no longer active');
    }

    // Check if user can respond (must match target category)
    if (
      !B2BVisibilityGuard.canRespondToOffer(
        user.seller_category,
        offer.target_category,
      )
    ) {
      throw new ForbiddenException(
        `Only ${offer.target_category} can respond to this offer`,
      );
    }

    // Validate quantity
    if (submitResponseDto.quantity < offer.min_quantity) {
      throw new BadRequestException(
        `Quantity must be at least ${offer.min_quantity}`,
      );
    }

    if (submitResponseDto.quantity > offer.available_quantity) {
      throw new BadRequestException(
        `Requested quantity exceeds available quantity`,
      );
    }

    // For auction type, validate bid amount
    if (
      offer.offer_type === B2BOfferType.AUCTION &&
      submitResponseDto.response_type === B2BResponseType.BID
    ) {
      const minBid = offer.current_bid || offer.base_price;
      if (submitResponseDto.amount <= minBid) {
        throw new BadRequestException(
          `Bid must be higher than current bid (${minBid} DZD)`,
        );
      }

      // Update highest bid
      offer.current_bid = submitResponseDto.amount;
      offer.highest_bidder_id = user.id;
      await this.offersRepository.save(offer);

      // Mark previous bids as outbid
      await this.responsesRepository.update(
        { offer_id: offerId, status: B2BResponseStatus.PENDING },
        { status: B2BResponseStatus.OUTBID },
      );
    }

    // Create response
    const response = this.responsesRepository.create({
      offer_id: offerId,
      buyer_id: user.id,
      ...submitResponseDto,
      status: B2BResponseStatus.PENDING,
    });

    await this.responsesRepository.save(response);

    return {
      message: 'Response submitted successfully',
      response,
    };
  }

  /**
   * Get offers created by current seller
   */
  async getMyOffers(user: User, query: ListOffersDto) {
    const { page, limit, status } = query;

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.responses', 'responses')
      .leftJoinAndSelect('responses.buyer', 'buyer')
      .where('offer.seller_id = :sellerId', { sellerId: user.id });

    if (status) {
      queryBuilder.andWhere('offer.status = :status', { status });
    }

    queryBuilder.orderBy('offer.created_at', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [offers, total] = await queryBuilder.getManyAndCount();

    return {
      data: offers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get responses submitted by current buyer
   */
  async getMyResponses(user: User, query: ListOffersDto) {
    const { page, limit } = query;

    const queryBuilder = this.responsesRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.offer', 'offer')
      .leftJoinAndSelect('offer.seller', 'seller')
      .where('response.buyer_id = :buyerId', { buyerId: user.id });

    queryBuilder.orderBy('response.created_at', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [responses, total] = await queryBuilder.getManyAndCount();

    return {
      data: responses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Helper: Get visible categories for a seller
   */
  private getVisibleCategoriesForSeller(sellerCategory: string): string[] {
    const visibilityMap = {
      importateur: ['grossiste', 'fournisseur'],
      grossiste: ['importateur', 'fournisseur'],
      fournisseur: ['grossiste'],
    };

    return visibilityMap[sellerCategory] || [];
  }
}
