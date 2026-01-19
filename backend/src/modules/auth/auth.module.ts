import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SellerCategoryGuard } from './guards/seller-category.guard';
import { ClerkWebhookController } from './webhooks/clerk-webhook.controller';
import { AuthController } from './auth.controller';
import { DevAuthController } from './dev-auth.controller';
import { User } from '../users/entities/user.entity';

/**
 * Global auth module - provides authentication services and guards
 * to all other modules without needing to import it explicitly
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ClerkWebhookController, AuthController, DevAuthController],
  providers: [ClerkService, ClerkAuthGuard, RolesGuard, SellerCategoryGuard],
  exports: [ClerkService, ClerkAuthGuard, RolesGuard, SellerCategoryGuard],
})
export class AuthModule {}
