import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SellerCategory } from '../../users/entities/user.entity';

/**
 * B2B Visibility Guard
 * Enforces the 3-tier seller hierarchy:
 * - Importateur (tier 1): Can sell to Grossiste and Fournisseur
 * - Grossiste (tier 2): Can buy from Importateur, sell to Fournisseur
 * - Fournisseur (tier 3): Can buy from Grossiste only
 */
@Injectable()
export class B2BVisibilityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.seller_category) {
      throw new ForbiddenException(
        'Only sellers can access B2B marketplace',
      );
    }

    // Store user category in request for later use
    request.sellerCategory = user.seller_category;

    return true;
  }

  /**
   * Check if a seller can see offers targeted at a specific category
   */
  static canSeeTargetCategory(
    sellerCategory: SellerCategory,
    targetCategory: SellerCategory,
  ): boolean {
    const visibilityRules = {
      [SellerCategory.IMPORTATEUR]: [
        SellerCategory.GROSSISTE,
        SellerCategory.FOURNISSEUR,
      ],
      [SellerCategory.GROSSISTE]: [
        SellerCategory.IMPORTATEUR,
        SellerCategory.FOURNISSEUR,
      ],
      [SellerCategory.FOURNISSEUR]: [SellerCategory.GROSSISTE],
    };

    const allowedTargets = visibilityRules[sellerCategory] || [];
    return allowedTargets.includes(targetCategory);
  }

  /**
   * Check if a seller can create offers targeted at a specific category
   */
  static canTargetCategory(
    sellerCategory: SellerCategory,
    targetCategory: SellerCategory,
  ): boolean {
    const targetRules = {
      [SellerCategory.IMPORTATEUR]: [
        SellerCategory.GROSSISTE,
        SellerCategory.FOURNISSEUR,
      ],
      [SellerCategory.GROSSISTE]: [SellerCategory.FOURNISSEUR],
      [SellerCategory.FOURNISSEUR]: [], // Cannot create offers
    };

    const allowedTargets = targetRules[sellerCategory] || [];
    return allowedTargets.includes(targetCategory);
  }

  /**
   * Check if a buyer can respond to an offer
   */
  static canRespondToOffer(
    buyerCategory: SellerCategory,
    offerTargetCategory: SellerCategory,
  ): boolean {
    // Buyer can respond if the offer is targeted at their category
    return buyerCategory === offerTargetCategory;
  }
}
