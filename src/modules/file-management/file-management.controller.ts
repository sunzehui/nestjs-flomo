import { Controller, Get, Param, Post, UploadedFile, UseInterceptors, Delete, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileManagementService } from './file-management.service';
import { CreateFileDto } from './dto/create-file.dto';
import { calculateMD5 } from '@utils/file';

@Controller('files')
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) { }

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
  async getFileById(@Param('userId') userId: string, @Param('fileId') fileId: number) {
    const file = await this.fileManagementService.getFileById(userId, fileId);
    return { file };
  }
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Query('userId') userId: string) {
    try{
    const fileExt = file.originalname.split('.').pop();
    const createFileDto: CreateFileDto = { userId, filename:`${calculateMD5(file.buffer)}.${fileExt}` ,file};
    await this.fileManagementService.uploadFile(createFileDto);
    return { message: 'File uploaded successfully' };
 
    }catch(err){
      throw new BadRequestException(err.message);
    }
 }

  @Delete()
  async deleteFile(@Query('userId') userId: string, @Query('filename') filename: string) {
    await this.fileManagementService.deleteFile(userId, filename);
    return { message: 'File deleted successfully' };
  }
}
