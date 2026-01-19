import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  /**
   * Get user's cart with all items
   */
  async getCart(userId: string) {
    const cartItems = await this.cartItemsRepository.find({
      where: { user_id: userId },
      relations: ['product', 'product.images', 'product.seller'],
      order: { created_at: 'DESC' },
    });

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const total_items = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: cartItems,
      summary: {
        subtotal,
        total_items,
        items_count: cartItems.length,
      },
    };
  }

  /**
   * Add item to cart (or update quantity if already exists)
   */
  async addItem(userId: string, addToCartDto: AddToCartDto) {
    const { product_id, quantity } = addToCartDto;

    // Validate product exists and is in stock
    const product = await this.productsRepository.findOne({
      where: { id: product_id },
      relations: ['seller', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    if (!product.in_stock) {
      throw new BadRequestException(`Product "${product.name}" is out of stock`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    // Check if item already in cart
    let cartItem = await this.cartItemsRepository.findOne({
      where: { user_id: userId, product_id },
    });

    if (cartItem) {
      // Update existing item
      const newQuantity = cartItem.quantity + quantity;

      // Validate new quantity doesn't exceed stock
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Cannot add more. Maximum available: ${product.stock}`,
        );
      }

      cartItem.quantity = newQuantity;
      cartItem.product_name = product.name; // Update denormalized data
      cartItem.product_price = product.price;
      cartItem.product_image = product.images?.[0]?.image_url || null;

      await this.cartItemsRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemsRepository.create({
        user_id: userId,
        product_id,
        seller_id: product.seller_id,
        quantity,
        // Denormalize product data
        product_name: product.name,
        product_price: product.price,
        product_image: product.images?.[0]?.image_url || null,
      });

      await this.cartItemsRepository.save(cartItem);
    }

    // Fetch and return updated cart item with relations
    const updatedItem = await this.cartItemsRepository.findOne({
      where: { id: cartItem.id },
      relations: ['product', 'product.images', 'product.seller'],
    });

    return {
      message: 'Item added to cart successfully',
      item: updatedItem,
    };
  }

  /**
   * Update cart item quantity
   */
  async updateItem(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const { quantity } = updateCartItemDto;

    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: itemId, user_id: userId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    // Validate stock availability
    if (quantity > cartItem.product.stock) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${cartItem.product.stock}`,
      );
    }

    // Update quantity and denormalized data
    cartItem.quantity = quantity;
    cartItem.product_name = cartItem.product.name;
    cartItem.product_price = cartItem.product.price;

    await this.cartItemsRepository.save(cartItem);

    // Fetch updated item with relations
    const updatedItem = await this.cartItemsRepository.findOne({
      where: { id: itemId },
      relations: ['product', 'product.images', 'product.seller'],
    });

    return {
      message: 'Cart item updated successfully',
      item: updatedItem,
    };
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: itemId, user_id: userId },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    await this.cartItemsRepository.remove(cartItem);

    return {
      message: 'Item removed from cart successfully',
      id: itemId,
    };
  }

  /**
   * Clear entire cart for user
   */
  async clearCart(userId: string) {
    const result = await this.cartItemsRepository.delete({ user_id: userId });

    return {
      message: 'Cart cleared successfully',
      items_removed: result.affected || 0,
    };
  }

  /**
   * Get cart item count for user
   */
  async getCartCount(userId: string): Promise<number> {
    const items = await this.cartItemsRepository.find({
      where: { user_id: userId },
    });

    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
