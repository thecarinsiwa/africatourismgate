import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateCruisePortDto {
  @ApiProperty({ example: 'CDKIN' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  code!: string;

  @ApiProperty({ example: 'Kinshasa Port' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty({ example: 'CD' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  countryCode!: string;
}
