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
import { PromoCodes } from '../../../entities/generated';
import { PromoCodesListQueryDto } from './dto/promo-codes-list-query.dto';
import { PromoCodesService } from './promo-codes.service';

@ApiTags('promo-codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly service: PromoCodesService) {}

  @Get()
  @ApiOperation({ summary: 'List promo-codes' })
  findAll(@Query() query: PromoCodesListQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promo-codes by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create promo-codes' })
  create(@Body() dto: DeepPartial<PromoCodes>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promo-codes' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PromoCodes>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete promo-codes' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
