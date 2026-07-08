import { PartialType } from '@nestjs/swagger';
import { CreatePackageDescriptionAssetDto } from './create-package-description-asset.dto';

export class UpdatePackageDescriptionAssetDto extends PartialType(
  CreatePackageDescriptionAssetDto,
) {}
