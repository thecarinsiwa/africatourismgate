import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class VoidTreasuryOperationDto {
  @ApiProperty({
    description: 'Motif d’annulation (obligatoire)',
    example: 'Saisie en double',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  reason!: string;
}
