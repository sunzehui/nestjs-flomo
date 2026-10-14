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
  ParseFilePipeBuilder,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileManagementService } from "./file-management.service";
import { CreateFileDto } from "./dto/create-file.dto";
import { calculateMD5 } from "@utils/file";
import { User } from "@/core/user/user.decorator";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
import { ConfigService } from "@nestjs/config";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Express } from "express";
import { parseId } from "@utils/id";

@ApiTags("文件管理")
@Controller("files")
@UseGuards(JwtAuthGuard)
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
  async getUserFiles(@User("id") userId: number) {
    // 只允许查看自己的文件
    const fileList = await this.fileManagementService.getUsersFileList(userId);
    return { files: fileList };
  }

  @Get("is-exist/:md5")
  async isFileExist(@Param("md5") md5: string, @User("id") userId: number) {
    try {
      const file = await this.fileManagementService.isFileExist(md5);
      if (!file) {
        return false;
      }
      // 如果存在该文件，则存储一条用户文件记录
      return await this.fileManagementService.saveUserFileQuickly(userId, file);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get(":fileId")
  async getFileById(
    @Param("fileId") fileId: string,
    @User("id") userId: number,
  ) {
    const file = await this.fileManagementService.getFileById(
      userId,
      parseId(fileId),
    );
    return { file };
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: "image",
        })
        .addMaxSizeValidator({
          maxSize: /* 5mb */ 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @User("id") userId: number,
  ) {
    try {
      const fileExtension = file.originalname.split(".").pop();
      const fileMD5 = calculateMD5(file.buffer);
      const createFileDto: CreateFileDto = {
        userId,
        filename: `${fileMD5}.${fileExtension}`,
        md5: fileMD5,
        file,
      };
      const uploadResult = await this.fileManagementService.uploadFile(
        createFileDto,
      );
      const imgServerUrl = (this.configService.get<string>("SERVER_URL") ?? "").replace(
        /\/+$/,
        "",
      );
      return {
        ...uploadResult,
        url: `${imgServerUrl}/${uploadResult.filePath.replace(/^\/+/, "")}`,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Delete()
  async deleteFile(
    @User("id") userId: number,
    @Query("filename") filename: string,
  ) {
    await this.fileManagementService.deleteFile(userId, filename);
    return { message: "File deleted successfully" };
  }
}
