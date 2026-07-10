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
import { Airlines } from '../../../entities/generated';
import { AirlinesListQueryDto } from './dto/airlines-list-query.dto';
import { AirlinesService } from './airlines.service';

@ApiTags('airlines')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('airlines')
export class AirlinesController {
  constructor(private readonly service: AirlinesService) {}

  @RequirePermissions('flights.read')
  @Get()
  @ApiOperation({ summary: 'List airlines' })
  findAll(@Query() query: AirlinesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('flights.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get airlines by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('flights.write')
  @Post()
  @ApiOperation({ summary: 'Create airlines' })
  create(@Body() dto: DeepPartial<Airlines>) {
    return this.service.create(dto);
  }

  @RequirePermissions('flights.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update airlines' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Airlines>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('flights.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete airlines' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
