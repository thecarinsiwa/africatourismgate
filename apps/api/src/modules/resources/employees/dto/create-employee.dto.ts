import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty({ message: "L'utilisateur est obligatoire." })
  @IsUUID('4', { message: "L'identifiant utilisateur doit être un UUID valide." })
  userId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant d'organisation doit être un UUID valide." })
  organizationId?: string;

  @ApiPropertyOptional({ example: 'EMP-001', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeCode?: string;

  @ApiPropertyOptional({ example: 'Responsable ventes', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Commercial', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  hireDate?: string;

  @ApiPropertyOptional({ example: '2025-06-30' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  terminationDate?: string;

  @ApiPropertyOptional({ example: 45000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional({ example: 'USD', maxLength: 3 })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant du manager doit être un UUID valide." })
  managerId?: string;

  @ApiPropertyOptional({
    enum: ['active', 'on_leave', 'terminated'],
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'on_leave', 'terminated'], {
    message: 'Le statut doit être active, on_leave ou terminated.',
  })
  status?: 'active' | 'on_leave' | 'terminated';
}
