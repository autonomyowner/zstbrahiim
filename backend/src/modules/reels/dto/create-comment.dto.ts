import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content', minLength: 1, maxLength: 500 })
  @IsString()
  @MinLength(1, { message: 'Comment cannot be empty' })
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  content: string;
}
