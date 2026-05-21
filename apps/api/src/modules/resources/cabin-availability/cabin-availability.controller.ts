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
import { CreateCabinAvailabilityDto } from './dto/create-cabin-availability.dto';
import { CabinAvailabilityListQueryDto } from './dto/cabin-availability-list-query.dto';
import { UpdateCabinAvailabilityDto } from './dto/update-cabin-availability.dto';
import { CabinAvailabilityService } from './cabin-availability.service';

@ApiTags('cabin-availability')
@Controller('cabin-availability')
export class CabinAvailabilityController {
  constructor(private readonly service: CabinAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'List cabin availability for a sailing' })
  findAll(@Query() query: CabinAvailabilityListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cabin availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cabin availability' })
  create(@Body() dto: CreateCabinAvailabilityDto) {
    return this.service.createAvailability(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cabin availability' })
  update(@Param('id') id: string, @Body() dto: UpdateCabinAvailabilityDto) {
    return this.service.updateAvailability(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cabin availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
