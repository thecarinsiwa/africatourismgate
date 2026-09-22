import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicCurrentMaintenanceQueryDto } from './dto/public-current-maintenance-query.dto';
import { PublicSiteMaintenanceDto } from './dto/public-site-maintenance.dto';
import { OrganizationMaintenancesService } from './organization-maintenances.service';

@ApiTags('public')
@Controller()
export class PublicOrganizationMaintenancesController {
  constructor(private readonly service: OrganizationMaintenancesService) {}

  @Public()
  @Get('public/organization-maintenances/current')
  @ApiOperation({
    summary:
      'Current active site-maintenance window for the public site (by organization slug + locale)',
  })
  @ApiOkResponse({ type: PublicSiteMaintenanceDto })
  current(
    @Query() query: PublicCurrentMaintenanceQueryDto,
  ): Promise<PublicSiteMaintenanceDto> {
    return this.service.findPublicCurrent(query.organizationSlug, query.locale);
  }
}
