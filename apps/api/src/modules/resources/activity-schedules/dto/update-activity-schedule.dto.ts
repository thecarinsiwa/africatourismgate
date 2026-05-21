import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateActivityScheduleDto } from './create-activity-schedule.dto';

export class UpdateActivityScheduleDto extends PartialType(
  OmitType(CreateActivityScheduleDto, ['activityId'] as const),
) {}
