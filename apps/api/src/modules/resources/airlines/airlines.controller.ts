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
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Airlines } from '../../../entities/generated';
import { AirlinesService } from './airlines.service';

@ApiTags('airlines')
@Controller('airlines')
export class AirlinesController {
  constructor(private readonly service: AirlinesService) {}

  @Get()
  @ApiOperation({ summary: 'List airlines' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get airlines by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create airlines' })
  create(@Body() dto: DeepPartial<Airlines>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update airlines' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Airlines>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete airlines' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
