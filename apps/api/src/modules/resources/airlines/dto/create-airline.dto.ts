import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateAirlineDto {
  @ApiProperty({ example: 'ET' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  iataCode!: string;

  @ApiProperty({ example: 'Ethiopian Airlines' })
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
