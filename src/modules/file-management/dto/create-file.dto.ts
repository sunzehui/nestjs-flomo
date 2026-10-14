import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CreateFileDto {
  @IsNumber()
  userId: number;

  @IsString()
  filename: string;

  @IsDefined()
  file: Express.Multer.File;

  @IsString()
  md5: string;
}
