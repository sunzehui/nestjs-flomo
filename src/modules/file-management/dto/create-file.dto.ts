import { Type } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  userId: string;

  @IsString()
  filename: string;

  @IsDefined()
  file: Express.Multer.File;

  @IsString()
  md5: string;
}
