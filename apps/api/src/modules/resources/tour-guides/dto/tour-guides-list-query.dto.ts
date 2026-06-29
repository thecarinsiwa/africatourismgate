import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class TourGuidesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['internal', 'external'] })
  @IsOptional()
  @IsEnum(['internal', 'external'], {
    message: 'Le type doit être internal ou external.',
  })
  type?: 'internal' | 'external';

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'], {
    message: 'Le statut doit être active ou inactive.',
  })
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filtrer les guides couvrant cette destination',
  })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant de destination doit être un UUID valide." })
  destinationId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant d'organisation doit être un UUID valide." })
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Recherche sur le nom affiché' })
  @IsOptional()
  @IsString()
  search?: string;
}
