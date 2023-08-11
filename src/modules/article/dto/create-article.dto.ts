import { IsArray, IsString, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  images: string[];
}
