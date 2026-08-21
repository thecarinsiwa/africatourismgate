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
import { DeepPartial } from 'typeorm';
import { FlightImages } from '../../../entities/generated';
import { FlightImagesListQueryDto } from './dto/flight-images-list-query.dto';
import { FlightImagesService } from './flight-images.service';

@ApiTags('flight-images')
@Controller('flight-images')
export class FlightImagesController {
  constructor(private readonly service: FlightImagesService) {}

  @Get()
  @ApiOperation({ summary: 'List flight-images' })
  findAll(@Query() query: FlightImagesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create flight-images' })
  create(@Body() dto: DeepPartial<FlightImages>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<FlightImages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete flight-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
