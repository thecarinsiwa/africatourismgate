import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateActivityProviderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'destinationId doit être un UUID valide.' })
  destinationId!: string;

  @ApiProperty({ example: 'Safari Kinshasa Tours' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 512 })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(512)
  logoUrl?: string | null;
}
