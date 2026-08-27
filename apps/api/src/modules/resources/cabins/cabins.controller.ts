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
import { Cabins } from '../../../entities/generated';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { CabinsListQueryDto } from './dto/cabins-list-query.dto';
import { CabinsService } from './cabins.service';

@ApiTags('cabins')
@Controller('cabins')
export class CabinsController {
  constructor(private readonly service: CabinsService) {}

  @Get()
  @ApiOperation({ summary: 'List cabins' })
  findAll(
    @Query() query: CabinsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findAllForUser(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cabins by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cabins' })
  create(@Body() dto: DeepPartial<Cabins>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cabins' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Cabins>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cabins' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
