import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

const CODE_PATTERN = /^[a-z0-9_]+$/;

export class CreateAmenityDto {
  @ApiProperty({ example: 'wifi' })
  @IsNotEmpty({ message: 'Le code est obligatoire.' })
  @IsString()
  @MaxLength(64)
  @Matches(CODE_PATTERN, {
    message: 'Code invalide : minuscules, chiffres et underscores uniquement.',
  })
  code!: string;

  @ApiProperty({ example: 'Wi-Fi' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(120)
  name!: string;
}
