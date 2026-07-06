import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateHappyCustomersStatDto } from './dto/create-happy-customers-stat.dto';
import { HappyCustomersStatsListQueryDto } from './dto/happy-customers-stats-list-query.dto';
import { UpdateHappyCustomersStatDto } from './dto/update-happy-customers-stat.dto';
import { HappyCustomersStatsService } from './happy-customers-stats.service';

@ApiTags('happy-customers-stats')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('happy-customers-stats')
export class HappyCustomersStatsController {
  constructor(private readonly service: HappyCustomersStatsService) {}

  @RequirePermissions('content.read')
  @Get()
  @ApiOperation({ summary: 'List happy-customers stats' })
  findAll(@Query() query: HappyCustomersStatsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('content.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get happy-customers stat by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('content.write')
  @Post()
  @ApiOperation({ summary: 'Create happy-customers stat' })
  create(@Body() dto: CreateHappyCustomersStatDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('content.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update happy-customers stat' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHappyCustomersStatDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('content.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete happy-customers stat' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
