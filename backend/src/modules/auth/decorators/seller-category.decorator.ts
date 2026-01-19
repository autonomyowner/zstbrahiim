import { SetMetadata } from '@nestjs/common';
import { SELLER_CATEGORIES_KEY } from '../guards/seller-category.guard';

/**
 * Decorator to specify required seller category for a route
 * Usage: @RequireSellerCategory('importateur', 'grossiste')
 */
export const RequireSellerCategory = (...categories: string[]) =>
  SetMetadata(SELLER_CATEGORIES_KEY, categories);
