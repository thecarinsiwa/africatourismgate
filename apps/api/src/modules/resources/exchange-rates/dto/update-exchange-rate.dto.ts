import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateExchangeRateDto } from './create-exchange-rate.dto';

export class UpdateExchangeRateDto extends PartialType(
  OmitType(CreateExchangeRateDto, ['organizationId'] as const),
) {}
