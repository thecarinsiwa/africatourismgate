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
import { Ships } from '../../../entities/generated';
import { ShipsService } from './ships.service';

@ApiTags('ships')
@Controller('ships')
export class ShipsController {
  constructor(private readonly service: ShipsService) {}

  @Get()
  @ApiOperation({ summary: 'List ships' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ships by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create ships' })
  create(@Body() dto: DeepPartial<Ships>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ships' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Ships>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete ships' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
