import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicDonationsQueryDto } from './dto/public-donations-query.dto';
import { PublicDonationsService } from './public-donations.service';

@ApiTags('public-donations')
@Controller('public/donations')
export class PublicDonationsController {
  constructor(private readonly service: PublicDonationsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published donation campaigns for a surface (web or gap)' })
  getDonations(@Query() query: PublicDonationsQueryDto) {
    return this.service.getDonations(query);
  }
}
