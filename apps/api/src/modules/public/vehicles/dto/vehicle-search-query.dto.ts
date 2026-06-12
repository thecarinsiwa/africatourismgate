import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehicleSearchQueryDto extends PaginationQueryDto {
  @ApiProperty({
    example: 'Kinshasa',
    description: 'Pickup city or destination name (partial match)',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  pickupLocation!: string;

  @ApiProperty({ format: 'date', example: '2026-08-01' })
  @IsDateString()
  pickupDate!: string;

  @ApiProperty({ format: 'date', example: '2026-08-08' })
  @IsDateString()
  returnDate!: string;
}
