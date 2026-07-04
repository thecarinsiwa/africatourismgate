import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { BookingManifestSex } from '../../../../entities/booking-manifest-entry.entity';

export class ApproveTravelerPricingDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiPropertyOptional({ enum: ['M', 'F', 'other'] })
  @IsOptional()
  @IsIn(['M', 'F', 'other'])
  sex?: BookingManifestSex;

  @ApiProperty({ description: 'Price for this traveler in cents' })
  @IsInt()
  @Min(0)
  priceCents!: number;
}

export class UpdateBookingPricingTravelerDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiPropertyOptional({ enum: ['M', 'F', 'other'] })
  @IsOptional()
  @IsIn(['M', 'F', 'other'])
  sex?: BookingManifestSex;

  @ApiProperty()
  @IsInt()
  @Min(0)
  priceCents!: number;
}

export class UpdateBookingPricingDto {
  @ApiProperty({ type: [UpdateBookingPricingTravelerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBookingPricingTravelerDto)
  travelers!: UpdateBookingPricingTravelerDto[];

  @ApiPropertyOptional({ description: 'Manual total override in cents' })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalCents?: number;
}
