import { PartialType } from '@nestjs/swagger';
import { CreateActivityProviderDto } from './create-activity-provider.dto';

export class UpdateActivityProviderDto extends PartialType(CreateActivityProviderDto) {}
