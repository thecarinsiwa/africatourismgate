import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { FlightDetailQueryDto } from './dto/flight-detail-query.dto';
import { FlightSearchQueryDto } from './dto/flight-search-query.dto';
import { PublicFlightsService } from './public-flights.service';

@ApiTags('public')
@Controller('public')
export class PublicFlightsController {
  constructor(private readonly service: PublicFlightsService) {}

  @Public()
  @Get('flights/search')
  @ApiOperation({ summary: 'Search flights with min class price and seat availability' })
  search(@Query() query: FlightSearchQueryDto) {
    return this.service.search(query);
  }

  @Public()
  @Get('flights/:id')
  @ApiOperation({ summary: 'Flight detail with class pricing for a travel date' })
  getById(@Param('id') id: string, @Query() query: FlightDetailQueryDto) {
    return this.service.getById(id, query);
  }
}
