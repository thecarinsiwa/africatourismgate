import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicGalleryImageDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiPropertyOptional({ nullable: true })
  caption!: string | null;

  @ApiProperty()
  sortOrder!: number;
}
