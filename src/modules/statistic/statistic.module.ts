import { ArticleEntity } from '../article/entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { UserEntity } from '@/core/user/entities/user.entity';
import { Tag } from '@modules/tag/entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ArticleEntity, Tag])],
  providers: [StatisticService],
})
export class StatisticModule {}
