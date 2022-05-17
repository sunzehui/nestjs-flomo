import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
@Module({
  controllers: [TagController],
  imports: [TypeOrmModule.forFeature([Tag])],
  providers: [TagService],
})
export class TagModule {}
