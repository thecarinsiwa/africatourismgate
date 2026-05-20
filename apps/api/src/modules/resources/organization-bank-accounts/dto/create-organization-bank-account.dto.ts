import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateOrganizationBankAccountDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;

  @ApiProperty({ example: 'Rawbank' })
  @IsNotEmpty({ message: 'Le nom de la banque est obligatoire.' })
  @IsString()
  @MaxLength(150)
  bankName!: string;

  @ApiProperty({ example: 'Africa Tourism Gate SARL' })
  @IsNotEmpty({ message: 'Le nom du compte est obligatoire.' })
  @IsString()
  @MaxLength(150)
  accountName!: string;

  @ApiProperty({ example: '0001234567890' })
  @IsNotEmpty({ message: 'Le numéro de compte est obligatoire.' })
  @IsString()
  @MaxLength(100)
  @ValidateIf((o) => o.accountNumber !== undefined)
  accountNumber!: string;

  @ApiPropertyOptional({ example: 'RAWBCDKI' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  swiftBic?: string;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsNotEmpty({ message: 'La devise est obligatoire.' })
  @IsString()
  @Length(3, 3, { message: 'La devise doit comporter 3 lettres (ex. USD, CDF).' })
  currency!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
