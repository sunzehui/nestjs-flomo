import { UserModule } from '@/core/user/user.module';
import { ArticleModule } from '@modules/article/article.module';
import { ArticleEntity } from '@modules/article/entities/article.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { ShareSelection } from './entities/share-selection.entity';

@Module({
  imports: [
    UserModule,
    ArticleModule,
    TypeOrmModule.forFeature([ShareSelection, ArticleEntity]),
  ],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
