import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  PublicMobileMoneyCountry,
  PublicMobileMoneyOperator,
  PublicMobileMoneyPaymentNumber,
} from '@africatourismgate/types';

export class PublicMobileMoneyPaymentNumberDto
  implements PublicMobileMoneyPaymentNumber
{
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: '+243970000000' })
  phoneE164!: string;

  @ApiPropertyOptional({ nullable: true })
  label!: string | null;
}

export class PublicMobileMoneyOperatorDto implements PublicMobileMoneyOperator {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  logoUrl!: string | null;

  @ApiProperty({ type: [PublicMobileMoneyPaymentNumberDto] })
  numbers!: PublicMobileMoneyPaymentNumberDto[];
}

export class PublicMobileMoneyCountryDto implements PublicMobileMoneyCountry {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'CD' })
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: [PublicMobileMoneyOperatorDto] })
  operators!: PublicMobileMoneyOperatorDto[];
}
