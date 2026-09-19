import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicBrandingQueryDto } from '../organization-settings/dto/public-branding-query.dto';
import { PublicPaymentBankAccountDto } from './dto/public-payment-bank-account.dto';
import { OrganizationBankAccountsService } from './organization-bank-accounts.service';

@ApiTags('public')
@Controller()
export class PublicPaymentBankAccountsController {
  constructor(private readonly service: OrganizationBankAccountsService) {}

  @Public()
  @Get('public/payment-bank-accounts')
  @ApiOperation({
    summary:
      'List active organization bank accounts for bank transfer payment instructions (unmasked)',
  })
  @ApiOkResponse({ type: [PublicPaymentBankAccountDto] })
  list(@Query() query: PublicBrandingQueryDto): Promise<PublicPaymentBankAccountDto[]> {
    return this.service.listPublicForPayment(query.organizationSlug);
  }
}
