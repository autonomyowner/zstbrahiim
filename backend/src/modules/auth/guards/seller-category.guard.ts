import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SELLER_CATEGORIES_KEY = 'seller_categories';

/**
 * Guard to check if seller has required category
 * Used for B2B hierarchy enforcement
 * Usage: @RequireSellerCategory('importateur', 'grossiste')
 */
@Injectable()
export class SellerCategoryGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredCategories = this.reflector.getAllAndOverride<string[]>(
      SELLER_CATEGORIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredCategories || requiredCategories.length === 0) {
      return true; // No category restriction
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user is a seller
    if (user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can access this resource');
    }

    // Check if seller has required category
    if (!user.seller_category) {
      throw new ForbiddenException('Seller category not set');
    }

    const hasCategory = requiredCategories.includes(user.seller_category);

    if (!hasCategory) {
      throw new ForbiddenException(
        `Access denied. Required seller category: ${requiredCategories.join(' or ')}. Your category: ${user.seller_category}`,
      );
    }

    return true;
  }
}
