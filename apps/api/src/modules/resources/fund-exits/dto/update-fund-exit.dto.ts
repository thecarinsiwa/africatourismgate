import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFundExitDto } from './create-fund-exit.dto';

export class UpdateFundExitDto extends PartialType(
  OmitType(CreateFundExitDto, ['organizationId', 'expenseRequestId'] as const),
) {}
