import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateExpenseRequestDto } from './create-expense-request.dto';

export class UpdateExpenseRequestDto extends PartialType(
  OmitType(CreateExpenseRequestDto, ['organizationId'] as const),
) {}
