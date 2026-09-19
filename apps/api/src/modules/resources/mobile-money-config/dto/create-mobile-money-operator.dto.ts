import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMobileMoneyOperatorDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'countryId doit être un UUID valide.' })
  countryId!: string;

  @ApiProperty({ example: 'M-Pesa' })
  @IsNotEmpty({ message: "Le nom de l'opérateur est obligatoire." })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  logoUrl?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
