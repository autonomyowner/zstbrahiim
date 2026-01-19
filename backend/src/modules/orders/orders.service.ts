import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { User } from '../users/entities/user.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  /**
   * Generate unique order number: ZST-{timestamp}-{random}
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ZST-${timestamp}-${random}`;
  }

  /**
   * Create a new order (supports guest checkout)
   */
  async create(createOrderDto: CreateOrderDto, user?: User) {
    const {
      customer_name,
      customer_phone,
      shipping_address,
      customer_wilaya,
      customer_email,
      notes,
      payment_method,
      items,
    } = createOrderDto;

    // Validate all products exist and are in stock
    const productIds = items.map((item) => item.product_id);
    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
      relations: ['seller'],
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Create a map for quick product lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate stock availability and calculate totals
    let subtotal = 0;
    const orderItemsData: Array<{
      product_id: string;
      seller_id: string;
      quantity: number;
      product_name: string;
      product_price: number;
      product_image: string | null;
      product_sku: string;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);

      if (!product) {
        throw new BadRequestException(`Product ${item.product_id} not found`);
      }

      if (!product.in_stock) {
        throw new BadRequestException(`Product "${product.name}" is out of stock`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }

      // Check minimum order quantity
      if (product.min_order_quantity && item.quantity < product.min_order_quantity) {
        throw new BadRequestException(
          `Minimum order quantity for "${product.name}" is ${product.min_order_quantity}`,
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        product_id: product.id,
        seller_id: product.seller_id,
        quantity: item.quantity,
        // Denormalize product data (snapshot at order time)
        product_name: product.name,
        product_price: product.price,
        product_image: product.images?.[0]?.image_url || null,
        product_sku: product.sku,
        subtotal: itemTotal,
      });
    }

    // Calculate shipping (simplified - could be based on wilaya)
    const shipping_cost = 500; // 500 DZD flat rate for now
    const total = subtotal + shipping_cost;

    // Group items by seller to create separate orders for each seller
    const ordersBySeller = new Map<string, typeof orderItemsData[number][]>();

    for (const itemData of orderItemsData) {
      const sellerId = itemData.seller_id;
      if (!ordersBySeller.has(sellerId)) {
        ordersBySeller.set(sellerId, []);
      }
      ordersBySeller.get(sellerId).push(itemData);
    }

    // Create orders (one per seller)
    const createdOrders = [];

    for (const [sellerId, sellerItems] of ordersBySeller) {
      const orderSubtotal = sellerItems.reduce((sum, item) => sum + item.subtotal, 0);
      const orderTotal = orderSubtotal + shipping_cost;

      // Create order
      const order = this.ordersRepository.create({
        order_number: this.generateOrderNumber(),
        user_id: user?.id || null, // Null for guest checkout
        seller_id: sellerId,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,
        customer_wilaya,
        notes,
        payment_method,
        subtotal: orderSubtotal,
        shipping_cost,
        total: orderTotal,
        status: OrderStatus.PENDING,
        payment_status: payment_method === 'cod' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
      });

      const savedOrder: Order = await this.ordersRepository.save(order);

      // Create order items
      const orderItems: OrderItem[] = sellerItems.map((itemData) =>
        this.orderItemsRepository.create({
          ...itemData,
          order_id: savedOrder.id,
        }),
      );

      await this.orderItemsRepository.save(orderItems);

      // Update product stock
      for (const itemData of sellerItems) {
        await this.productsRepository.decrement(
          { id: itemData.product_id },
          'stock',
          itemData.quantity,
        );

        // Update in_stock flag if stock reaches 0
        const product = await this.productsRepository.findOne({
          where: { id: itemData.product_id },
        });
        if (product.stock === 0) {
          product.in_stock = false;
          await this.productsRepository.save(product);
        }
      }

      // Fetch complete order with items
      const completeOrder = await this.findOne(savedOrder.id, user);
      createdOrders.push(completeOrder);

      // Broadcast new order to seller in real-time
      this.realtimeGateway.broadcastNewOrder(sellerId, completeOrder);
    }

    return {
      message: 'Order(s) created successfully',
      orders: createdOrders,
    };
  }

  /**
   * Find order by ID
   */
  async findOne(id: string, user?: User) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'seller', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Authorization check
    if (user) {
      const isOwner = order.user_id === user.id;
      const isSeller = order.seller_id === user.id;
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isSeller && !isAdmin) {
        throw new ForbiddenException('You do not have access to this order');
      }
    } else {
      // For guest orders, only allow access via phone number verification
      // This would typically require a separate endpoint with phone verification
    }

    return order;
  }

  /**
   * Find all orders for a user
   */
  async findUserOrders(userId: string, query: ListOrdersDto) {
    const { page, limit, status } = query;

    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.seller', 'seller')
      .where('order.user_id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    queryBuilder.orderBy('order.created_at', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find all orders for a seller
   */
  async findSellerOrders(sellerId: string, query: ListOrdersDto) {
    const { page, limit, status } = query;

    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.seller_id = :sellerId', { sellerId });

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    queryBuilder.orderBy('order.created_at', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find orders by customer phone (for guest checkout tracking)
   */
  async findByPhone(phone: string, query: ListOrdersDto) {
    const { page, limit, status } = query;

    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.seller', 'seller')
      .where('order.customer_phone = :phone', { phone });

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    queryBuilder.orderBy('order.created_at', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order status (seller only)
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
    user: User,
  ) {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Verify seller owns this order or user is admin
    if (order.seller_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own orders');
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned'],
      cancelled: [],
      returned: [],
    };

    const allowedStatuses = validTransitions[order.status] || [];
    if (!allowedStatuses.includes(updateStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${updateStatusDto.status}`,
      );
    }

    // Update status
    order.status = updateStatusDto.status;

    // Update payment status if delivered
    if (updateStatusDto.status === OrderStatus.DELIVERED && order.payment_method === 'cod') {
      order.payment_status = PaymentStatus.PAID;
    }

    const updatedOrder = await this.ordersRepository.save(order);

    // Fetch complete order data with relations
    const completeOrder = await this.findOne(updatedOrder.id, user);

    // Broadcast real-time order status update
    this.realtimeGateway.broadcastOrderStatusUpdate(
      updatedOrder.id,
      updatedOrder.status,
      completeOrder,
    );

    return completeOrder;
  }

  /**
   * Cancel order (customer or seller)
   */
  async cancel(id: string, user: User) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Verify authorization
    const isOwner = order.user_id === user.id;
    const isSeller = order.seller_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isSeller && !isAdmin) {
      throw new ForbiddenException('You cannot cancel this order');
    }

    // Can only cancel if pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BadRequestException(
        'Order can only be cancelled if it is pending or confirmed',
      );
    }

    // Restore product stock
    for (const item of order.items) {
      await this.productsRepository.increment(
        { id: item.product_id },
        'stock',
        item.quantity,
      );

      // Update in_stock flag
      const product = await this.productsRepository.findOne({
        where: { id: item.product_id },
      });
      if (product.stock > 0) {
        product.in_stock = true;
        await this.productsRepository.save(product);
      }
    }

    // Update order status
    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await this.ordersRepository.save(order);

    // Fetch complete order data
    const completeOrder = await this.findOne(updatedOrder.id, user);

    // Broadcast cancellation in real-time
    this.realtimeGateway.broadcastOrderStatusUpdate(
      updatedOrder.id,
      'cancelled',
      completeOrder,
    );

    return completeOrder;
  }
}
