import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ClerkService } from '../clerk.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private clerkService: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format. Expected: Bearer <token>');
    }

    try {
      // Verify token with Clerk
      const payload = await this.clerkService.verifyToken(token);

      // Get or create user in our database
      const user = await this.clerkService.findOrCreateUser(payload.sub);

      console.log(`[ClerkAuthGuard] User fetched: ID=${user.id}, Role=${user.role}, SellerCat=${user.seller_category}`);

      if (!user.is_active) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Attach user to request object
      request.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }
}
