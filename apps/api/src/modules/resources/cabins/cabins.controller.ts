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
import { CreateCabinDto } from './dto/create-cabin.dto';
import { CabinsListQueryDto } from './dto/cabins-list-query.dto';
import { UpdateCabinDto } from './dto/update-cabin.dto';
import { CabinsService } from './cabins.service';

@ApiTags('cabins')
@Controller('cabins')
export class CabinsController {
  constructor(private readonly service: CabinsService) {}

  @Get()
  @ApiOperation({ summary: 'List cabins' })
  findAll(@Query() query: CabinsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cabin by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cabin' })
  create(@Body() dto: CreateCabinDto) {
    return this.service.createCabin(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cabin' })
  update(@Param('id') id: string, @Body() dto: UpdateCabinDto) {
    return this.service.updateCabin(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cabin' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
