import { PartialType } from '@nestjs/swagger';
import { CreateGapMediaItemDto } from './create-gap-media-item.dto';

export class UpdateGapMediaItemDto extends PartialType(CreateGapMediaItemDto) {}
