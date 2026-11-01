import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBlogCommentDto {
  @ApiPropertyOptional({
    description: 'Display name override; defaults to the authenticated user name',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  authorName?: string;

  @ApiPropertyOptional({
    description: 'Contact email override; defaults to the authenticated user email',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  authorEmail?: string;

  @ApiProperty({ minLength: 3, maxLength: 2000 })
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  body!: string;
}
