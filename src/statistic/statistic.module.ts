import { Article } from './../article/entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { User } from '@user/entities/user.entity';
import { Statistic } from './entities/statistic.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { ArticleModule } from 'src/article/article.module';

@Module({
  imports: [TypeOrmModule.forFeature([Statistic, User, Article, Tag])],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
