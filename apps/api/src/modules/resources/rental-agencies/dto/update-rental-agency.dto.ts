import { PartialType } from '@nestjs/swagger';
import { CreateRentalAgencyDto } from './create-rental-agency.dto';

export class UpdateRentalAgencyDto extends PartialType(CreateRentalAgencyDto) {}
