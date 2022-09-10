import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { IsArray, IsOptional } from 'class-validator';

export class UpdateArticleDto extends PartialType(
  OmitType(CreateArticleDto, ['tags']),
) {
  @IsOptional()
  @IsArray()
  tags: string[];

  @IsOptional()
  is_topic:boolean;
}
