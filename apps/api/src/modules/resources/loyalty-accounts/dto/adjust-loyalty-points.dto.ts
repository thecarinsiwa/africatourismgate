import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdjustLoyaltyPointsDto {
  @ApiProperty({
    description: 'Variation de points (positive ou négative)',
    example: 100,
  })
  @IsInt()
  delta!: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
