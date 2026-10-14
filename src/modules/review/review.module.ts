import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleEntity } from "@modules/article/entities/article.entity";
import { ArticleModule } from "@modules/article/article.module";
import { ReviewLog } from "./entities/review-log.entity";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ReviewLog, ArticleEntity]), ArticleModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
