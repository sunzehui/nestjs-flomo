import { IsArray, ArrayNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSelectionDto {
  /** 分享标题，可选 */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  /** 要对外暴露的 memo id 列表 */
  @IsArray()
  @ArrayNotEmpty()
  articleIds: Array<string | number>;
}
