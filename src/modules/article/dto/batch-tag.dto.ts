import { IsArray, IsOptional, IsString } from "class-validator";

export class BatchTagDto {
  /** 待操作的 memo id 列表 */
  @IsArray()
  ids: Array<string | number>;

  /** 批量新增的标签名 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  add?: string[];

  /** 批量移除的标签名 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remove?: string[];
}
