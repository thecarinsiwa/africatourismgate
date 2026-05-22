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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRentalAgencyDto } from './dto/create-rental-agency.dto';
import { RentalAgenciesListQueryDto } from './dto/rental-agencies-list-query.dto';
import { UpdateRentalAgencyDto } from './dto/update-rental-agency.dto';
import { RentalAgenciesService } from './rental-agencies.service';

@ApiTags('rental-agencies')
@Controller('rental-agencies')
export class RentalAgenciesController {
  constructor(private readonly service: RentalAgenciesService) {}

  @Get()
  @ApiOperation({ summary: 'List rental agencies' })
  findAll(@Query() query: RentalAgenciesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rental agency by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create rental agency' })
  create(@Body() dto: CreateRentalAgencyDto) {
    return this.service.createAgency(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rental agency' })
  update(@Param('id') id: string, @Body() dto: UpdateRentalAgencyDto) {
    return this.service.updateAgency(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete rental agency' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
