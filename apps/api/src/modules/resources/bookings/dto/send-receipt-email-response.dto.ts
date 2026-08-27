import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendReceiptEmailResponseDto {
  @ApiProperty({ example: true })
  sent!: boolean;

  @ApiPropertyOptional({ example: '<message-id@mailpit>' })
  messageId?: string;

  @ApiPropertyOptional({ description: 'URL de prévisualisation (Ethereal uniquement)' })
  previewUrl?: string;
}
