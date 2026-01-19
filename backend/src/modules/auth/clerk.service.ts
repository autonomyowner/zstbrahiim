import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import Clerk from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured');
    }

    // Set Clerk secret key via environment variable
    process.env.CLERK_API_KEY = secretKey;
  }

  /**
   * Verify Clerk JWT token and return payload
   * For Clerk v4, we simply decode the JWT without verification for now
   * In production, implement proper JWT verification with Clerk's public key
   */
  async verifyToken(token: string): Promise<any> {
    try {
      // For development: decode JWT without verification
      // Extract payload from JWT (format: header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid token format');
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8'),
      );

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException(
        `Token verification failed: ${error.message}`,
      );
    }
  }

  /**
   * Get or create user from Clerk user ID
   */
  async findOrCreateUser(clerkUserId: string): Promise<User> {
    // Check if user exists in our database
    let user = await this.usersRepository.findOne({
      where: { clerk_id: clerkUserId },
    });

    if (user) {
      return user;
    }

    // If clerk_id starts with "dev_", this is a dev user that should exist
    // Don't try to fetch from Clerk API - throw error instead
    if (clerkUserId.startsWith('dev_')) {
      throw new UnauthorizedException(
        'Development user not found. Please register first using /api/v1/auth/register',
      );
    }

    // Fetch user data from Clerk
    try {
      const clerkUser = await Clerk.users.getUser(clerkUserId);

      // Extract email and name
      const email =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress || null;
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || email || 'User';

      // Create new user in our database
      user = this.usersRepository.create({
        clerk_id: clerkUserId,
        email,
        full_name: fullName,
        phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
        role: UserRole.CUSTOMER, // Default role
        is_active: true,
      });

      await this.usersRepository.save(user);

      return user;
    } catch (error) {
      throw new UnauthorizedException(
        `Failed to fetch user from Clerk: ${error.message}`,
      );
    }
  }

  /**
   * Sync user data from Clerk webhook
   */
  async syncUserFromWebhook(clerkUser: any): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { clerk_id: clerkUser.id },
    });

    const email =
      clerkUser.email_addresses?.find(
        (e) => e.id === clerkUser.primary_email_address_id,
      )?.email_address || null;
    const firstName = clerkUser.first_name || '';
    const lastName = clerkUser.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || email || 'User';

    if (user) {
      // Update existing user
      user.email = email;
      user.full_name = fullName;
      user.phone = clerkUser.primary_phone_number?.phone_number || user.phone;
      user.updated_at = new Date();
    } else {
      // Create new user
      user = this.usersRepository.create({
        clerk_id: clerkUser.id,
        email,
        full_name: fullName,
        phone: clerkUser.primary_phone_number?.phone_number || null,
        role: UserRole.CUSTOMER,
        is_active: true,
      });
    }

    return this.usersRepository.save(user);
  }

  /**
   * Delete user (from webhook)
   */
  async deleteUser(clerkUserId: string): Promise<void> {
    await this.usersRepository.update(
      { clerk_id: clerkUserId },
      { is_active: false, deleted_at: new Date() },
    );
  }

  /**
   * Update user role in database and Clerk publicMetadata
   */
  async updateUserRole(
    user: User,
    role: 'customer' | 'seller' | 'freelancer',
    sellerCategory?: string,
  ): Promise<User> {
    // Update in our database
    user.role = role as UserRole;
    if (sellerCategory && role === 'seller') {
      user.seller_category = sellerCategory as any;
    }
    await this.usersRepository.save(user);

    // Update Clerk publicMetadata (so it's included in JWT)
    try {
      const metadata: any = { role };
      if (sellerCategory && role === 'seller') {
        metadata.seller_category = sellerCategory;
      }

      await Clerk.users.updateUser(user.clerk_id, {
        publicMetadata: metadata,
      });

      console.log(`[ClerkService] Updated role for user ${user.id} to ${role}`);
    } catch (error) {
      console.error('[ClerkService] Failed to update Clerk metadata:', error.message);
      // Don't fail - database is already updated
    }

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(
    payload: string,
    headers: Record<string, string>,
  ): Promise<boolean> {
    try {
      const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

      if (!webhookSecret) {
        console.warn('CLERK_WEBHOOK_SECRET not configured, skipping signature verification');
        return true; // Allow in development
      }

      // Clerk webhook signature verification
      // The signature is in the 'svix-signature' header
      const signature = headers['svix-signature'];
      const timestamp = headers['svix-timestamp'];
      const id = headers['svix-id'];

      if (!signature || !timestamp || !id) {
        return false;
      }

      // For now, we'll accept webhooks in development
      // In production, implement proper Svix signature verification
      return true;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}
