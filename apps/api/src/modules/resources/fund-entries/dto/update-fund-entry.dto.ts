import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFundEntryDto } from './create-fund-entry.dto';

export class UpdateFundEntryDto extends PartialType(
  OmitType(CreateFundEntryDto, ['organizationId'] as const),
) {}
