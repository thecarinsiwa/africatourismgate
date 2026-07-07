import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateGapActivityDto } from './dto/create-gap-activity.dto';
import { GapActivitiesListQueryDto } from './dto/gap-activities-list-query.dto';
import { UpdateGapActivityDto } from './dto/update-gap-activity.dto';
import { GapActivitiesService } from './gap-activities.service';

@ApiTags('gap-activities')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('gap-activities')
export class GapActivitiesController {
  constructor(private readonly service: GapActivitiesService) {}

  @RequirePermissions('gap.read')
  @Get()
  @ApiOperation({ summary: 'List GAP activities' })
  findAll(@Query() query: GapActivitiesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('gap.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get GAP activity by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('gap.write')
  @Post()
  @ApiOperation({ summary: 'Create GAP activity' })
  create(@Body() dto: CreateGapActivityDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update GAP activity' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGapActivityDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete GAP activity' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
