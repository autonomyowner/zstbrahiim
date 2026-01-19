import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreelancerService } from './entities/freelancer-service.entity';
import { FreelancerPortfolio } from './entities/freelancer-portfolio.entity';
import { FreelancerOrder } from './entities/freelancer-order.entity';
import { FreelanceService } from './freelance.service';
import {
  FreelanceServicesController,
  FreelancerServicesController,
  FreelancerPortfolioController,
  FreelanceOrdersController,
  FreelancerOrdersController,
} from './freelance.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FreelancerService,
      FreelancerPortfolio,
      FreelancerOrder,
    ]),
    StorageModule,
  ],
  controllers: [
    FreelanceServicesController,
    FreelancerServicesController,
    FreelancerPortfolioController,
    FreelanceOrdersController,
    FreelancerOrdersController,
  ],
  providers: [FreelanceService],
  exports: [FreelanceService],
})
export class FreelanceModule {}
