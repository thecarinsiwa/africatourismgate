import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/** Body for customer reply on an owned support ticket. */
export class CreateCustomerSupportMessageDto {
  @ApiProperty({ minLength: 10, description: 'Customer reply body' })
  @IsString()
  @MinLength(10)
  body!: string;
}
