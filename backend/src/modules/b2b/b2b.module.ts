import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { B2BController } from './b2b.controller';
import { B2BService } from './b2b.service';
import { B2BOffer } from './entities/b2b-offer.entity';
import { B2BResponse } from './entities/b2b-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([B2BOffer, B2BResponse])],
  controllers: [B2BController],
  providers: [B2BService],
  exports: [B2BService],
})
export class B2BModule {}
