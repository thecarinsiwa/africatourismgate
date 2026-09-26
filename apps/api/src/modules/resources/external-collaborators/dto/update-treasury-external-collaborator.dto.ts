import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const EXTERNAL_SCOPES = ['expense_requests.create'] as const;

export class UpdateTreasuryExternalCollaboratorDto {
  @ApiPropertyOptional({ example: 'Marie Partenaire' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string | null;

  @ApiPropertyOptional({
    type: [String],
    enum: EXTERNAL_SCOPES,
    example: ['expense_requests.create'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(EXTERNAL_SCOPES, { each: true })
  scopes?: (typeof EXTERNAL_SCOPES)[number][];
}
