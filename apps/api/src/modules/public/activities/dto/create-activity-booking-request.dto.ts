import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateActivityBookingRequestDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty({ message: 'Le nom complet est obligatoire.' })
  @IsString()
  @MaxLength(180)
  fullName!: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail({}, { message: "L'adresse e-mail n'est pas valide." })
  @MaxLength(255)
  email!: string;

  @ApiPropertyOptional({ example: '+250788123456', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiProperty({ format: 'date', example: '2026-08-15' })
  @IsDateString(
    {},
    { message: 'La date souhaitée doit être au format YYYY-MM-DD.' },
  )
  preferredDate!: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  participants!: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string | null;
}
