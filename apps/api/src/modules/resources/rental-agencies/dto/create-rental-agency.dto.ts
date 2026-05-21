import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRentalAgencyDto {
  @ApiProperty({ example: 'ATG Rent Kinshasa' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  destinationId?: string | null;

  @ApiPropertyOptional({ example: '12 Avenue de la Paix' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
