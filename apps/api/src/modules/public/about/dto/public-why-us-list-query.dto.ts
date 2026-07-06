import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PublicWhyUsListQueryDto {
  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  locale?: string;
}
