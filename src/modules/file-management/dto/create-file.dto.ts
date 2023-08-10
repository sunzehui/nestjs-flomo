import { IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  userId: string;

  @IsString()
  filename: string;

  file: any
  // Add other properties as needed
}
