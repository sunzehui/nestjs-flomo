import { StatisticService } from './../statistic/statistic.service';
import { ArticleStatisticService } from './../article-statistic/article-statistic.service';
import { Statistic } from './../statistic/entities/statistic.entity';
import { User } from '@user/entities/user.entity';
import { UserService } from '@user/user.service';
import { Tag } from 'src/tag/entities/tag.entity';
import { TagService } from './../tag/tag.service';
import { TagModule } from './../tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Article } from './entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Statistic, Article, Tag])],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleStatisticService],
})
export class ArticleModule {}
