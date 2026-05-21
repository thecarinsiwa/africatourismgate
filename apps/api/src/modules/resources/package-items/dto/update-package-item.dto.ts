import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePackageItemDto } from './create-package-item.dto';

export class UpdatePackageItemDto extends PartialType(
  OmitType(CreatePackageItemDto, ['packageId'] as const),
) {}
