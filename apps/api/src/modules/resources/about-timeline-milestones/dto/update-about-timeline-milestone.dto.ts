import { PartialType } from '@nestjs/swagger';
import { CreateAboutTimelineMilestoneDto } from './create-about-timeline-milestone.dto';

export class UpdateAboutTimelineMilestoneDto extends PartialType(
  CreateAboutTimelineMilestoneDto,
) {}
