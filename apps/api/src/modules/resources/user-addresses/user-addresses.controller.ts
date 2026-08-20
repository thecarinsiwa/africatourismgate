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
import { UserAddresses } from '../../../entities/generated';
import { UserAddressesService } from './user-addresses.service';

@ApiTags('user-addresses')
@Controller('user-addresses')
export class UserAddressesController {
  constructor(private readonly service: UserAddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List user-addresses' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user-addresses by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user-addresses' })
  create(@Body() dto: DeepPartial<UserAddresses>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user-addresses' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<UserAddresses>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user-addresses' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
