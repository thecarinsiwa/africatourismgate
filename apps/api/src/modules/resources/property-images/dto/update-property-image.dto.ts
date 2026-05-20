import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePropertyImageDto } from './create-property-image.dto';

export class UpdatePropertyImageDto extends PartialType(
  OmitType(CreatePropertyImageDto, ['propertyId'] as const),
) {}
