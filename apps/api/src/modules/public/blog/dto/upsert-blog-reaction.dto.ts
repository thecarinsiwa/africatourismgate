import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { BLOG_REACTION_TYPES, type BlogReactionType } from '@africatourismgate/types';

export class UpsertBlogReactionDto {
  @ApiProperty({ enum: BLOG_REACTION_TYPES })
  @IsIn([...BLOG_REACTION_TYPES])
  reactionType!: BlogReactionType;
}
