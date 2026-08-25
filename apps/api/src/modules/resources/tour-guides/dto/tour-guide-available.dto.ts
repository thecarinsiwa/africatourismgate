import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class TourGuideAvailableQueryDto {
  @ApiProperty({ description: 'Début de la plage recherchée (ISO 8601)' })
  @IsDateString()
  from!: string;

  @ApiProperty({ description: 'Fin de la plage recherchée (ISO 8601)' })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  destinationId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;
}

export class TourGuideAvailableItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional({ nullable: true })
  photoUrl!: string | null;

  @ApiProperty({ enum: ['internal', 'external'] })
  type!: 'internal' | 'external';

  @ApiProperty({ type: [String] })
  languages!: string[];

  @ApiProperty({ type: [String] })
  destinations!: string[];
}
