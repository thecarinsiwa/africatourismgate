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
import { CreateDestinationDto } from './dto/create-destination.dto';
import { DestinationsListQueryDto } from './dto/destinations-list-query.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { DestinationsService } from './destinations.service';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly service: DestinationsService) {}

  @Get()
  @ApiOperation({ summary: 'List destinations' })
  findAll(@Query() query: DestinationsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get destinations by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create destinations' })
  create(@Body() dto: CreateDestinationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update destinations' })
  update(@Param('id') id: string, @Body() dto: UpdateDestinationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete destinations' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
