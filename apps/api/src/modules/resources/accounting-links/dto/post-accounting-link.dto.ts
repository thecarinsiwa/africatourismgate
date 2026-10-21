import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

const FUND_OP_TYPES = ['fund_entry', 'fund_exit'] as const;

export class PostAccountingLinkDto {
  @ApiProperty({ enum: FUND_OP_TYPES })
  @IsIn(FUND_OP_TYPES)
  fundOpType!: (typeof FUND_OP_TYPES)[number];

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  fundOpId!: string;
}

export class SkipAccountingLinkDto {
  @ApiProperty({ enum: FUND_OP_TYPES })
  @IsIn(FUND_OP_TYPES)
  fundOpType!: (typeof FUND_OP_TYPES)[number];

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  fundOpId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  organizationId!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string | null;
}
