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
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateOrganizationBankAccountDto } from './dto/create-organization-bank-account.dto';
import { OrganizationBankAccountDto } from './dto/organization-bank-account.dto';
import { OrganizationBankAccountsListQueryDto } from './dto/organization-bank-accounts-list-query.dto';
import { UpdateOrganizationBankAccountDto } from './dto/update-organization-bank-account.dto';
import { OrganizationBankAccountsService } from './organization-bank-accounts.service';

@ApiTags('organization-bank-accounts')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('organization-bank-accounts')
export class OrganizationBankAccountsController {
  constructor(private readonly service: OrganizationBankAccountsService) {}

  @Get()
  @RequirePermissions('organization_bank_accounts.read')
  @ApiOperation({ summary: 'List organization bank accounts (scoped)' })
  @ApiOkResponse({ type: [OrganizationBankAccountDto] })
  findAll(
    @Query() query: OrganizationBankAccountsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.list(query, user);
  }

  @Get(':id')
  @RequirePermissions('organization_bank_accounts.read')
  @ApiOperation({ summary: 'Get organization bank account by id (scoped)' })
  findOne(
    @Param('id') id: string,
    @Query() query: OrganizationBankAccountsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findOneDto(id, user, query.organizationId);
  }

  @Post()
  @RequirePermissions('organization_bank_accounts.write')
  @ApiOperation({ summary: 'Create organization bank account (scoped)' })
  create(
    @Body() dto: CreateOrganizationBankAccountDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user);
  }

  @Patch(':id')
  @RequirePermissions('organization_bank_accounts.write')
  @ApiOperation({ summary: 'Update organization bank account (scoped)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationBankAccountDto,
    @Query() query: OrganizationBankAccountsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user, query.organizationId);
  }

  @Delete(':id')
  @RequirePermissions('organization_bank_accounts.write')
  @ApiOperation({ summary: 'Soft-delete organization bank account (scoped)' })
  remove(
    @Param('id') id: string,
    @Query() query: OrganizationBankAccountsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.removeScoped(id, user, query.organizationId);
  }
}
