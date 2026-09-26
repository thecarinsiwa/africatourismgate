import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const SOURCES = [
  'treasury_mapping',
  'manual',
  'closing',
  'reversal',
] as const;

const CREATE_STATUSES = ['draft', 'posted'] as const;

export class CreateJournalLineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  accountId!: string;

  @ApiPropertyOptional({ maxLength: 255, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string | null;

  @ApiProperty({ example: 10000, minimum: 0 })
  @IsInt()
  @Min(0)
  debitCents!: number;

  @ApiProperty({ example: 0, minimum: 0 })
  @IsInt()
  @Min(0)
  creditCents!: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  originalAmountCents?: number | null;

  @ApiPropertyOptional({ example: 'EUR', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  originalCurrency?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  fxRate?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  analyticRefType?: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  analyticRefId?: string | null;
}

export class CreateJournalEntryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  organizationId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  journalId!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Required when periodId is omitted',
  })
  @IsOptional()
  @IsUUID('4')
  exerciseId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'When set, exercise is derived from the period',
  })
  @IsOptional()
  @IsUUID('4')
  periodId?: string;

  @ApiProperty({ example: '2026-09-26' })
  @IsDateString()
  entryDate!: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiPropertyOptional({ enum: CREATE_STATUSES, default: 'draft' })
  @IsOptional()
  @IsIn(CREATE_STATUSES)
  status?: (typeof CREATE_STATUSES)[number];

  @ApiPropertyOptional({ enum: SOURCES, default: 'manual' })
  @IsOptional()
  @IsIn(SOURCES)
  source?: (typeof SOURCES)[number];

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  reversesEntryId?: string | null;

  @ApiProperty({ type: [CreateJournalLineDto], minItems: 2 })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateJournalLineDto)
  lines!: CreateJournalLineDto[];
}
