import {IsArray, IsString, MaxLength,} from 'class-validator';

export class CreateArticleDto {
    @IsString()
    @MaxLength(255)
    content: string;

    @IsArray()
    @IsString({each: true})
    tags: string[];
}
