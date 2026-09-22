import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationMaintenanceDto } from './create-organization-maintenance.dto';

export class UpdateOrganizationMaintenanceDto extends PartialType(
  CreateOrganizationMaintenanceDto,
) {}
