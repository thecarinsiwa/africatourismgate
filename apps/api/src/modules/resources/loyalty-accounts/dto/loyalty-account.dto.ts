import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

const TIERS = ['member', 'silver', 'gold', 'platinum'] as const;

export class CreateLoyaltyAccountDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiPropertyOptional({ example: 'ONEKEY', default: 'ONEKEY' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  programCode?: string;

  @ApiPropertyOptional({ enum: TIERS, default: 'member' })
  @IsOptional()
  @IsIn(TIERS)
  tier?: (typeof TIERS)[number];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsBalance?: number;
}

export class UpdateLoyaltyAccountDto {
  @ApiPropertyOptional({ example: 'ONEKEY' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  programCode?: string;

  @ApiPropertyOptional({ enum: TIERS })
  @IsOptional()
  @IsIn(TIERS)
  tier?: (typeof TIERS)[number];

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsBalance?: number;
}
