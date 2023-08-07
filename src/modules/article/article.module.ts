import {Tag} from '@modules/tag/entities/tag.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Module} from '@nestjs/common';
import {ArticleService} from './article.service';
import {ArticleController} from './article.controller';
import {Article} from './entities/article.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ Article, Tag])],
    controllers: [ArticleController],
    providers: [ArticleService],
})
export class ArticleModule {
}
