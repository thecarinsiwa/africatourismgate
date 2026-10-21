import { ApiProperty } from '@nestjs/swagger';

export class FundExitAttachmentDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  originalFilename!: string;

  @ApiProperty()
  storedFilename!: string;

  @ApiProperty({ example: 'application/pdf' })
  mimeType!: string;

  @ApiProperty({ example: 20480 })
  fileSizeBytes!: number;

  @ApiProperty({ format: 'uuid', nullable: true })
  uploadedByUserId!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
