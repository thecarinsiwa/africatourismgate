import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty({ message: "L'organisation est obligatoire." })
  @IsUUID('4', { message: "L'identifiant d'organisation doit être un UUID valide." })
  organizationId!: string;

  @ApiProperty({ example: 'Commercial', maxLength: 100 })
  @IsNotEmpty({ message: 'Le nom du département est obligatoire.' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
