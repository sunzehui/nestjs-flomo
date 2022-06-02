import { Tag } from 'src/tag/entities/tag.entity';
import { IsArray, IsString, MaxLength, maxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MaxLength(255)
  content: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
