import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateHappyCustomersSectionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subtitle!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  paragraph1!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  paragraph2!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  imageUrl!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  imageAlt!: string;

  @ApiPropertyOptional({ example: '10K+' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  badgeValue?: string;

  @ApiPropertyOptional({ example: 'Clients' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  badgeLabel?: string;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';
}
