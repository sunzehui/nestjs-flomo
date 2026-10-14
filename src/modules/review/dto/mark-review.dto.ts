import { IsArray, ArrayNotEmpty } from "class-validator";

export class MarkReviewDto {
  /** 本轮回顾已展示的 memo id */
  @IsArray()
  @ArrayNotEmpty()
  articleIds: Array<string | number>;
}
