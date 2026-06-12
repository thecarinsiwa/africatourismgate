import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { FlightClassAvailability } from '../../../entities/generated';
import { FlightClassAvailabilityService } from './flight-class-availability.service';

@ApiTags('flight-class-availability')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('flight-class-availability')
export class FlightClassAvailabilityController {
  constructor(private readonly service: FlightClassAvailabilityService) {}

  @RequirePermissions('flights.read')
  @Get()
  @ApiOperation({ summary: 'List flight-class-availability' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('flights.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get flight-class-availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('flights.write')
  @Post()
  @ApiOperation({ summary: 'Create flight-class-availability' })
  create(@Body() dto: DeepPartial<FlightClassAvailability>) {
    return this.service.create(dto);
  }

  @RequirePermissions('flights.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update flight-class-availability' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<FlightClassAvailability>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('flights.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete flight-class-availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
