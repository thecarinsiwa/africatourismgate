import { PartialType } from '@nestjs/swagger';
import { CreateWhyUsItemDto } from './create-why-us-item.dto';

export class UpdateWhyUsItemDto extends PartialType(CreateWhyUsItemDto) {}
