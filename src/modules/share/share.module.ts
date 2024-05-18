import { UserEntity } from '@/core/user/entities/user.entity';
import { UserModule } from '@/core/user/user.module';
import { UserService } from '@/core/user/user.service';
import { ArticleModule } from '@modules/article/article.module';
import { ArticleService } from '@modules/article/article.service';
import { ArticleEntity } from '@modules/article/entities/article.entity';
import { Tag } from '@modules/tag/entities/tag.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, Tag, UserEntity])],
  controllers: [ShareController],
  providers: [ShareService, ArticleService, UserService],
})
export class ShareModule {}
