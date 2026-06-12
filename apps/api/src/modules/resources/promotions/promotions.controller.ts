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
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Promotions } from '../../../entities/generated';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @RequirePermissions('promotions.read')
  @Get()
  @ApiOperation({ summary: 'List promotions' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('promotions.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get promotions by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('promotions.write')
  @Post()
  @ApiOperation({ summary: 'Create promotions' })
  create(@Body() dto: DeepPartial<Promotions>) {
    return this.service.create(dto);
  }

  @RequirePermissions('promotions.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update promotions' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Promotions>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('promotions.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete promotions' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
