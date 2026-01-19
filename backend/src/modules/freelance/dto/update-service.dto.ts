import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';
import { ServiceStatus } from '../entities/freelancer-service.entity';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
