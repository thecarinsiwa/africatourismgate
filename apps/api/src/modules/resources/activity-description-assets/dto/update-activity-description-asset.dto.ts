import { PartialType } from '@nestjs/swagger';
import { CreateActivityDescriptionAssetDto } from './create-activity-description-asset.dto';

export class UpdateActivityDescriptionAssetDto extends PartialType(
  CreateActivityDescriptionAssetDto,
) {}
