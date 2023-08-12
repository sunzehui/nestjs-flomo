import { IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  userId: string;

  @IsString()
  filename: string;

  file: any;

  @IsString()
  md5: string;
}
