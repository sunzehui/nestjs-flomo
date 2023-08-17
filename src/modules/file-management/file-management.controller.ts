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
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipeBuilder,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileManagementService } from "./file-management.service";
import { CreateFileDto } from "./dto/create-file.dto";
import { calculateMD5 } from "@utils/file";
import { User } from "@/core/user/user.decorator";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
import { join as lJoin } from "lodash";
import { ConfigService } from "@nestjs/config";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Express } from "express";

@ApiTags("文件管理")
@Controller("files")
export class FileManagementController {
  constructor(
    private readonly fileManagementService: FileManagementService,
    private configService: ConfigService,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: "获取文件列表",
  })
  async getUserFiles(@Query("userId") userId: string) {
    if (!userId) {
      const fileList = await this.fileManagementService.getUsersFileList();
      return { files: fileList };
    }
    const fileList = await this.fileManagementService.getUsersFileList(userId);
    return { files: fileList };
  }

  @Get(":fileId")
  async getFileById(
    @Param("userId") userId: string,
    @Param("fileId") fileId: number,
  ) {
    const file = await this.fileManagementService.getFileById(userId, fileId);
    return { file };
  }

  @Get("is-exist/:md5")
  @UseGuards(JwtAuthGuard)
  async isFileExist(@Param("md5") md5: string, @User("id") userId: string) {
    try {
      const file = await this.fileManagementService.isFileExist(md5);
      if (!file) {
        return false;
      }
      // 如果存在该文件，则存储一条用户文件记录
      return await this.fileManagementService.saveUserFileQuickly(userId, file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: "image",
        })
        .addMaxSizeValidator({
          maxSize: 1000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @User("id") userId: string,
  ) {
    try {
      const fileExtension = file.originalname.split(".").pop();
      const fileMD5 = calculateMD5(file.buffer);
      const createFileDto: CreateFileDto = {
        userId: userId.toString(),
        filename: `${fileMD5}.${fileExtension}`,
        md5: fileMD5,
        file,
      };
      const uploadResult = await this.fileManagementService.uploadFile(
        createFileDto,
      );
      const imgServerUrl = this.configService.get("IMG_SERVER");
      return {
        ...uploadResult,
        url: lJoin([imgServerUrl, uploadResult.filePath], "/"),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete()
  async deleteFile(
    @Query("userId") userId: string,
    @Query("filename") filename: string,
  ) {
    await this.fileManagementService.deleteFile(userId, filename);
    return { message: "File deleted successfully" };
  }
}
