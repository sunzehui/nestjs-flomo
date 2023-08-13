import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticService } from '@modules/statistic/statistic.service';
import { ArticleEntity } from '@modules/article/entities/article.entity';
import { Tag } from '@modules/tag/entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserEntity, ArticleEntity, Tag])],
  controllers: [UserController],
  providers: [UserService, StatisticService],
  exports: [UserService],
})
export class UserModule {}
