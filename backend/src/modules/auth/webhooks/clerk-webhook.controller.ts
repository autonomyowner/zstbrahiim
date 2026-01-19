import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClerkService } from '../clerk.service';

@ApiTags('webhooks')
@Controller('v1/webhooks/clerk')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(private readonly clerkService: ClerkService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clerk webhook endpoint',
    description: 'Receives user events from Clerk (user.created, user.updated, user.deleted)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload',
  })
  async handleWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log('Received Clerk webhook');

    // Verify webhook signature
    const isValid = await this.clerkService.verifyWebhookSignature(
      JSON.stringify(payload),
      headers,
    );

    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    const eventType = payload.type;
    const userData = payload.data;

    this.logger.log(`Processing webhook event: ${eventType}`);

    try {
      switch (eventType) {
        case 'user.created':
        case 'user.updated':
          await this.clerkService.syncUserFromWebhook(userData);
          this.logger.log(`User ${eventType}: ${userData.id}`);
          break;

        case 'user.deleted':
          await this.clerkService.deleteUser(userData.id);
          this.logger.log(`User deleted: ${userData.id}`);
          break;

        default:
          this.logger.warn(`Unhandled webhook event type: ${eventType}`);
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Webhook processing failed: ${error.message}`);
    }
  }
}
