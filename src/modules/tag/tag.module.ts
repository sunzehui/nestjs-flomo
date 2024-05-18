import { ArticleEntity } from '../article/entities/article.entity';
import { UserModule } from '@/core/user/user.module';
import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';

@Module({
  controllers: [TagController],
  imports: [TypeOrmModule.forFeature([Tag, ArticleEntity]), UserModule],
  providers: [TagService],
})
export class TagModule {}
