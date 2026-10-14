import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import * as path from "path";
import { Repository } from "typeorm";
import { FileEntity } from "./entities/file.entity";
import { CreateFileDto } from "./dto/create-file.dto";
import { UserEntity } from "@/core/user/entities/user.entity";

@Injectable()
export class FileManagementService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private getUploadsPath() {
    return path.join(process.cwd(), "uploads");
  }

  private getRelativeUploadsPath(filename: string) {
    return ["uploads", filename].join("/");
  }

  /**
   * 只保留文件名本身，剥离任何路径片段，防止 ../ 路径穿越。
   */
  private normalizeFilename(filename: string) {
    const base = path.basename(filename || "");
    if (!base || base === "." || base === "..") {
      throw new NotFoundException(`File not found: ${filename}`);
    }
    return base;
  }

  async getUsersFileList(userId: number) {
    const userEntity = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["files"],
    });

    return userEntity?.files ?? [];
  }

  async getFileById(userId: number, fileId: number) {
    const file = await this.fileRepository.findOne({
      where: { users: [{ id: userId }], id: fileId },
    });
    if (!file) {
      throw new NotFoundException(`File not found with ID: ${fileId}`);
    }
    return file;
  }

  async isFileExist(md5: string) {
    return await this.fileRepository.findOne({
      where: { md5 },
      relations: ["users"],
    });
  }

  // 直接将已存在的文件记录到该用户的文件列表中
  async saveUserFileQuickly(userId: number, fileEntity: FileEntity) {
    const users = fileEntity.users ?? [];
    const alreadyOwned = users.some((user) => Number(user.id) === Number(userId));
    const fileDO = new FileEntity({
      id: fileEntity.id,
      users: alreadyOwned
        ? users
        : [...users, new UserEntity({ id: userId })],
    });
    await this.fileRepository.save(fileDO);
    const file = await this.fileRepository.findOne({
      where: { id: fileEntity.id, users: [{ id: userId }] },
    });
    if (!file) {
      throw new NotFoundException(`File not found with ID: ${fileEntity.id}`);
    }
    return file;
  }

  async uploadFile(createFileDto: CreateFileDto) {
    const { userId, filename, file, md5 } = createFileDto;

    const fileExists = await this.isFileExist(md5);
    if (fileExists) {
      return await this.saveUserFileQuickly(userId, fileExists);
    }
    const uploadsPath = this.getUploadsPath();

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const safeFilename = this.normalizeFilename(filename);
    const destinationPath = path.join(uploadsPath, safeFilename);
    // Save file to the uploads directory
    fs.writeFileSync(destinationPath, file.buffer);

    const relativePath = this.getRelativeUploadsPath(safeFilename);
    // Save file information to the database
    const fileEntity = this.fileRepository.create({
      users: [new UserEntity({ id: userId })],
      filename: safeFilename,
      filePath: relativePath,
      md5,
    });
    return await this.fileRepository.save(fileEntity);
  }

  async deleteFile(userId: number, filename: string) {
    const uploadsPath = this.getUploadsPath();
    const safeFilename = this.normalizeFilename(filename);
    const filePath = path.join(uploadsPath, safeFilename);

    // 先确认该文件确实属于当前用户，再执行删除
    const file = await this.fileRepository.findOne({
      where: { users: [{ id: userId }], filename: safeFilename },
    });
    if (!file) {
      throw new NotFoundException(`File not found: ${safeFilename}`);
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete file record from the database
    await this.fileRepository.remove(file);

    return "File deleted and record removed successfully";
  }
}
