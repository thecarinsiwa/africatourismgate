import { PartialType } from '@nestjs/swagger';
import { CreateCruisePortDto } from './create-cruise-port.dto';

export class UpdateCruisePortDto extends PartialType(CreateCruisePortDto) {}
