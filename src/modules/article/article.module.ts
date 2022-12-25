import {ArticleStatisticService} from '../article-statistic/article-statistic.service';
import {Statistic} from '../statistic/entities/statistic.entity';
import {Tag} from '@modules/tag/entities/tag.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Module} from '@nestjs/common';
import {ArticleService} from './article.service';
import {ArticleController} from './article.controller';
import {Article} from './entities/article.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Statistic, Article, Tag])],
    controllers: [ArticleController],
    providers: [ArticleService, ArticleStatisticService],
})
export class ArticleModule {
}
