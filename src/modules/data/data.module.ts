import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleEntity } from "@modules/article/entities/article.entity";
import { Tag } from "@modules/tag/entities/tag.entity";
import { DataService } from "./data.service";
import { DataController } from "./data.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, Tag])],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
