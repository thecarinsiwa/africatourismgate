import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateActivityProviderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'destinationId doit être un UUID valide.' })
  destinationId!: string;

  @ApiProperty({ example: 'Safari Kinshasa Tours' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;
}
