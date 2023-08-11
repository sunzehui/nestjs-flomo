import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { join } from 'lodash';

@Injectable()
export class FileManagementService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {}

  private getUploadsPath(userId: string) {
    const uploadsPath = path.join(process.cwd(), 'uploads', userId.toString());
    return uploadsPath;
  }
  private getRelativeUploadsPath(userId: string, filename: string) {
    const uploadsPath = join(['uploads', userId.toString(), filename], '/');
    return uploadsPath;
  }

  async getFileList(userId: string) {
    const fileList = await this.fileRepository.find({ where: { userId } });
    return fileList;
  }

  async getUserFiles(userId: string) {
    return this.getFileList(userId);
  }
  async getFileById(userId: string, fileId: number) {
    const file = await this.fileRepository.findOne({
      where: { userId, id: fileId },
    });
    if (!file) {
      throw new NotFoundException(`File not found with ID: ${fileId}`);
    }
    return file;
  }
  async uploadFile(createFileDto: CreateFileDto) {
    const { userId, filename, file } = createFileDto;
    const uploadsPath = this.getUploadsPath(userId);

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const destinationPath = path.join(uploadsPath, filename);
    // Save file to the uploads directory
    fs.writeFileSync(destinationPath, file.buffer);

    const relativePath = this.getRelativeUploadsPath(userId, filename);
    // Save file information to the database
    const fileEntity = this.fileRepository.create({
      userId,
      filename,
      filePath: relativePath,
    });
    return await this.fileRepository.save(fileEntity);
  }

  async deleteFile(userId: string, filename: string) {
    const uploadsPath = this.getUploadsPath(userId);
    const filePath = path.join(uploadsPath, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      // Delete file record from the database
      const file = await this.fileRepository.findOne({
        where: { userId, filename },
      });
      if (file) {
        await this.fileRepository.remove(file);
      }

      return 'File deleted and record removed successfully';
    } else {
      throw new NotFoundException(`File not found: ${filename}`);
    }
  }
}