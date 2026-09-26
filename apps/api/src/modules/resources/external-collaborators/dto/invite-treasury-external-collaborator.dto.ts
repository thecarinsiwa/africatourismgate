import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const EXTERNAL_SCOPES = ['expense_requests.create'] as const;

export class InviteTreasuryExternalCollaboratorDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  organizationId!: string;

  @ApiProperty({ example: 'partenaire@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiPropertyOptional({ example: 'Marie Partenaire' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string | null;

  @ApiProperty({
    type: [String],
    enum: EXTERNAL_SCOPES,
    example: ['expense_requests.create'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(EXTERNAL_SCOPES, { each: true })
  scopes!: (typeof EXTERNAL_SCOPES)[number][];

  @ApiPropertyOptional({
    example: 72,
    minimum: 1,
    maximum: 720,
    description: 'Token TTL in hours (default 72)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  tokenTtlHours?: number;
}
