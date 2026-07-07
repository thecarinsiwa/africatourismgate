import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateDonationDto } from './dto/create-donation.dto';
import { DonationsListQueryDto } from './dto/donations-list-query.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { DonationsService } from './donations.service';

@ApiTags('donations')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('donations')
export class DonationsController {
  constructor(private readonly service: DonationsService) {}

  @RequirePermissions('organization_settings.read')
  @Get()
  @ApiOperation({ summary: 'List donation campaigns' })
  findAll(@Query() query: DonationsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('organization_settings.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get donation campaign by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('organization_settings.write')
  @Post()
  @ApiOperation({ summary: 'Create donation campaign' })
  create(@Body() dto: CreateDonationDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('organization_settings.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update donation campaign' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDonationDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('organization_settings.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete donation campaign' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
