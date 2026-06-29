import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRoomImageDto } from './create-room-image.dto';

export class UpdateRoomImageDto extends PartialType(
  OmitType(CreateRoomImageDto, ['roomId'] as const),
) {}
