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
import { Promotions } from '../../../entities/generated';
import { PromotionsListQueryDto } from './dto/promotions-list-query.dto';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'List promotions' })
  findAll(@Query() query: PromotionsListQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotions by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create promotions' })
  create(@Body() dto: DeepPartial<Promotions>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promotions' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Promotions>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete promotions' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
