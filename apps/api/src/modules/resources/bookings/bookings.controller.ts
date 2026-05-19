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
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Bookings } from '../../../entities/generated';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('bookings')
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Get()
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List bookings' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Get bookings by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create bookings' })
  create(@Body() dto: DeepPartial<Bookings>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Update bookings' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Bookings>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('bookings.delete')
  @ApiOperation({ summary: 'Soft-delete bookings' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
