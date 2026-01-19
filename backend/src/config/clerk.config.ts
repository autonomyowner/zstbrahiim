import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkConfig {
  constructor(private configService: ConfigService) {}

  get publishableKey(): string {
    return this.configService.get('CLERK_PUBLISHABLE_KEY');
  }

  get secretKey(): string {
    return this.configService.get('CLERK_SECRET_KEY');
  }

  get webhookSecret(): string {
    return this.configService.get('CLERK_WEBHOOK_SECRET');
  }

  get apiUrl(): string {
    return 'https://api.clerk.com/v1';
  }
}
