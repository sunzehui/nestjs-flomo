import { IsNotEmpty } from 'class-validator';

export class CreateStatisticDto {
  @IsNotEmpty()
  userId: string;
  @IsNotEmpty()
  articleId: string;
}
