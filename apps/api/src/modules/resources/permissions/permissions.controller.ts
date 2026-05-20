import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { PermissionsListQueryDto } from './dto/permissions-list-query.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'List permissions' })
  findAll(@Query() query: PermissionsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get permission by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
