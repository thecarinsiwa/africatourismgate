import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { BLOG_REACTION_TYPES, type BlogReactionType } from '@africatourismgate/types';

export class UpsertBlogReactionDto {
  @ApiProperty({ minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  visitorKey!: string;

  @ApiProperty({ enum: BLOG_REACTION_TYPES })
  @IsIn([...BLOG_REACTION_TYPES])
  reactionType!: BlogReactionType;
}
