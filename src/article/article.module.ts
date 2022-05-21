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
  imports: [TypeOrmModule.forFeature([Article, Tag, User])],
  controllers: [ArticleController],
  providers: [ArticleService, TagService, UserService],
})
export class ArticleModule {}
