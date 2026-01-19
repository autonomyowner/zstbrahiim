import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto';

// Algeria wilayas (provinces)
export enum Wilaya {
  ADRAR = 'Adrar',
  CHLEF = 'Chlef',
  LAGHOUAT = 'Laghouat',
  OUM_EL_BOUAGHI = 'Oum El Bouaghi',
  BATNA = 'Batna',
  BEJAIA = 'Béjaïa',
  BISKRA = 'Biskra',
  BECHAR = 'Béchar',
  BLIDA = 'Blida',
  BOUIRA = 'Bouira',
  TAMANRASSET = 'Tamanrasset',
  TEBESSA = 'Tébessa',
  TLEMCEN = 'Tlemcen',
  TIARET = 'Tiaret',
  TIZI_OUZOU = 'Tizi Ouzou',
  ALGER = 'Alger',
  DJELFA = 'Djelfa',
  JIJEL = 'Jijel',
  SETIF = 'Sétif',
  SAIDA = 'Saïda',
  SKIKDA = 'Skikda',
  SIDI_BEL_ABBES = 'Sidi Bel Abbès',
  ANNABA = 'Annaba',
  GUELMA = 'Guelma',
  CONSTANTINE = 'Constantine',
  MEDEA = 'Médéa',
  MOSTAGANEM = 'Mostaganem',
  MSILA = 'M\'Sila',
  MASCARA = 'Mascara',
  OUARGLA = 'Ouargla',
  ORAN = 'Oran',
  EL_BAYADH = 'El Bayadh',
  ILLIZI = 'Illizi',
  BORDJ_BOU_ARRERIDJ = 'Bordj Bou Arréridj',
  BOUMERDES = 'Boumerdès',
  EL_TARF = 'El Tarf',
  TINDOUF = 'Tindouf',
  TISSEMSILT = 'Tissemsilt',
  EL_OUED = 'El Oued',
  KHENCHELA = 'Khenchela',
  SOUK_AHRAS = 'Souk Ahras',
  TIPAZA = 'Tipaza',
  MILA = 'Mila',
  AIN_DEFLA = 'Aïn Defla',
  NAAMA = 'Naâma',
  AIN_TEMOUCHENT = 'Aïn Témouchent',
  GHARDAIA = 'Ghardaïa',
  RELIZANE = 'Relizane',
  TIMIMOUN = 'Timimoun',
  BORDJ_BADJI_MOKHTAR = 'Bordj Badji Mokhtar',
  OULED_DJELLAL = 'Ouled Djellal',
  BENI_ABBES = 'Béni Abbès',
  IN_SALAH = 'In Salah',
  IN_GUEZZAM = 'In Guezzam',
  TOUGGOURT = 'Touggourt',
  DJANET = 'Djanet',
  EL_MEGHAIER = 'El M\'Ghair',
  EL_MENIAA = 'El Meniaa',
}

export enum PaymentMethod {
  COD = 'cod', // Cash on Delivery
  CCP = 'ccp', // Postal check
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer full name', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3, { message: 'Customer name must be at least 3 characters' })
  @MaxLength(100, { message: 'Customer name must not exceed 100 characters' })
  customer_name: string;

  @ApiProperty({ description: 'Customer phone number (e.g., 0555123456)', minLength: 10, maxLength: 15 })
  @IsString()
  @MinLength(10, { message: 'Phone number must be at least 10 characters' })
  @MaxLength(15, { message: 'Phone number must not exceed 15 characters' })
  customer_phone: string;

  @ApiProperty({ description: 'Shipping address' })
  @IsString()
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  @MaxLength(300, { message: 'Address must not exceed 300 characters' })
  shipping_address: string;

  @ApiProperty({ description: 'Wilaya (province)', enum: Wilaya })
  @IsEnum(Wilaya, { message: 'Invalid wilaya' })
  customer_wilaya: Wilaya;

  @ApiPropertyOptional({ description: 'Customer email' })
  @IsOptional()
  @IsString()
  customer_email?: string;

  @ApiPropertyOptional({ description: 'Additional notes', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod, default: PaymentMethod.COD })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  payment_method: PaymentMethod;

  @ApiProperty({ description: 'Order items', type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
