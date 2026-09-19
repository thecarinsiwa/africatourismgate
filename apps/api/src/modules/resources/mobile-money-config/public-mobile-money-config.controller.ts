import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicBrandingQueryDto } from '../organization-settings/dto/public-branding-query.dto';
import { PublicMobileMoneyCountryDto } from './dto/public-mobile-money.dto';
import { MobileMoneyConfigService } from './mobile-money-config.service';

@ApiTags('public')
@Controller()
export class PublicMobileMoneyConfigController {
  constructor(private readonly service: MobileMoneyConfigService) {}

  @Public()
  @Get('public/mobile-money-config')
  @ApiOperation({
    summary:
      'Active Mobile Money countries → operators → payment numbers for checkout instructions',
  })
  @ApiOkResponse({ type: [PublicMobileMoneyCountryDto] })
  list(
    @Query() query: PublicBrandingQueryDto,
  ): Promise<PublicMobileMoneyCountryDto[]> {
    return this.service.listPublicForPayment(query.organizationSlug);
  }
}
