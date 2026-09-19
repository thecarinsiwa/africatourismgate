import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationBankAccounts } from '../../../../entities/generated';

/** Public payment instructions — account number is never masked. */
export class PublicPaymentBankAccountDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  bankName!: string;

  @ApiProperty({ description: 'Account holder name' })
  accountName!: string;

  @ApiProperty({ description: 'Account number / IBAN (full, for transfer)' })
  accountNumber!: string;

  @ApiPropertyOptional({ nullable: true })
  swiftBic!: string | null;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty()
  isDefault!: boolean;
}

export function toPublicPaymentBankAccountDto(
  row: OrganizationBankAccounts,
): PublicPaymentBankAccountDto {
  return {
    id: row.id,
    bankName: row.bankName,
    accountName: row.accountName,
    accountNumber: row.accountNumber,
    swiftBic: row.swiftBic ?? null,
    currency: row.currency,
    isDefault: Boolean(row.isDefault),
  };
}
