import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Tag } from 'src/tag/entities/tag.entity';
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(
  OmitType(CreateArticleDto, ['tags']),
) {
  tags: string[];
}
