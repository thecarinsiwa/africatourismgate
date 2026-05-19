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
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsListQueryDto } from './dto/organizations-list-query.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  @RequirePermissions('organizations.read')
  @ApiOperation({ summary: 'List organizations' })
  findAll(@Query() query: OrganizationsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('organizations.read')
  @ApiOperation({ summary: 'Get organization by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('organizations.write')
  @ApiOperation({ summary: 'Create organization' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('organizations.write')
  @ApiOperation({ summary: 'Update organization' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('organizations.write')
  @ApiOperation({ summary: 'Soft-delete organization' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
