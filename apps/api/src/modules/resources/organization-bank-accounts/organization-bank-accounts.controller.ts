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
  findAll(
    @CurrentUser() user: AuthUserDto,
    @Query() query: OrganizationBankAccountsListQueryDto,
  ) {
    return this.service.findAll(user, query);
  }

  @Get(':id')
  @RequirePermissions('organization_bank_accounts.read')
  @ApiOperation({ summary: 'Get bank account by id (scoped)' })
  findOne(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<OrganizationBankAccountDto> {
    return this.service.findOne(user, id, organizationId);
  }

  @Post()
  @RequirePermissions('organization_bank_accounts.write')
  @ApiOperation({ summary: 'Create bank account (scoped)' })
  create(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: CreateOrganizationBankAccountDto,
  ): Promise<OrganizationBankAccountDto> {
    return this.service.create(user, dto);
  }

  @Patch(':id')
  @RequirePermissions('organization_bank_accounts.write')
  @ApiOperation({ summary: 'Update bank account (scoped)' })
  update(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationBankAccountDto,
    @Query('organizationId') organizationId?: string,
  ): Promise<OrganizationBankAccountDto> {
    return this.service.update(user, id, dto, organizationId);
  }

  @Delete(':id')
  @RequirePermissions('organization_bank_accounts.write')
  @ApiOperation({ summary: 'Soft-delete bank account (scoped)' })
  remove(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<void> {
    return this.service.remove(user, id, organizationId);
  }
}
