import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAccountingExerciseDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  organizationId!: string;

  @ApiProperty({ example: '2027', maxLength: 20 })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code!: string;

  @ApiProperty({ example: 'Exercice 2027', maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label!: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  startsOn!: string;

  @ApiProperty({ example: '2027-12-31' })
  @IsDateString()
  endsOn!: string;

  @ApiPropertyOptional({
    example: 'XOF',
    description: 'Book currency; defaults to organizations.currency',
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
