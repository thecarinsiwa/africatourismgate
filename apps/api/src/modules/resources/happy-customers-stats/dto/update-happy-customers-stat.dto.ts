import { PartialType } from '@nestjs/swagger';
import { CreateHappyCustomersStatDto } from './create-happy-customers-stat.dto';

export class UpdateHappyCustomersStatDto extends PartialType(CreateHappyCustomersStatDto) {}
