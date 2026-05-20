import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'sales_manager' })
  @IsNotEmpty({ message: 'Le code est obligatoire.' })
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Le code doit être en minuscules (lettres, chiffres, underscore).',
  })
  code!: string;

  @ApiProperty({ example: 'Responsable commercial' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
