import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMobileMoneyPaymentNumberDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'operatorId doit être un UUID valide.' })
  operatorId!: string;

  @ApiProperty({ example: '+243970000000' })
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  @IsString()
  @MaxLength(32)
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Le numéro doit être au format E.164 (ex. +243970000000).',
  })
  phoneE164!: string;

  @ApiPropertyOptional({ example: 'Paiements ATG Kinshasa' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string | null;

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
