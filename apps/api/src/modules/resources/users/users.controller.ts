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
import { Users } from '../../../entities/generated';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'List users' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get users by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('users.write')
  @ApiOperation({ summary: 'Create users' })
  create(@Body() dto: DeepPartial<Users>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('users.write')
  @ApiOperation({ summary: 'Update users' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Users>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Soft-delete users' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
