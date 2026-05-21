import { PartialType } from '@nestjs/swagger';
import { CreateCruiseSailingDto } from './create-cruise-sailing.dto';

export class UpdateCruiseSailingDto extends PartialType(CreateCruiseSailingDto) {}
