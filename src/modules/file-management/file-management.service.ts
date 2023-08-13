import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { join, omit } from 'lodash';
import { UserEntity } from '@/core/user/entities/user.entity';

@Injectable()
export class FileManagementService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private getUploadsPath() {
    const uploadsPath = path.join(process.cwd(), 'uploads');
    return uploadsPath;
  }
  private getRelativeUploadsPath(filename: string) {
    const uploadsPath = join(['uploads', filename], '/');
    return uploadsPath;
  }

  // async getFileList(userId: string) {
  //   const fileList = await this.fileRepository.find({ where: 
  //     { user:{id:userId} } 
  //   });

  //   return fileList;
  // }

  // async getUserFiles(userId: string) {
  //   return this.getFileList(userId);
  // }
  // async getFileById(userId: string, fileId: number) {
  //   const file = await this.fileRepository.findOne({
  //     where: { user:{id:userId}, id: fileId },
  //   });
  //   if (!file) {
  //     throw new NotFoundException(`File not found with ID: ${fileId}`);
  //   }
  //   return file;
  // }

  async isFileExist(md5: string): Promise<FileEntity> {
    const existingFile = await this.fileRepository.findOne({ where: { md5 } ,relations:['users']});


    return existingFile; 
  }
  // 直接将已存在的文件记录到该用户的文件列表中
  async saveUserFileQuickly(userId: string, fileEntity: FileEntity) {
    const fileDO = new FileEntity({
      id: fileEntity.id,
      users:[ ...fileEntity.users, new UserEntity({id:userId})]
    })
    await this.fileRepository.save(fileDO);
    return this.fileRepository.findOne({ where: { id: fileEntity.id ,users: [{id:userId}]} });
  }
  async uploadFile(createFileDto: CreateFileDto) {
    const { userId, filename, file , md5} = createFileDto;

    const fileExists = await this.isFileExist(md5);
    if (fileExists) {
      return await this.saveUserFileQuickly(userId, fileExists)
    }
    const uploadsPath = this.getUploadsPath();

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const destinationPath = path.join(uploadsPath, filename);
    // Save file to the uploads directory
    fs.writeFileSync(destinationPath, file.buffer);

    const relativePath = this.getRelativeUploadsPath(filename);
    // Save file information to the database
    const fileEntity = this.fileRepository.create({
      users:[new UserEntity({id:userId})],
      filename,
      filePath: relativePath,
      md5
    });
    return await this.fileRepository.save(fileEntity);
  }

  // async deleteFile(userId: string, filename: string) {
  //   const uploadsPath = this.getUploadsPath();
  //   const filePath = path.join(uploadsPath, filename);

  //   if (fs.existsSync(filePath)) {
  //     fs.unlinkSync(filePath);

  //     // Delete file record from the database
  //     const file = await this.fileRepository.findOne({
  //       where: { user:{id:userId}, filename },
  //     });
  //     if (file) {
  //       await this.fileRepository.remove(file);
  //     }

  //     return 'File deleted and record removed successfully';
  //   } else {
  //     throw new NotFoundException(`File not found: ${filename}`);
  //   }
  // }
}
