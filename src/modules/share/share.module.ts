import { UserModule } from '@/core/user/user.module';
import { ArticleModule } from '@modules/article/article.module';
import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [UserModule, ArticleModule],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
