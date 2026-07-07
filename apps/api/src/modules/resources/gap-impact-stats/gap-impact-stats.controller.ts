import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateGapImpactStatDto } from './dto/create-gap-impact-stat.dto';
import { GapImpactStatsListQueryDto } from './dto/gap-impact-stats-list-query.dto';
import { UpdateGapImpactStatDto } from './dto/update-gap-impact-stat.dto';
import { GapImpactStatsService } from './gap-impact-stats.service';

@ApiTags('gap-impact-stats')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('gap-impact-stats')
export class GapImpactStatsController {
  constructor(private readonly service: GapImpactStatsService) {}

  @RequirePermissions('gap.read')
  @Get()
  @ApiOperation({ summary: 'List GAP impact stats' })
  findAll(@Query() query: GapImpactStatsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('gap.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get GAP impact stat by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('gap.write')
  @Post()
  @ApiOperation({ summary: 'Create GAP impact stat' })
  create(@Body() dto: CreateGapImpactStatDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update GAP impact stat' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGapImpactStatDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete GAP impact stat' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
