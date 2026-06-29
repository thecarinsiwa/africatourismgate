import { ApiProperty } from '@nestjs/swagger';
import { PackageItems } from '../../../../entities/generated';

export class PackageSuggestedImageDto {
  @ApiProperty()
  url!: string;

  @ApiProperty({ nullable: true })
  caption!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class PackageSuggestedImageGroupDto {
  @ApiProperty()
  packageItemId!: string;

  @ApiProperty({ enum: ['property', 'flight', 'vehicle', 'cruise', 'activity'] })
  itemType!: PackageItems['itemType'];

  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ type: [PackageSuggestedImageDto] })
  images!: PackageSuggestedImageDto[];
}
