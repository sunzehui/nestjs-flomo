// file-management.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileManagementController } from './file-management.controller';
import { FileManagementService } from './file-management.service';
import { FileEntity } from './entities/file.entity';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([FileEntity])],
  controllers: [FileManagementController],
  providers: [FileManagementService],
})
export class FileManagementModule {}
