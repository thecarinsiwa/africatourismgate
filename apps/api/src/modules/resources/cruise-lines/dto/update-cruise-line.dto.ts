import { PartialType } from '@nestjs/swagger';
import { CreateCruiseLineDto } from './create-cruise-line.dto';

export class UpdateCruiseLineDto extends PartialType(CreateCruiseLineDto) {}
