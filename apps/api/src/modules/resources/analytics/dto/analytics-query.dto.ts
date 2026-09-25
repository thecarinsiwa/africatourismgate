import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export const ANALYTICS_PERIODS = ['7d', '30d', '90d'] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export class AnalyticsPeriodQueryDto {
  @ApiPropertyOptional({ enum: ANALYTICS_PERIODS, default: '30d' })
  @IsOptional()
  @IsEnum(ANALYTICS_PERIODS)
  period?: AnalyticsPeriod = '30d';
}

export class AnalyticsTopPagesQueryDto extends AnalyticsPeriodQueryDto {
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
