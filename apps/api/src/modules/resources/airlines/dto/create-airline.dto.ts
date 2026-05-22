import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

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
}
