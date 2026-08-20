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
import { UserPaymentMethods } from '../../../entities/generated';
import { UserPaymentMethodsService } from './user-payment-methods.service';

@ApiTags('user-payment-methods')
@Controller('user-payment-methods')
export class UserPaymentMethodsController {
  constructor(private readonly service: UserPaymentMethodsService) {}

  @Get()
  @ApiOperation({ summary: 'List user-payment-methods' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user-payment-methods by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user-payment-methods' })
  create(@Body() dto: DeepPartial<UserPaymentMethods>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user-payment-methods' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<UserPaymentMethods>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user-payment-methods' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
