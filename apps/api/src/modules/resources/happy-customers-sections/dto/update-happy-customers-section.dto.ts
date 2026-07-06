import { PartialType } from '@nestjs/swagger';
import { CreateHappyCustomersSectionDto } from './create-happy-customers-section.dto';

export class UpdateHappyCustomersSectionDto extends PartialType(CreateHappyCustomersSectionDto) {}
