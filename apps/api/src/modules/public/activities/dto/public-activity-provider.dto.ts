import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicActivityProviderDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Safari Kinshasa Tours' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, description: 'Partner logo URL' })
  logoUrl!: string | null;
}
