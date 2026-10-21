import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateAccountingExerciseDto {
  @ApiPropertyOptional({ example: 'Exercice 2027', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label?: string;

  @ApiPropertyOptional({
    example: 'XAF',
    description:
      'Book currency — only when exercise is open and has no posted entries',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/, {
    message: 'currency must be a 3-letter ISO code',
  })
  currency?: string;
}
