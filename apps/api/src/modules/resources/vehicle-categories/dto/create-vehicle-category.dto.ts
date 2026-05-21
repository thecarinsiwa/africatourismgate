import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVehicleCategoryDto {
  @ApiProperty({ example: 'SUV' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'Toyota RAV4' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  exampleModel?: string;
}
