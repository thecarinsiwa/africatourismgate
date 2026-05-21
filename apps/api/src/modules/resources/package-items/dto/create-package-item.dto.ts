import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import type { PackageItems } from '../../../../entities/generated';

const PACKAGE_ITEM_TYPES = [
  'property',
  'flight',
  'vehicle',
  'cruise',
  'activity',
] as const satisfies readonly PackageItems['itemType'][];

export class CreatePackageItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  packageId!: string;

  @ApiProperty({ enum: PACKAGE_ITEM_TYPES })
  @IsIn(PACKAGE_ITEM_TYPES)
  itemType!: PackageItems['itemType'];

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  itemId!: string;
}
