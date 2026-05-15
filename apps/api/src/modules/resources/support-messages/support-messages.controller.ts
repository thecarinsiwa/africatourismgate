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
import { SupportMessages } from '../../../entities/generated';
import { SupportMessagesService } from './support-messages.service';

@ApiTags('support-messages')
@Controller('support-messages')
export class SupportMessagesController {
  constructor(private readonly service: SupportMessagesService) {}

  @Get()
  @ApiOperation({ summary: 'List support-messages' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get support-messages by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create support-messages' })
  create(@Body() dto: DeepPartial<SupportMessages>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update support-messages' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<SupportMessages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete support-messages' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
