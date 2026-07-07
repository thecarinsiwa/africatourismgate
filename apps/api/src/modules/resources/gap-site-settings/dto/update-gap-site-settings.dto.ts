import { PartialType } from '@nestjs/swagger';
import { CreateGapSiteSettingsDto } from './create-gap-site-settings.dto';

export class UpdateGapSiteSettingsDto extends PartialType(CreateGapSiteSettingsDto) {}
