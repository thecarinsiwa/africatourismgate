import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBlogCommentDto {
  @ApiPropertyOptional({ minLength: 8, maxLength: 64 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  visitorKey?: string;

  @ApiProperty({ minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  authorName!: string;

  @ApiPropertyOptional()
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
