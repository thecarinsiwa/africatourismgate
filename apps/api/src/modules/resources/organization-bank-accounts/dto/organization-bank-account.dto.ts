import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { maskAccountNumber } from '../../../../common/masking/mask-account-number';
import { OrganizationBankAccounts } from '../../../../entities/generated';

export class OrganizationBankAccountDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty()
  bankName!: string;

  @ApiProperty()
  accountName!: string;

  @ApiProperty({ description: 'Full or masked account number' })
  accountNumber!: string;

  @ApiPropertyOptional({ nullable: true })
  swiftBic!: string | null;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toOrganizationBankAccountDto(
  row: OrganizationBankAccounts,
  options: { revealAccountNumber: boolean },
): OrganizationBankAccountDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    bankName: row.bankName,
    accountName: row.accountName,
    accountNumber: options.revealAccountNumber
      ? row.accountNumber
      : maskAccountNumber(row.accountNumber),
    swiftBic: row.swiftBic ?? null,
    currency: row.currency,
    isDefault: Boolean(row.isDefault),
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    updatedAt: row.updatedAt
      ? row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt)
      : null,
  };
}
