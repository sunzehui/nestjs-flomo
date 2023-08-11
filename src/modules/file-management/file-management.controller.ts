import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileManagementService } from './file-management.service';
import { CreateFileDto } from './dto/create-file.dto';
import { calculateMD5 } from '@utils/file';
import { User } from '@/core/user/user.decorator';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { join } from 'path';
import { join as lJoin } from 'lodash';
import { ConfigService } from '@nestjs/config';
@Controller('files')
export class FileManagementController {
  constructor(
    private readonly fileManagementService: FileManagementService,
    private configService: ConfigService,
  ) {}

  @Get()
  async getUserFiles(@Query('userId') userId: string) {
    // if(!userId){
    //   const fileList = await this.fileManagementService.getFileList();
    //   return { files: fileList };
    // }
    const fileList = await this.fileManagementService.getUserFiles(userId);
    return { files: fileList };
  }

  @Get(':fileId')
  async getFileById(
    @Param('userId') userId: string,
    @Param('fileId') fileId: number,
  ) {
    const file = await this.fileManagementService.getFileById(userId, fileId);
    return { file };
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() request: Request,
    @UploadedFile() file,
    @User('id') userId: string,
  ) {
    try {
      const fileExt = file.originalname.split('.').pop();
      const createFileDto: CreateFileDto = {
        userId: userId.toString(),
        filename: `${calculateMD5(file.buffer)}.${fileExt}`,
        file,
      };
      const uploadResult = await this.fileManagementService.uploadFile(
        createFileDto,
      );
      const host = request.get('host'); // 获取主机名
      const isHttps = request.secure;
      const imgServerUrl = this.configService.get('IMG_SERVER');
      return {
        ...uploadResult,
        url: lJoin([imgServerUrl, uploadResult.filePath], '/'),
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete()
  async deleteFile(
    @Query('userId') userId: string,
    @Query('filename') filename: string,
  ) {
    await this.fileManagementService.deleteFile(userId, filename);
    return { message: 'File deleted successfully' };
  }
}
