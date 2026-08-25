import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class RequestIdentityDocumentUploadDto {
  @ApiProperty({ description: 'Nom du voyageur concerné par la demande de pièce' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  travelerName!: string;

  @ApiPropertyOptional({ description: 'Message optionnel au client (instructions, type de document…)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  staffNote?: string;

  @ApiPropertyOptional({ description: 'Index du voyageur dans le manifeste (0-based, informatif)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  travelerIndex?: number;
}

export class RequestIdentityDocumentUploadResponseDto {
  @ApiProperty({ description: 'True when the notification e-mail was sent (or queued)' })
  sent!: boolean;
}
