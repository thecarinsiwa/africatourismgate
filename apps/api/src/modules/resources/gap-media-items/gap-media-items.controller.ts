import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateGapMediaItemDto } from './dto/create-gap-media-item.dto';
import { GapMediaItemsListQueryDto } from './dto/gap-media-items-list-query.dto';
import { UpdateGapMediaItemDto } from './dto/update-gap-media-item.dto';
import { GapMediaItemsService } from './gap-media-items.service';

@ApiTags('gap-media-items')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('gap-media-items')
export class GapMediaItemsController {
  constructor(private readonly service: GapMediaItemsService) {}

  @RequirePermissions('gap.read')
  @Get()
  @ApiOperation({ summary: 'List GAP media items' })
  findAll(@Query() query: GapMediaItemsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('gap.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get GAP media item by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('gap.write')
  @Post()
  @ApiOperation({ summary: 'Create GAP media item' })
  create(@Body() dto: CreateGapMediaItemDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update GAP media item' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGapMediaItemDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete GAP media item' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
